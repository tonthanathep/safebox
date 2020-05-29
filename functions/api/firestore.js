const admin = require('firebase-admin');
const serviceAccount = require('../serviceaccount.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const fStore = admin.firestore();
const fAuth = admin.auth();
const fMessage = admin.messaging();
const FieldValue = admin.firestore.FieldValue;

exports.FieldValue = FieldValue;
exports.fStore = fStore;
exports.fAuth = fAuth;
exports.fMessage = fMessage;