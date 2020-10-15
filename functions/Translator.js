const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const timestamp = admin.firestore.FieldValue.serverTimestamp();
const FirestoreClient = require('./FireStoreClient');


module.exports = class Translator {
  constructor(msg, locale) {
    this.msg = msg;
    this.locale = locale;
  };

  async translate() {
    let response = {};
    const errorMsg = this.msg;
    const locale = this.locale;
    const rawMessage = {
      value: errorMsg,
      locale: locale,
      translationGroupId: "1",
      createdAt: timestamp
    };
    const firestore = new FirestoreClient(db);
    const matchedMessages  = await firestore.getMatchedRawMessages(errorMsg);

    if (matchedMessages.length) {
      const matchedTranslationGroupId = matchedMessages[0].translationGroupId;
      const translationData = await firestore.getTranslationTemplate(matchedTranslationGroupId, locale);
      response.result = `${translationData.template} ${translationData.nextAction}`;
      return response;
    }
    const translationGroup = await firestore.getMatchedTranslationGroup(errorMsg);

    const preffix = translationGroup.preffix;
    const suffix = translationGroup.suffix;
    const groupId = translationGroup.docId;

    if (errorMsg.startsWith(preffix) && errorMsg.endsWith(suffix)) {
      const translation = await firestore.getTranslationTemplate(groupId, locale);
      if (!translation) {
        firestore.saveRawMessage(rawMessage);
        response.result = errorMsg;
        return response;
      }
      const msgIds = await firestore.getMatchedMsgIds(errorMsg);
      msgIds.forEach(msgId => {
        firestore.updateRawMessage(msgId, { translationGroupId: groupId });
      });
      response.result = `${translation.template} ${translation.nextAction}`;
      
    } else {
      await firestore.saveRawMessage(rawMessage);
      response.result = errorMsg;
    }
    return response;
  }; 
}
