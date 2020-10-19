

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
        if (docs.length) { 
          docId = docs.slice(-1)[0].id;
          translationGroup = docs.slice(-1)[0].data();
        }
      })
      .catch(error => {
        throw new Error(error);
      });
    if (docId) result.docId = docId;
    Object.assign(result, translationGroup);
  
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
      })
      .catch(error => {
        throw new Error(error);
      });
    return translation;
  };

  async saveRawMessage(msgObj) {
    const writeResult = await this.db.collection('RawMessage').add(msgObj)
      .catch(error => {
        throw new Error(error);
      });
    return writeResult.id;
  };

  async updateRawMessage(msgId, msgObj) {
    await this.db.doc(`RawMessage/${msgId}`).update(msgObj)
      .catch(error => {
        throw new Error(error);
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
        throw new Error(error);
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
      })
      .catch(error => {
        throw new Error(error);
      });
    
    if (message.translationGroupId) groupId = message.translationGroupId;
    
    return groupId;
  };
}
