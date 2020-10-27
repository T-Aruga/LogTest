import axios from 'axios';
// const HOST = 'https://asia-northeast1-honyaku-test-4ef30.cloudfunctions.net';
// Test enviroment
const HOST = 'http://localhost:5000/logtest-demo/asia-northeast1/translate';
const location = { 'hostname': 'localhost' }

function callTranslateFunction(sentence, locale) { 
  const hostname = location ? location.hostname : 'console.roboticcrowd.com'
  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: HOST + '/translate',
      headers: {'X-Original-Host': hostname},
      data: {
        body: sentence,
        locale: locale
      }
    }).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
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
