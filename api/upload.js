import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const rawName = req.headers['x-filename'] || 'foto.jpg';
  const filename = decodeURIComponent(rawName).replace(/[^a-zA-Z0-9._-]/g, '_');
  const contentType = req.headers['content-type'] || 'application/octet-stream';

  if (!Buffer.isBuffer(req.body)) {
    res.status(400).json({ error: 'Formato de imagen no reconocido' });
    return;
  }

  try {
    const blob = await put(`fotos-mariana/${Date.now()}-${filename}`, req.body, {
      access: 'public',
      contentType,
      addRandomSuffix: true
    });
    res.status(200).json({ url: blob.url });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo subir la foto' });
  }
}