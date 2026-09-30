const { put } = require('../lib/vercel-blob-bundle.cjs');

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
    await put(`rsvps/${Date.now()}.json`, JSON.stringify(entry), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: true
    });
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo guardar la confirmación' });
  }
};