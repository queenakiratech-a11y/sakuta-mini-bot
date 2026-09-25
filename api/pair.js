// Vercel Serverless Function — pwoksi ki rele youn nan 2 backend yo (Pterodactyl/Railway)
// Navigatè a (HTTPS sou Vercel) pa ka rele http://IP:PORT dirèkteman (mixed content bloke sa).
// Kidonk requête a pase la a:
// Browser (HTTPS) -> Vercel function (server-side, pa gen restriksyon) -> Backend (HTTP)
//
// Mete URL yo nan Vercel > Settings > Environment Variables:
//   SERVER1_URL = http://IP_1:PORT_1
//   SERVER2_URL = http://IP_2:PORT_2

const SERVERS = {
  1: process.env.SERVER1_URL || 'http://dobertonode.duckdns.org:3022',
  2: process.env.SERVER2_URL || 'http://dobertonode.duckdns.org:3002',
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const server = String(req.body?.server || '1');
  const backendBase = SERVERS[server];

  if (!backendBase) {
    res.status(400).json({ error: `Sèvè "${server}" pa egziste.` });
    return;
  }

  try {
    const phoneNumber = req.body?.phoneNumber || req.body?.phone;

    const backendRes = await fetch(`${backendBase}/api/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error(`❌ Vercel proxy error (server ${server}):`, err.message);
    res.status(502).json({ error: `Pa kapab jwenn sèvè ${server} kounye a. Verifye li ap kouri.` });
  }
};
