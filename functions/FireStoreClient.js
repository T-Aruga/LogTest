const admin = require('firebase-admin');
const db = admin.firestore();


module.exports = class FireStoreClient {
  constructor() {
    this.db = db;
  };
  async getMatchedTranslationGroup(errorMsg) {
    let result = {};
    await this.db.collection('TranslationGroup').where('prefix', '<=', errorMsg).orderBy('prefix').get()
      .then(querySnapshot => {
        const docs = querySnapshot.docs;
        if (docs.length) {
          result = docs.slice(-1)[0].data();
          result.docId = docs.slice(-1)[0].id;
        }
      });
    
    return result;
  };

  async getTranslationTemplate(docId, locale) {
    let translation = {};
    await this.db.collection('TranslationGroup').doc(docId).collection('Translations').where('locale', '==', locale).get()
      .then(querySnapshot => {
        const docs = querySnapshot.docs;
        if (docs.length) {
          translation = docs[0].data();
        }
      });
    
    return translation;
  };

  async saveRawMessage(msgObj) {
    const writeResult = await this.db.collection('RawMessage').add(msgObj);
    return writeResult.id;
  };

  async updateRawMessage(msgId, msgObj) {
    await this.db.doc(`RawMessage/${msgId}`).update(msgObj);
  };

  async getMatchedMsgIds(errorMsg) {
    let msgIds = [];
    await this.db.collection("RawMessage").where('value', '==', errorMsg).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          msgIds.push(doc.id);
        });
      });
    
    return msgIds;
  };

  async getMatchedGroupId(errorMsg) {
    let message = {};
    let groupId = '';
    await this.db.collection("RawMessage").where('value', '==', errorMsg).get()
      .then(querySnapshot => {
        const docs = querySnapshot.docs;
        if (docs.length) {
          message = docs[0].data();
        }
      });
    if (message.translationGroupId) groupId = message.translationGroupId;
    
    return groupId;
  };
}
