const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.cert('./test/logtest-demo-firebase-adminsdk-b246u-1df060c162.json'),
    databaseURL: 'https://logtest-demo.firebaseio.com',
});
const db = admin.firestore();
const FireStoreClient = require('../FireStoreClient');
const timestamp = admin.firestore.FieldValue.serverTimestamp();
const util = require('./util');
const projectID = 'logtest-demo';



describe('FireStoreClient', () => {
  let firestore;
  afterAll(() => {
    // Do cleanup tasks.
    test.cleanup();
  });

  beforeAll(async () => {
    let group = {
      preffix: 'Error:',
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
  });

  beforeEach(() => { 
    firestore = new FireStoreClient(db);
  });


  afterEach(async () => {
    // Reset the database.
    const colRef = db.collection('RawMessage');
    await util.deleteCollection(db, colRef, 500);
  });

  // afterAll(async () => {
  //   // Reset the database.
  //   const colRef = db.collection("TranslationGroup");
  //   await util.deleteCollection(db, colRef, 500);
  // });

  describe('#getMatchedTranslationGroup', () => {
    context('when the macthed translationGroup exists', () => {
      it('returns the matched translationGroup', async () => {
        const errorMsg = 'Error: This is test';
        return firestore.getMatchedTranslationGroup(errorMsg).then(response => {
          expect(response.preffix).toBe('Error:');
          expect(response.suffix).toBe('test');
        });
      });
    });
    context('when the macthed translationGroup does not exist', () => {
      it('returns empty object', async () => {
        const errorMsg = '111 is invalid';
        return firestore.getMatchedTranslationGroup(errorMsg).then(response => {
          expect(response).toEqual({});
        });
      });
    });
  });
  describe('#getTranslationTemplate', () => {
    let docId = '';
    beforeAll(async () => {
      let group = {
        preffix: 'ScriptParseError:',
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
      docId = writeResult.id;
      await db.collection('TranslationGroup').doc(docId).collection('Translations').add(sub);
    });
    context('when the macthed translation template exists', () => {
      it('returns the matched translation template', async () => {
        const locale = 'ja';
        return firestore.getTranslationTemplate(docId, locale).then(response => {
          expect(response.template).toBe('スクリプトエラーです。');
          expect(response.nextAction).toBe('値を確認してください。');
        });
      });
    });
    context('when the macthed translation template does not exist', () => {
      it('returns empty object', async () => {
        const locale = 'hoge';
        return firestore.getTranslationTemplate(docId, locale).then(response => {
          expect(response).toEqual({});
        });
      });
    });
  });
  describe('#saveRawMessage', () => {
    context('with valid params', () => {
      it('should save the raw message', async () => {
        let msg = {
          value: 'Error: hogehoge',
          locale: 'ja',
          translationGroupId: '1',
          createdAt: timestamp
        };
        const docId = await firestore.saveRawMessage(msg);
        return db.collection('RawMessage').doc(docId).get().then(response => {
          const data = response.data();
          expect(data.value).toBe('Error: hogehoge');
        });
      });
    });
  });
  describe('#updateRawMessage', () => {
    let docId = '';
    beforeEach(async () => {
      let msg = {
        value: 'Error: hogehoge',
        locale: 'ja',
        translationGroupId: '1',
        createdAt: timestamp
      };
      docId = await firestore.saveRawMessage(msg);
    });
    context('with valid docId', () => {
      it('should update the raw message', async () => {
        let msg = {
          value: 'Error: updated',
        };
        await firestore.updateRawMessage(docId, msg);
        
        return db.collection('RawMessage').doc(docId).get().then(response => {
          const data = response.data();
          expect(data.value).toBe('Error: updated');
        });
      });
    });
    context('with invalid docId', () => {
      it('should rejects with not found error', async () => {
        let docid = '111';
        let msg = {
          value: 'age',
        };
        await expect(firestore.updateRawMessage(docid, msg)).rejects.toThrow(`Error: 5 NOT_FOUND: No document to update: projects/${projectID}/databases/(default)/documents/RawMessage/111`);
      });
    });
  });
  describe('#getMatchedMsgIds', () => {
    beforeAll(async () => {
      let msg = {
        value: 'Error: This is test',
        locale: 'ja',
        translationGroupId: '1',
        createdAt: timestamp
      };
      for (let i = 0; i < 3; i++) { 
        await db.collection('RawMessage').add(msg);
      }
    });
    context('when the macthed message ids exist', () => {
      it('returns 3 message ids', async () => {
        const errorMsg = 'Error: This is test';
        return firestore.getMatchedMsgIds(errorMsg).then(response => {
          expect(response.length).toBe(3);
        });
      });
    });
    context('when the macthed message ids does not exist', () => {
      it('returns empty array', async () => {
        const errorMsg = 'dummy';
        return firestore.getMatchedMsgIds(errorMsg).then(response => {
          expect(response.length).toBe(0);
        });
      });
    });
  });
  describe('#getMatchedGroupId', () => {
    beforeAll(async () => {
      let msg = {
        value: 'Error: This is test',
        locale: 'ja',
        translationGroupId: '5jbwzfqwrrxr7gZvKgqC',
        createdAt: timestamp
      };
      await db.collection('RawMessage').add(msg);
    });
    context('when the matched translationGroupId is registered', () => {
      it('returns translationGroup id', async () => {
        const errorMsg = 'Error: This is test';
        return firestore.getMatchedGroupId(errorMsg).then(response => {
          expect(response).toBe('5jbwzfqwrrxr7gZvKgqC');
        });
      });
    });
    context('when the macthed translationGroupId is not registered', () => {
      it('returns blank', async () => {
        const errorMsg = 'dummy';
        return firestore.getMatchedGroupId(errorMsg).then(response => {
          expect(response).toBe('');
        });
      });
    });
  });

});
