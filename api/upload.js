const { put } = require('../lib/vercel-blob-bundle.cjs');

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Método no permitido' });
      return;
    }

    if (!Buffer.isBuffer(req.body)) {
      res.status(400).json({ error: 'Formato de imagen no reconocido' });
      return;
    }

    const rawName = req.headers['x-filename'] || 'foto.jpg';
    let filename;
    try {
      filename = decodeURIComponent(rawName).replace(/[^a-zA-Z0-9._-]/g, '_');
    } catch (err) {
      filename = String(rawName).replace(/[^a-zA-Z0-9._-]/g, '_');
    }
    if (!filename) filename = 'foto.jpg';

    const contentType = req.headers['content-type'] || 'application/octet-stream';

    const blob = await put(`fotos-mariana/${Date.now()}-${filename}`, req.body, {
      access: 'public',
      contentType,
      addRandomSuffix: true
    });
    res.status(200).json({ url: blob.url });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo subir la foto' });
  }
};