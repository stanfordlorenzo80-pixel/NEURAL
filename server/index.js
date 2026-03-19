import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// ========== REAL MARKET DATA (CoinGecko - free, no key) ==========
app.get('/api/market/crypto', async (req, res) => {
  try {
    const ids = 'bitcoin,ethereum,solana,dogecoin,cardano,polkadot,chainlink,avalanche-2';
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=1h,24h,7d`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`CoinGecko: ${response.status}`);
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/market/crypto/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const days = req.query.days || 30;
    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`CoinGecko: ${response.status}`);
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ALPACA BROKER ==========
const ALPACA_BASE = process.env.ALPACA_PAPER === 'true'
  ? 'https://paper-api.alpaca.markets'
  : 'https://api.alpaca.markets';
const ALPACA_DATA = 'https://data.alpaca.markets';

const alpacaHeaders = () => ({
  'APCA-API-KEY-ID': process.env.ALPACA_API_KEY || '',
  'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET_KEY || '',
  'Content-Type': 'application/json',
});

const alpacaReady = () => !!(process.env.ALPACA_API_KEY && process.env.ALPACA_SECRET_KEY);

app.get('/api/broker/status', (req, res) => {
  res.json({ connected: alpacaReady(), paper: process.env.ALPACA_PAPER === 'true' });
});

app.get('/api/broker/account', async (req, res) => {
  if (!alpacaReady()) return res.json({ connected: false });
  try {
    const r = await fetch(`${ALPACA_BASE}/v2/account`, { headers: alpacaHeaders() });
    if (!r.ok) throw new Error(`Alpaca: ${r.status}`);
    res.json({ connected: true, ...(await r.json()) });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

app.post('/api/broker/order', async (req, res) => {
  if (!alpacaReady()) return res.status(400).json({ error: 'Broker not connected' });
  try {
    const { symbol, qty, side, type = 'market', time_in_force = 'day' } = req.body;
    const r = await fetch(`${ALPACA_BASE}/v2/orders`, {
      method: 'POST', headers: alpacaHeaders(),
      body: JSON.stringify({ symbol, qty: String(qty), side, type, time_in_force }),
    });
    if (!r.ok) { const err = await r.json(); throw new Error(err.message || `Alpaca: ${r.status}`); }
    res.json(await r.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/broker/positions', async (req, res) => {
  if (!alpacaReady()) return res.json([]);
  try {
    const r = await fetch(`${ALPACA_BASE}/v2/positions`, { headers: alpacaHeaders() });
    res.json(await r.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/market/stocks', async (req, res) => {
  if (!alpacaReady()) return res.json({ available: false });
  try {
    const symbols = 'AAPL,TSLA,NVDA,MSFT,AMZN,GOOGL,META,AMD';
    const r = await fetch(`${ALPACA_DATA}/v2/stocks/snapshots?symbols=${symbols}`, { headers: alpacaHeaders() });
    if (!r.ok) throw new Error(`Alpaca data: ${r.status}`);
    res.json({ available: true, data: await r.json() });
  } catch (err) {
    res.status(500).json({ available: false, error: err.message });
  }
});

// ========== LEMONSQUEEZY PAYMENTS ==========
// LemonSqueezy uses checkout links — no server-side API needed for basic flow
// Users click checkout URL → pay on LemonSqueezy → redirect back
app.get('/api/payments/config', (req, res) => {
  res.json({
    provider: 'lemonsqueezy',
    proCheckoutUrl: process.env.LEMONSQUEEZY_PRO_URL || '',
    enterpriseCheckoutUrl: process.env.LEMONSQUEEZY_ENTERPRISE_URL || '',
    configured: !!(process.env.LEMONSQUEEZY_PRO_URL),
  });
});

// LemonSqueezy webhook to confirm payments
app.post('/api/payments/webhook', async (req, res) => {
  const event = req.body;
  if (event?.meta?.event_name === 'order_created') {
    const email = event.data?.attributes?.user_email;
    const product = event.data?.attributes?.first_order_item?.product_name;
    console.log(`✅ Payment received: ${email} → ${product}`);
  }
  res.sendStatus(200);
});

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    services: {
      alpaca: alpacaReady(),
      payments: !!(process.env.LEMONSQUEEZY_PRO_URL),
      coingecko: true,
    },
  });
});

// Serve static frontend in production
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(distPath, 'index.html'));
    }
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 NeuralTrade API on http://localhost:${PORT}`);
  console.log(`   Alpaca: ${alpacaReady() ? '✅ Connected' : '⚠️  No keys'}`);
  console.log(`   Payments: ${process.env.LEMONSQUEEZY_PRO_URL ? '✅ LemonSqueezy' : '⚠️  Demo mode'}`);
  console.log(`   CoinGecko: ✅ Free API\n`);
});
