module.exports = async function handler(req, res) {
  const info = {
    node: process.version,
    hasBlobReadWriteToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    hasBlobStoreId: !!process.env.BLOB_STORE_ID,
    hasVercelOidcToken: !!process.env.VERCEL_OIDC_TOKEN,
    vercelEnv: process.env.VERCEL_ENV || null
  };

  let blobLib;
  try {
    blobLib = require('../lib/vercel-blob-bundle.cjs');
    info.blobPackageLoaded = true;
  } catch (err) {
    info.blobPackageLoaded = false;
    info.blobLoadError = String((err && err.message) || err);
    res.status(200).json(info);
    return;
  }

  try {
    const { blobs } = await blobLib.list({ prefix: 'rsvps/' });
    info.rsvpBlobCount = blobs.length;
    info.rsvpPathnames = blobs.map((b) => b.pathname);

    let okCount = 0;
    let failCount = 0;
    const failures = [];
    const shapes = [];
    for (const blob of blobs) {
      try {
        const r = await fetch(blob.url);
        if (!r.ok) {
          failCount++;
          failures.push({ pathname: blob.pathname, status: r.status });
          continue;
        }
        const data = await r.json();
        shapes.push({
          pathname: blob.pathname,
          isArray: Array.isArray(data),
          hasName: typeof data === 'object' && data !== null && 'name' in data,
          hasTimestamp: typeof data === 'object' && data !== null && 'timestamp' in data
        });
        okCount++;
      } catch (err) {
        failCount++;
        failures.push({ pathname: blob.pathname, error: String((err && err.message) || err) });
      }
    }
    info.rsvpParsedOk = okCount;
    info.rsvpParsedFail = failCount;
    info.rsvpFailures = failures;
    info.rsvpShapes = shapes;
  } catch (err) {
    info.rsvpListError = String((err && err.message) || err);
  }

  res.status(200).json(info);
};