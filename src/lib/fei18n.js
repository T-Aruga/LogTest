import axios from 'axios';
// const HOST = 'https://asia-northeast1-honyaku-test-4ef30.cloudfunctions.net';
// Test enviroment
const HOST = 'http://localhost:5000/logtest-demo/asia-northeast1';

function callTranslateFunction(sentence, locale) { 
  return axios({
    method: 'post',
    url: HOST + '/translate',
    data: {
      body: sentence,
      locale: locale
    }
  }).then(response => {
    return response.data
  })
}

export function translate(sentence, locale = 'ja') {
  return new Promise((resolve, reject) => {
    callTranslateFunction(sentence, locale)
      .then(resData => {
        resolve(resData)
      }).catch(error => {
        reject(error)
      })
  })
}
