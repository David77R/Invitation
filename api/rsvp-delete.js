const { list, put } = require('../lib/vercel-blob-bundle.cjs');

const DATA_PATH = 'rsvps/confirmaciones.json';

async function readData() {
  try {
    const { blobs } = await list({ prefix: DATA_PATH });
    const match = blobs.find((blob) => blob.pathname === DATA_PATH);
    if (!match) return [];
    const res = await fetch(match.url);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const { key, timestamp } = req.body || {};
  if (!key || !process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    res.status(401).json({ error: 'Clave incorrecta' });
    return;
  }

  if (!timestamp) {
    res.status(400).json({ error: 'Falta identificar la confirmación' });
    return;
  }

  try {
    const data = await readData();
    const filtered = data.filter((entry) => entry.timestamp !== timestamp);
    await put(DATA_PATH, JSON.stringify(filtered), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true
    });
    res.status(200).json({ ok: true, rsvps: filtered });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo borrar la confirmación' });
  }
};