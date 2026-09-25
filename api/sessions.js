// Vercel Serverless Function — pwoksi pou /api/sessions (owner panel)
// Frontend rele: /api/sessions?server=1  avec header x-owner-password

const SERVERS = {
  1: process.env.SERVER1_URL || 'http://dobertonode.duckdns.org:3022',
  2: process.env.SERVER2_URL || 'https://dobertonode.duckdns.org:3002',
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-owner-password');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const server = String(req.query?.server || '1');
  const backendBase = SERVERS[server];
  const password = req.headers['x-owner-password'] || '';

  if (!backendBase) {
    res.status(400).json({ error: `Sèvè "${server}" pa egziste.` });
    return;
  }

  try {
    const backendRes = await fetch(`${backendBase}/api/sessions`, {
      headers: { 'x-owner-password': password },
    });
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error(`❌ Vercel proxy error (server ${server}):`, err.message);
    res.status(502).json({ error: `Pa kapab jwenn sèvè ${server} kounye a. Verifye li ap kouri.` });
  }
};
