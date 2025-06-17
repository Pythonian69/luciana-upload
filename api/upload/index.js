const {
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
  ContainerSASPermissions
} = require('@azure/storage-blob');

module.exports = async function (context, req) {
  const fileName = req.query.name;
  if (!fileName) {
    context.res = { status: 400, body: "name querystring required" };
    return;
  }

  const conn = process.env.BLOB_CONNECTION_STRING || process.env.AzureWebJobsStorage;
  const accountName = /AccountName=([^;]+)/.exec(conn)[1];
  const accountKey = /AccountKey=([^;]+)/.exec(conn)[1];

  const cred = new StorageSharedKeyCredential(accountName, accountKey);
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h
  const sas = generateBlobSASQueryParameters({
    containerName: 'uploads',
    blobName: fileName,
    permissions: ContainerSASPermissions.parse("c"),
    expiresOn: expires
  }, cred).toString();

  const url = `https://${accountName}.blob.core.windows.net/uploads/${encodeURIComponent(fileName)}?${sas}`;
  context.res = { status: 200, body: { url } };
};
