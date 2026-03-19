export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.json({
      provider: 'lemonsqueezy',
      proCheckoutUrl: process.env.LEMONSQUEEZY_PRO_URL || '',
      enterpriseCheckoutUrl: process.env.LEMONSQUEEZY_ENTERPRISE_URL || '',
      configured: !!(process.env.LEMONSQUEEZY_PRO_URL),
    });
  }

  // POST = webhook from LemonSqueezy
  if (req.method === 'POST') {
    const event = req.body;
    if (event?.meta?.event_name === 'order_created') {
      console.log(`✅ Payment: ${event.data?.attributes?.user_email}`);
    }
    return res.sendStatus(200);
  }

  res.status(405).end();
}
