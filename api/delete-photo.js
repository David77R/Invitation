const { del } = require('../lib/vercel-blob-bundle.cjs');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const { url } = req.body || {};
  if (!url || typeof url !== 'string' || !url.includes('fotos-mariana/')) {
    res.status(400).json({ error: 'Foto no válida' });
    return;
  }

  try {
    await del(url);
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo borrar la foto' });
  }
};