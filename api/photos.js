const { list } = require('../lib/vercel-blob-bundle.cjs');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    const { blobs } = await list({ prefix: 'fotos-mariana/' });
    const photos = blobs
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .map((blob) => blob.url);
    res.status(200).json({ photos });
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar las fotos' });
  }
};