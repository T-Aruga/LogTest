const admin = require('firebase-admin');
admin.initializeApp();
const timestamp = admin.firestore.FieldValue.serverTimestamp();
const FireStoreClient = require('./FireStoreClient');


module.exports = class Translator {

  async translate(msg, locale) {
    let response = {};
    const errorMsg = msg;
    const rawMessage = {
      value: errorMsg,
      locale: locale,
      translationGroupId: null,
      createdAt: timestamp
    };
    const firestore = new FireStoreClient;
    const matchedTranslationGroupId = await firestore.getMatchedGroupId(errorMsg);
    // console.log('matchedTranslationGroupId: ', matchedTranslationGroupId);
    // let tem = 'これは ${val} テストエラーやで'
    // let matcher = 'this is (.*) test error'
    // this._parseTemplate(errorMsg, matcher, tem)

    if (matchedTranslationGroupId) {
      const translationData = await firestore.getTranslationTemplate(matchedTranslationGroupId, locale);
      response.result = `${translationData.template} ${translationData.nextAction}`;
      return response;
    }
    const translationGroup = await firestore.getMatchedTranslationGroup(errorMsg);

    const prefix = translationGroup.prefix;
    const suffix = translationGroup.suffix;
    const groupId = translationGroup.docId;

    if (errorMsg.startsWith(prefix) && errorMsg.endsWith(suffix)) {
      const translation = await firestore.getTranslationTemplate(groupId, locale);
      if (!Object.keys(translation).length) {
        firestore.saveRawMessage(rawMessage);
        response.result = errorMsg;
        return response;
      }
      const msgIds = await firestore.getMatchedMsgIds(errorMsg);
      msgIds.forEach(msgId => {
        firestore.updateRawMessage(msgId, { translationGroupId: groupId });
      });
      response.result = `${translation.template} ${translation.nextAction}`;
      return response;
      
    } else {
      await firestore.saveRawMessage(rawMessage);
      response.result = errorMsg;
      return response;
    }
  }; 

  _parseTemplate(errMsg, matcher, template) {
    const matcherRegex = new RegExp(matcher);
    const matchResult = errMsg.match(matcherRegex);
    if (matchResult) {
      console.log(matchResult[1])
      const matchStr = matchResult[1]
      const convertedTemplate = template.replace(/\${(val)}/, matchStr);
      console.log(convertedTemplate);
      return convertedTemplate
    } else {
      console.log("Failed!!!");
      return template
    }        
  };
}
