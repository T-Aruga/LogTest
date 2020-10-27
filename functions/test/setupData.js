const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.cert('functions/test/logtest-demo-firebase-adminsdk-b246u-1df060c162.json'),
    databaseURL: 'https://logtest-demo.firebaseio.com',
});
const db = admin.firestore();
const colRef = db.collection('RawMessage');
const batchSize = 500;
const translationgroup = require('./TranslationGroup');
const timestamp = admin.firestore.FieldValue.serverTimestamp();


module.exports.deleteCollection = () => {
  const query = colRef.orderBy('__name__').limit(batchSize);
  return new Promise((resolve, reject) => {
      deleteQueryBatch(db, query, batchSize, resolve, reject);
  });
}

module.exports.createTranslationGroup = async () => {
  translationgroup.forEach(group => {
    db.collection('TranslationGroup').add(group);
  });
}

module.exports.createTranslation = async (TranslationGroup, Translation) => { 
  const writeResult = await db.collection('TranslationGroup').add(TranslationGroup);
  const docId = writeResult.id;
  await db.collection('TranslationGroup').doc(docId).collection('Translations').add(Translation);
};

module.exports.createTestData = async () => {
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
}

//削除のメインコード
const deleteQueryBatch = (db, query, batchSize, resolve, reject) => {
  query.get()
      .then((snapshot) => {

           //検索結果が0件なら処理終わり
          if (snapshot.size == 0) {
              return 0;
          }

           //削除のメイン処理
          const batch = db.batch();
          snapshot.docs.forEach(doc => {
              batch.delete(doc.ref);
          });

           //一旦処理サイズをreturn
          return batch.commit().then(() => {
              return snapshot.size;
          })
      })
      .then((numDeleted) => {

           //もう対象のデータが0なら処理終わり
          if (numDeleted == 0) {
              resolve();
              return;
          }

           //あだあるなら、再度処理
          process.nextTick(() => {
              deleteQueryBatch(db, query, batchSize, resolve, reject);
          });
      })
      .catch(reject);
}
