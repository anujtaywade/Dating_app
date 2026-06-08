const admin = require("firebase-admin");
const serviceAccount = require("../../crosscampus-e184f-firebase-adminsdk-fbsvc-6405a805f4.json"); // adjust path if needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;