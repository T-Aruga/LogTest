const functions = require('firebase-functions');
const f = functions.region('asia-northeast1');
const cors = require('cors')({ origin: true });
const Translator = require('./Translator');



module.exports.translate = f.https.onRequest(async (req, res) => {
  // cors対策
  const host = req['headers']['x-original-host'];
  console.log(req['headers']['x-original-host']);
  if (host === 'localhost') {
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  } else if (host === 'console.roboticcrowd.com' || host === 'console.devk8s.com') {
    res.set('Access-Control-Allow-Origin', 'https://' + host);
  }
  res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST');
  if (req.method == "OPTIONS") {
    cors(req, res, () => {
      res.status(200).send()
    });
    return
  }
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
