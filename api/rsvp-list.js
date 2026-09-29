const { list } = require('../lib/vercel-blob-bundle.cjs');

const DATA_PATH = 'rsvps/confirmaciones.json';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const { key } = req.body || {};
  if (!key || !process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    res.status(401).json({ error: 'Clave incorrecta' });
    return;
  }

  try {
    const { blobs } = await list({ prefix: DATA_PATH });
    const match = blobs.find((blob) => blob.pathname === DATA_PATH);
    if (!match) {
      res.status(200).json({ rsvps: [] });
      return;
    }
    const dataRes = await fetch(match.url);
    const data = dataRes.ok ? await dataRes.json() : [];
    data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.status(200).json({ rsvps: data });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo cargar la lista' });
  }
};