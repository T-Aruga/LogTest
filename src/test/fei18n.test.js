import { translate } from '../lib/fei18n.js';
const batch = require('../../functions/test/setupData');

describe('#translate', () => {

  beforeAll(async () => {
    await batch.createTestData();
    await batch.createTranslationGroup();
  });

  afterEach(async () => {
    // Reset the database.
    await batch.deleteCollection();
  });

  context('when the matched translationGroupId is registered', () => { 
    it('returns the translation template', async () => {
      const errorMsg = 'Error: This is test';
      const locale = 'ja';
      return translate(errorMsg, locale).then(response => {
        expect(response.result).toBe('これはテストエラーです。 CSに連絡してください。');
      });
    });
  });
  context('when the matched translationGroupId is not registered', () => {
    context('when the matched translationGroup does not exist', () => {
      it('returns the raw error message', async () => {
        const errorMsg = 'Error: hogehoge';
        const locale = 'ja';
        return translate(errorMsg, locale).then(response => {
          expect(response.result).toBe('Error: hogehoge');
        });
      });
    });
    context('when the translation template does not exist', () => {
      it('returns the raw error message', async () => {
        const errorMsg = 'Error: fugafuga';
        const locale = 'ja';
        return translate(errorMsg, locale).then(response => {
          expect(response.result).toBe('Error: fugafuga');
        });
      });
    });
    context('when the translation template exists', () => {
      beforeAll(async () => {
        let group = {
          prefix: 'ScriptParseError:',
          suffix: 'test',
          createdAt: new Date('2020-02-10 12:00:00')
        };
        let sub = {
          locale: 'ja',
          template: 'スクリプトエラーです。',
          nextAction: '値を確認してください。',
          createdAt: new Date('2020-02-10 12:00:00')
        };
        await batch.createTranslation(group, sub);
      });
      it('returns the translation template', async () => {
        const errorMsg = 'ScriptParseError: This is test';
        const locale = 'ja';
        return translate(errorMsg, locale).then(response => {
          expect(response.result).toBe('スクリプトエラーです。 値を確認してください。');
        });
      });
    });
  });
  context('when request body is blank', () => {
    it('throws error 400', async () => { 
      const errorMsg = '';
      const locale = '';
      await expect(translate(errorMsg, locale)).rejects.toThrow('Request failed with status code 400');
    });
  });
    
});
