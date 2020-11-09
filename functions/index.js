const express = require("express");
const app = express();
const functions = require('firebase-functions');
const f = functions.region('asia-northeast1');
const Translator = require('./Translator');
const allowedCrossOrigin = ['http://localhost:3000', 'https://console.roboticcrowd.com', 'https://console.devk8s.com'];

app.use(function (req, res, next) {
  const origin = req.headers.origin;
  if (allowedCrossOrigin.indexOf(origin) > -1) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  }
  next();
});

app.options('*', function (req, res) {
  res.sendStatus(200);
});


app.post('/', async (req, res) => { 
  const body = req.body;
  const errorMsg = body.body;
  const locale = body.locale;
  if (!errorMsg || !locale) {
    return res.status(400).json({ "error": "body and locale are mandatory." });
  }
  const translator = new Translator;
  try {
    const response = await translator.translate(errorMsg, locale);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ "error": error.toString() });
  }
});

const translate = f.https.onRequest(app);
module.exports = { translate };

// module.exports.translate = f.https.onRequest(async (req, res) => {
//   // cors対策
//   const host = req['headers']['x-original-host'];
//   console.log(req['headers']['x-original-host']);
//   if (host === 'localhost') {
//     res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
//   } else if (host === 'console.roboticcrowd.com' || host === 'console.devk8s.com') {
//     res.set('Access-Control-Allow-Origin', 'https://' + host);
//   }
//   res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST');
//   if (req.method == "OPTIONS") {
//     cors(req, res, () => {
//       res.status(200).send()
//     });
//     return
//   }
//   const body = req.body;
//   const errorMsg = body.body;
//   const locale = body.locale;
//   if (!errorMsg || !locale) {
//     return res.status(400).json({ "error": "body and locale are mandatory." });
//   }
//   const translator = new Translator(errorMsg, locale);
//   try {
//     const response = await translator.translate();
//     res.status(200).json(response);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ "error": error.toString() });
//   }
// });
