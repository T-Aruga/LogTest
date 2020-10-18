const functions = require('firebase-functions');
const f = functions.region('asia-northeast1');
// const Translator = require('./Translator');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const FireStoreClient = require('./FireStoreClient');
const timestamp = admin.firestore.FieldValue.serverTimestamp();


// module.exports.translate = f.https.onRequest(async (req, res) => {
//   const errorMsg = req.body.body;
//   const locale = req.body.locale;
//   const translator = new Translator(errorMsg, locale);
//   try {
//     const response = await translator.translate();
//     res.status(200).json(response); 
//   } catch (error) {
//     res.status(500).json({ "error": error.toString() });
//   } 
// });

module.exports.testing = f.https.onRequest(async (req, res) => {
  let response = { "response": "OK!!!"};
  const msg = req.body.body;
  const locale = req.body.locale;
  const rawMessage = {
    value: msg,
    locale: locale,
    translationGroupId: "1",
    createdAt: timestamp
  };
  const firestore = new FireStoreClient(db);
  try {
    await firestore.saveMessage(rawMessage);
    res.status(200).json(response); 
  } catch (error) {
    res.status(500).json({ "error": error.toString() });
  } 
});


// Take the text parameter passed to this HTTP endpoint and insert it into
// Cloud Firestore under the path /messages/:documentId/original
module.exports.addMessage = f.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into Cloud Firestore using the Firebase Admin SDK.
  const writeResult = await admin.firestore().collection('messages').add({ original: original });
  // Send back a message that we've succesfully written the message
  res.status(200).json({result: `Message ${original} added.`});
});
