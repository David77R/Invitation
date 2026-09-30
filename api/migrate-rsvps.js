const { list, put, copy, del } = require('../lib/vercel-blob-bundle.cjs');

const LEGACY_PATH = 'rsvps/confirmaciones.json';

module.exports = async function handler(req, res) {
  try {
    const { blobs } = await list({ prefix: LEGACY_PATH });
    const legacy = blobs.find((b) => b.pathname === LEGACY_PATH);

    if (!legacy) {
      res.status(200).json({ ok: true, migrated: 0, message: 'No había datos antiguos que migrar (ya migrado o no existe).' });
      return;
    }

    const r = await fetch(legacy.url);
    if (!r.ok) {
      res.status(500).json({ error: 'No se pudo leer el archivo antiguo' });
      return;
    }
    const data = await r.json();
    const entries = Array.isArray(data) ? data : [];

    let migrated = 0;
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object' || !entry.name) continue;
      const clean = {
        name: String(entry.name || '').slice(0, 100),
        attending: !!entry.attending,
        guests: String(entry.guests || '1').slice(0, 5),
        song: String(entry.song || '').slice(0, 200),
        message: String(entry.message || '').slice(0, 500),
        timestamp: entry.timestamp || new Date().toISOString()
      };
      await put(`rsvps/${Date.now()}-${migrated}.json`, JSON.stringify(clean), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: true
      });
      migrated++;
    }

    // Archive the legacy file (don't lose it) and remove it from the rsvps/ prefix
    // so it stops getting mixed in with the new per-guest files.
    await copy(LEGACY_PATH, `_archive/rsvps-legacy-${Date.now()}.json`, { access: 'public' });
    await del(legacy.url);

    res.status(200).json({ ok: true, migrated, totalInOldFile: entries.length });
  } catch (error) {
    res.status(500).json({ error: 'Error migrando', detail: String((error && error.message) || error) });
  }
};