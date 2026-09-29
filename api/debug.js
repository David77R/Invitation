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
    const { blobs } = await blobLib.list({ prefix: 'fotos-mariana/', limit: 1 });
    info.blobCallWorked = true;
    info.blobSample = blobs.length;
  } catch (err) {
    info.blobCallWorked = false;
    info.blobCallError = String((err && err.message) || err);
  }

  res.status(200).json(info);
};