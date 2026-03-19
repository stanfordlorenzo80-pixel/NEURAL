// Real Market Data Service — CoinGecko + Alpaca + Fallback
// In production (Vercel), API is at /api/... — in dev, falls back to localhost:3001
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');
const COINGECKO_DIRECT = 'https://api.coingecko.com/api/v3';

// Mapping: our symbol → coingecko id
const CRYPTO_MAP = {
  BTC: { id: 'bitcoin', name: 'Bitcoin' },
  ETH: { id: 'ethereum', name: 'Ethereum' },
  SOL: { id: 'solana', name: 'Solana' },
  DOGE: { id: 'dogecoin', name: 'Dogecoin' },
  ADA: { id: 'cardano', name: 'Cardano' },
  DOT: { id: 'polkadot', name: 'Polkadot' },
  LINK: { id: 'chainlink', name: 'Chainlink' },
  AVAX: { id: 'avalanche-2', name: 'Avalanche' },
};

const STOCK_DEFAULTS = {
  AAPL: { name: 'Apple Inc.', basePrice: 178.50, type: 'stock' },
  TSLA: { name: 'Tesla Inc.', basePrice: 245.00, type: 'stock' },
  NVDA: { name: 'NVIDIA Corp.', basePrice: 875.00, type: 'stock' },
  MSFT: { name: 'Microsoft Corp.', basePrice: 415.00, type: 'stock' },
  AMZN: { name: 'Amazon.com Inc.', basePrice: 185.00, type: 'stock' },
  GOOGL: { name: 'Alphabet Inc.', basePrice: 155.00, type: 'stock' },
  META: { name: 'Meta Platforms', basePrice: 505.00, type: 'stock' },
  AMD: { name: 'AMD Inc.', basePrice: 175.00, type: 'stock' },
};

let currentPrices = {};
let listeners = [];
let updateInterval = null;
let lastCryptoFetch = 0;
let cachedCryptoData = null;

// Simulate stock price movement for stocks when Alpaca isn't available
function simulateStockPrice(base) {
  const volatility = base * 0.001;
  return base + (Math.random() - 0.48) * volatility;
}

// Fetch real crypto prices from CoinGecko (directly, no backend needed)
async function fetchCryptoPrices() {
  const now = Date.now();
  // Rate limit: max once per 15 seconds
  if (cachedCryptoData && now - lastCryptoFetch < 15000) return cachedCryptoData;

  try {
    const ids = Object.values(CRYPTO_MAP).map(c => c.id).join(',');
    const url = `${COINGECKO_DIRECT}/coins/markets?vs_currency=usd&ids=${ids}&sparkline=true&price_change_percentage=1h,24h,7d`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    lastCryptoFetch = now;
    cachedCryptoData = data;
    return data;
  } catch (err) {
    console.warn('CoinGecko fetch failed, using cached/fallback:', err.message);
    return cachedCryptoData || [];
  }
}

// Fetch stock prices from backend (Alpaca) or simulate
async function fetchStockPrices() {
  try {
    const res = await fetch(`${API_BASE}/market?action=stocks`);
    const data = await res.json();
    if (data.available && data.data) return data;
  } catch {}
  return { available: false };
}

// Build unified price map
async function refreshPrices() {
  // Crypto — always real from CoinGecko
  const cryptoData = await fetchCryptoPrices();
  if (cryptoData && cryptoData.length > 0) {
    for (const coin of cryptoData) {
      const entry = Object.entries(CRYPTO_MAP).find(([, v]) => v.id === coin.id);
      if (entry) {
        const [symbol, meta] = entry;
        currentPrices[symbol] = {
          symbol,
          name: meta.name,
          price: coin.current_price,
          changePercent: coin.price_change_percentage_24h || 0,
          change24h: coin.price_change_24h || 0,
          high24h: coin.high_24h,
          low24h: coin.low_24h,
          marketCap: coin.market_cap,
          volume: coin.total_volume,
          sparkline: coin.sparkline_in_7d?.price || [],
          type: 'crypto',
          source: 'coingecko',
          image: coin.image,
        };
      }
    }
  }

  // Stocks — try Alpaca, fallback to simulation
  const stockData = await fetchStockPrices();
  for (const [symbol, meta] of Object.entries(STOCK_DEFAULTS)) {
    if (stockData.available && stockData.data?.[symbol]) {
      const snap = stockData.data[symbol];
      const latestPrice = snap.latestTrade?.p || snap.minuteBar?.c || meta.basePrice;
      const prevClose = snap.prevDailyBar?.c || meta.basePrice;
      currentPrices[symbol] = {
        symbol, name: meta.name,
        price: latestPrice,
        changePercent: ((latestPrice - prevClose) / prevClose) * 100,
        volume: snap.minuteBar?.v || Math.floor(Math.random() * 10000000),
        marketCap: latestPrice * 1e9,
        type: 'stock', source: 'alpaca',
      };
    } else {
      const prev = currentPrices[symbol]?.price || meta.basePrice;
      const price = simulateStockPrice(prev);
      const change = ((price - meta.basePrice) / meta.basePrice) * 100;
      currentPrices[symbol] = {
        symbol, name: meta.name,
        price, changePercent: change,
        volume: Math.floor(Math.random() * 50000000) + 5000000,
        marketCap: price * 2e9,
        type: 'stock', source: 'simulated',
      };
    }
  }

  listeners.forEach(fn => fn({ ...currentPrices }));
  return currentPrices;
}

// Generate historical data from sparkline or simulate
function getHistory(symbol, days = 30) {
  const asset = currentPrices[symbol];
  if (asset?.sparkline?.length > 0) {
    // Use real 7-day sparkline from CoinGecko
    const spark = asset.sparkline;
    const step = Math.max(1, Math.floor(spark.length / Math.min(days, spark.length)));
    const history = [];
    for (let i = 0; i < spark.length; i += step) {
      const d = new Date();
      d.setHours(d.getHours() - (spark.length - i));
      history.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), close: spark[i] });
    }
    return history;
  }

  // Fallback: simulated history
  const base = asset?.price || 100;
  const history = [];
  let price = base * (1 - (Math.random() * 0.15));
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    price += (Math.random() - 0.45) * base * 0.02;
    history.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), close: Math.max(price, base * 0.7) });
  }
  return history;
}

export const MarketDataService = {
  startUpdates: (intervalMs = 15000) => {
    // Initial fetch
    refreshPrices();
    updateInterval = setInterval(refreshPrices, Math.max(intervalMs, 10000));
    return () => { clearInterval(updateInterval); updateInterval = null; };
  },

  subscribe: (fn) => {
    listeners.push(fn);
    if (Object.keys(currentPrices).length > 0) fn({ ...currentPrices });
    return () => { listeners = listeners.filter(l => l !== fn); };
  },

  getCurrentPrices: () => ({ ...currentPrices }),
  getPrice: (symbol) => currentPrices[symbol] || null,
  getHistory,
  refreshNow: refreshPrices,
};
