import axios from 'axios';

function callTranslateFunction(sentence, locale) { 
  return new Promise(resolve => { 
    axios({
      method: 'post',
      url: 'https://asia-northeast1-logtest-demo.cloudfunctions.net/translate',
      data: {
        body: sentence,
        locale: locale
      }
    }).then(response => {
      resolve(response.data)
    })

  })
}

export function translate(sentence, locale = 'ja') {
  return new Promise(resolve => {
    callTranslateFunction(sentence, locale)
      .then(resData => {
        resolve(resData)
      })
  })
}
