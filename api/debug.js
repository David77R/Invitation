module.exports = function handler(req, res) {
  const info = {
    node: process.version,
    hasBlobReadWriteToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    hasBlobStoreId: !!process.env.BLOB_STORE_ID,
    hasVercelOidcToken: !!process.env.VERCEL_OIDC_TOKEN,
    vercelEnv: process.env.VERCEL_ENV || null
  };

  try {
    require('@vercel/blob');
    info.blobPackageLoaded = true;
  } catch (err) {
    info.blobPackageLoaded = false;
    info.blobLoadError = String(err && err.message || err);
  }

  res.status(200).json(info);
};