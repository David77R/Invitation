const { list, put } = require('@vercel/blob');

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

  const body = req.body || {};
  const entry = {
    name: String(body.name || '').slice(0, 100),
    attending: !!body.attending,
    guests: String(body.guests || '1').slice(0, 5),
    song: String(body.song || '').slice(0, 200),
    message: String(body.message || '').slice(0, 500),
    timestamp: new Date().toISOString()
  };

  if (!entry.name) {
    res.status(400).json({ error: 'Falta el nombre' });
    return;
  }

  try {
    const data = await readData();
    data.push(entry);
    await put(DATA_PATH, JSON.stringify(data), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true
    });
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo guardar la confirmación' });
  }
};