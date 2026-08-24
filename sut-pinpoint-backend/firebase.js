const path = require('path');
const { Firestore } = require('@google-cloud/firestore');
const serviceAccount = require(path.resolve(__dirname, 'serviceAccountKey.json'));

const db = new Firestore({
  projectId: serviceAccount.project_id,
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key
  }
});

module.exports = db;