export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const alpacaReady = !!(process.env.ALPACA_API_KEY && process.env.ALPACA_SECRET_KEY);
  res.json({
    status: 'ok',
    services: {
      alpaca: alpacaReady,
      payments: !!(process.env.LEMONSQUEEZY_PRO_URL),
      coingecko: true,
    },
  });
}
