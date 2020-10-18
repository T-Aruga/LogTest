

module.exports = class FireStoreClient {
  constructor(db) {
    this.db = db;
  };
  async getMatchedTranslationGroup(errorMsg) {
    let result = {};
    let translationGroup = {};
    let docId = "";
    await this.db.collection('TranslationGroup').where('preffix', '<=', errorMsg).orderBy('preffix').get()
      .then(querySnapshot => {
        const docs = querySnapshot.docs;
        docId = docs.slice(-1)[0].id;
        translationGroup = docs.slice(-1)[0].data();
      })
      .catch(error => {
        console.error(error);
      });
    result.docId = docId;
    Object.assign(result, translationGroup);
  
    return result;
  };

  async getTranslationTemplate(docId, locale) {
    let translation = {};
    await this.db.collection('TranslationGroup').doc(docId).collection('Translations').where('locale', '==', locale).get()
      .then(querySnapshot => {
        const docs = querySnapshot.docs;
        translation = docs[0].data();
      })
      .catch(error => {
        console.error(error);
      });
    return translation;
  };

  async saveRawMessage(msgObj) {
    this.db.collection('RawMessage').add(msgObj)
      .catch(error => {
        console.error(error);
      });
  };

  async saveMessage(msgObj) {
    await this.db.collection('Message').add(msgObj)
      .catch(error => {
        console.error(error);
      });
  };

  async updateRawMessage(msgId, msgObj) {
    this.db.doc(`RawMessage/${msgId}`).update(msgObj)
      .catch(error => {
        console.error(error);
      });
  };

  async getMatchedMsgIds(errorMsg) {
    let msgIds = [];
    await this.db.collection("RawMessage").where('value', '==', errorMsg).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          msgIds.push(doc.id);
        });
      })
      .catch(error => {
        console.error(error);
      });
    
    return msgIds;
  };

  async getMatchedRawMessages(errorMsg) {
    let messages = [];
    await this.db.collection("RawMessage").where('value', '==', errorMsg).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          messages.push(doc.data());
        });
      })
      .catch(error => {
        console.error(error);
      });
    
    return messages;
  };
}
