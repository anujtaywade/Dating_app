const admin = require("firebase-admin");
const path = require("path");

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_PATH is not configured");
}

const serviceAccount = require(path.resolve(__dirname, "../../", serviceAccountPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
