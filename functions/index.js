const functions = require('firebase-functions');
const f = functions.region('asia-northeast1');
const Translator = require('./Translator');


module.exports.translate = f.https.onRequest(async (req, res) => {
  const body = req.body;
  const errorMsg = body.body;
  const locale = body.locale;
  if (!errorMsg || !locale) {
    return res.status(400).json({ "error": "body and locale are mandatory." });
  }
  const translator = new Translator(errorMsg, locale);
  try {
    const response = await translator.translate();
    res.status(200).json(response); 
  } catch (error) {
    console.log(error);
    res.status(500).json({ "error": error.toString() });
  } 
});
