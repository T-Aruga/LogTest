const functions = require('firebase-functions');
const f = functions.region('asia-northeast1');
const Translator = require('./Translator');


module.exports.translate = f.https.onRequest(async (req, res) => {
  const errorMsg = req.body.body;
  const locale = req.body.locale;
  const translator = new Translator(errorMsg, locale);
  try {
    const response = await translator.translate();
    res.status(200).json(response); 
  } catch (error) {
    res.status(500).json({ "error": error.toString() });
  } 
});
