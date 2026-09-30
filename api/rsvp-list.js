const { list } = require('../lib/vercel-blob-bundle.cjs');

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
    const { blobs } = await list({ prefix: 'rsvps/' });
    const results = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const r = await fetch(blob.url);
          if (!r.ok) return null;
          const data = await r.json();
          data.url = blob.url;
          return data;
        } catch (err) {
          return null;
        }
      })
    );
    const rsvps = results
      .filter(Boolean)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.status(200).json({ rsvps });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo cargar la lista' });
  }
};