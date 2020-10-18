// const admin = require('firebase-admin');
// admin.initializeApp({
//     credential: admin.credential.cert("./test/logtest-demo-firebase-adminsdk-b246u-1df060c162.json"),
//     databaseURL: 'https://logtest-demo.firebaseio.com',
// });

//firebaseのサイトにあるコード（少し改修）
module.exports.deleteCollection = (db, collectionRef, batchSize) => {
  const query = collectionRef.orderBy('__name__').limit(batchSize);
  return new Promise((resolve, reject) => {
      deleteQueryBatch(db, query, batchSize, resolve, reject);
  });
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



//実行
// const colRef = db.collection("members");
// deleteCollection(db, colRef, 500);
