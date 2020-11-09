const admin = require('firebase-admin');
const projectConfig = {
  projectId: 'logtest-demo',
  databaseURL: process.env.TEST_DATABASE_URL
};
const test = require('firebase-functions-test')(projectConfig, './test/logtest-demo-firebase-adminsdk-b246u-1df060c162.json');
const Translator = require('../Translator');
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
      prefix: 'Error:',
      suffix: 'test',
      createdAt: timestamp
    };
    let sub = {
      locale: 'ja',
      template: 'これはテストエラーです。',
      nextAction: 'CSに連絡してください。',
      createdAt: timestamp
    };
    const writeResult = await db.collection('TranslationGroup').add(group);
    const docId = writeResult.id;
    await db.collection('TranslationGroup').doc(docId).collection('Translations').add(sub);
    let msg = {
      value: 'Error: This is test',
      locale: 'ja',
      translationGroupId: docId,
      createdAt: timestamp
    };
    await db.collection('RawMessage').add(msg);
    await util.createTranslationGroup(db);
  });

  afterEach(async () => {
    // Reset the database.
    const colRef = db.collection('RawMessage');
    await util.deleteCollection(db, colRef, 500);
  });


  context('when the matched translationGroupId is registered', () => {
    it('returns the translation template', async () => {
      const errorMsg = 'Error: This is test';
      const locale = 'ja';
      const translator = new Translator(errorMsg, locale);

      return translator.translate(errorMsg, locale).then(response => {
        expect(response.result).toBe('これはテストエラーです。 CSに連絡してください。');
      });
    });
  });
  context('when the matched translationGroupId is not registered', () => {
    context('when the matched translationGroup does not exist', () => { 
      it('returns the raw error message', async () => {
        const errorMsg = 'Error: hogehoge';
        const locale = 'ja';
        const translator = new Translator(errorMsg, locale);

        return translator.translate(errorMsg, locale).then(response => {
          expect(response.result).toBe('Error: hogehoge');
        });
      });
    });
    context('when the translation template does not exist', () => { 
      it('returns the raw error message', async () => {
        const errorMsg = 'Error: fugafuga';
        const locale = 'ja';
        const translator = new Translator(errorMsg, locale);

        return translator.translate(errorMsg, locale).then(response => {
          expect(response.result).toBe('Error: fugafuga');
        });
      });
    });
    context('when the translation template exists', () => {
      beforeAll(async () => { 
        let group = {
          prefix: 'ScriptParseError:',
          suffix: 'test',
          createdAt: timestamp
        };
        let sub = {
          locale: 'ja',
          template: 'スクリプトエラーです。',
          nextAction: '値を確認してください。',
          createdAt: timestamp
        };
        const writeResult = await db.collection('TranslationGroup').add(group);
        const docId = writeResult.id;
        await db.collection('TranslationGroup').doc(docId).collection('Translations').add(sub);
      });
      it('returns the translation template', async () => {
        const errorMsg = 'ScriptParseError: This is test';
        const locale = 'ja';
        const translator = new Translator(errorMsg, locale);

        return translator.translate(errorMsg, locale).then(response => {
          expect(response.result).toBe('スクリプトエラーです。 値を確認してください。');
        });
      });
    });
  });

});
