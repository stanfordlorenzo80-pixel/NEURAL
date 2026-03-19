export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query; // /api/market?action=crypto|stocks|history&id=bitcoin&days=30

  try {
    if (!action || action === 'crypto') {
      const ids = 'bitcoin,ethereum,solana,dogecoin,cardano,polkadot,chainlink,avalanche-2';
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=1h,24h,7d`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`CoinGecko: ${r.status}`);
      return res.json(await r.json());
    }

    if (action === 'history') {
      const id = req.query.id || 'bitcoin';
      const days = req.query.days || 30;
      const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`CoinGecko: ${r.status}`);
      return res.json(await r.json());
    }

    if (action === 'stocks') {
      const ready = !!(process.env.ALPACA_API_KEY && process.env.ALPACA_SECRET_KEY);
      if (!ready) return res.json({ available: false });
      const symbols = 'AAPL,TSLA,NVDA,MSFT,AMZN,GOOGL,META,AMD';
      const r = await fetch(`https://data.alpaca.markets/v2/stocks/snapshots?symbols=${symbols}`, {
        headers: {
          'APCA-API-KEY-ID': process.env.ALPACA_API_KEY,
          'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET_KEY,
        },
      });
      if (!r.ok) throw new Error(`Alpaca: ${r.status}`);
      return res.json({ available: true, data: await r.json() });
    }

    res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
