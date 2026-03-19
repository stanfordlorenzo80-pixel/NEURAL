import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// ========== REAL MARKET DATA (CoinGecko - free, no key) ==========
app.get('/api/market/crypto', async (req, res) => {
  try {
    const ids = 'bitcoin,ethereum,solana,dogecoin,cardano,polkadot,chainlink,avalanche-2';
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=1h,24h,7d`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`CoinGecko error: ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Crypto data error:', err.message);
    res.status(500).json({ error: 'Failed to fetch crypto data', message: err.message });
  }
});

app.get('/api/market/crypto/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const days = req.query.days || 30;
    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`CoinGecko error: ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history', message: err.message });
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
  if (!alpacaReady()) return res.json({ connected: false, error: 'No API keys configured' });
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
      method: 'POST',
      headers: alpacaHeaders(),
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
    if (!r.ok) throw new Error(`Alpaca: ${r.status}`);
    res.json(await r.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/broker/orders', async (req, res) => {
  if (!alpacaReady()) return res.json([]);
  try {
    const r = await fetch(`${ALPACA_BASE}/v2/orders?status=all&limit=50`, { headers: alpacaHeaders() });
    if (!r.ok) throw new Error(`Alpaca: ${r.status}`);
    res.json(await r.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stock quotes via Alpaca data API
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

// ========== STRIPE PAYMENTS ==========
const stripeReady = () => !!process.env.STRIPE_SECRET_KEY;
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  const Stripe = (await import('stripe')).default;
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

app.post('/api/stripe/checkout', async (req, res) => {
  if (!stripeReady() || !stripe) {
    return res.json({ url: null, demo: true, message: 'Stripe not configured — plan activated in demo mode' });
  }
  try {
    const { plan, username } = req.body;
    const priceId = plan === 'pro' ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_ENTERPRISE;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout`,
      metadata: { username, plan },
    });
    res.json({ url: session.url, demo: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.sendStatus(400);
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log(`✅ Payment success: ${session.metadata.username} → ${session.metadata.plan}`);
    }
    res.sendStatus(200);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    services: {
      alpaca: alpacaReady(),
      stripe: stripeReady(),
      coingecko: true,
    },
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 NeuralTrade API running on http://localhost:${PORT}`);
  console.log(`   Alpaca: ${alpacaReady() ? '✅ Connected' : '⚠️  No API keys (paper mode only)'}`);
  console.log(`   Stripe: ${stripeReady() ? '✅ Ready' : '⚠️  No key (demo mode)'}`);
  console.log(`   CoinGecko: ✅ Free API (no key needed)\n`);
});
