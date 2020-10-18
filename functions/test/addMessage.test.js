// Chai is a commonly used library for creating unit test suites. It is easily extended with plugins.
// const chai = require('chai');
// const assert = chai.assert;

// Sinon is a library used for mocking or verifying function calls in JavaScript.
const sinon = require('sinon');
const axios = require('axios');

const admin = require('firebase-admin');
// Require and initialize firebase-functions-test in "online mode" with your project's
// credentials and service account key.
const projectConfig = {
  projectId: 'logtest-demo',
  databaseURL: 'https://logtest-demo.firebaseio.com'
};
const test = require('firebase-functions-test')(projectConfig, './test/logtest-demo-firebase-adminsdk-b246u-1df060c162.json');

describe('Cloud Functions', () => {
  let myFunctions;

  beforeAll(() => {
    myFunctions = require('../index');
  });

  afterAll(() => {
    // Do cleanup tasks.
    test.cleanup();
    // Reset the database.
    // admin.database().ref('messages').remove();
  });

  
  describe('addMessage', () => {
    it('should write it to /messages', async (done) => {
      // A fake request object, with req.query.text set to 'input'
    const req = { query: { text: 'inputssssss' } };
      
    const res = {
      status: (code) => {
        expect(code).toBe(200);
        return { json: (res) => {
          expect(res.result).toBe("Message inputssssss added.");
          done();
        } }
      }
    };
      
      myFunctions.addMessage(req, res);
    });
  });
})
