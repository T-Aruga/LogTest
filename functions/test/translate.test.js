// Chai is a commonly used library for creating unit test suites. It is easily extended with plugins.
// const chai = require('chai');
// const assert = chai.assert;

// Sinon is a library used for mocking or verifying function calls in JavaScript.
// const sinon = require('sinon');

const admin = require('firebase-admin');

// Require and initialize firebase-functions-test in "online mode" with your project's
// credentials and service account key.
const projectConfig = {
  projectId: 'logtest-demo',
  databaseURL: 'https://logtest-demo.firebaseio.com'
};
const test = require('firebase-functions-test')(projectConfig, './test/logtest-demo-firebase-adminsdk-b246u-1df060c162.json');
const myFunctions = require('../index');
const db = admin.firestore();
const timestamp = admin.firestore.FieldValue.serverTimestamp();
const util = require('./util');

describe('#Translate', () => {

  afterAll(() => {
    // Do cleanup tasks.
    test.cleanup();
  });

  beforeAll(async () => {
    let group = {
      preffix: "Error:",
      suffix: "test",
      createdAt: timestamp
    };
    let sub = {
      locale: "ja",
      template: "これはテストエラーです。",
      nextAction: "CSに連絡してください。",
      createdAt: timestamp
    };
    const writeResult = await db.collection('TranslationGroup').add(group);
    const docId = writeResult.id;
    await db.collection('TranslationGroup').doc(docId).collection("Translations").add(sub);
    let msg = {
      value: "Error: This is test",
      locale: "ja",
      translationGroupId: docId,
      createdAt: timestamp
    };
    await db.collection('RawMessage').add(msg);
  });

  afterEach(async () => {
    // Reset the database.
    const colRef = db.collection("RawMessage");
    await util.deleteCollection(db, colRef, 500);
  });

  // afterAll(async () => {
  //   // Reset the database.
  //   const colRef = db.collection("TranslationGroup");
  //   await util.deleteCollection(db, colRef, 500);
  // });


  context('when the matched translationGroupId is registered', () => {
    it('returns the translation template', async (done) => {
      const req = { body: { body: 'Error: This is test', locale: 'ja' } };
      
      const res = {
        status: (code) => {
          expect(code).toBe(200);
          return {
            json: (res) => {
              expect(res.result).toBe("これはテストエラーです。 CSに連絡してください。");
              done();
            }
          }
        }
      };
      
      myFunctions.translate(req, res);
    });
  });
  context('when the matched translationGroupId is not registered', () => {
    context('when the matched translationGroup does not exist', () => { 
      it('returns the raw error message', async (done) => {
        const req = { body: { body: 'Error: hogehoge', locale: 'ja' } };
        
        const res = {
          status: (code) => {
            expect(code).toBe(200);
            return {
              json: (res) => {
                expect(res.result).toBe("Error: hogehoge");
                done();
              }
            }
          }
        };
        
        myFunctions.translate(req, res);
      });
    });
    context('when the translation template does not exist', () => { 
      it('returns the raw error message', async (done) => {
        const req = { body: { body: 'Error: fugafuga', locale: 'ja' } };
        
        const res = {
          status: (code) => {
            expect(code).toBe(200);
            return {
              json: (res) => {
                expect(res.result).toBe("Error: fugafuga");
                done();
              }
            }
          }
        };
        
        myFunctions.translate(req, res);
      });
    });
    context('when the translation template exists', () => {
      beforeAll(async () => { 
        let group = {
          preffix: "ScriptParseError:",
          suffix: "test",
          createdAt: timestamp
        };
        let sub = {
          locale: "ja",
          template: "スクリプトエラーです。",
          nextAction: "値を確認してください。",
          createdAt: timestamp
        };
        const writeResult = await db.collection('TranslationGroup').add(group);
        const docId = writeResult.id;
        await db.collection('TranslationGroup').doc(docId).collection("Translations").add(sub);
      });
      it('returns the translation template', async (done) => {
        const req = { body: { body: 'ScriptParseError: This is test', locale: 'ja' } };
        
        const res = {
          status: (code) => {
            expect(code).toBe(200);
            return {
              json: (res) => {
                expect(res.result).toBe("スクリプトエラーです。 値を確認してください。");
                done();
              }
            }
          }
        };
        
        myFunctions.translate(req, res);
      });
    });
    
  });
  context('when request body is blank', () => {
    it('throws error 400', async (done) => {
      const req = { body: '' };
      
      const res = {
        status: (code) => {
          expect(code).toBe(400);
          return {
            json: (res) => {
              expect(res.error).toBe("body and locale are mandatory.");
              done();
            }
          }
        }
      };
      
      myFunctions.translate(req, res);
    });
  });

});
