import axios from 'axios';

function callTranslateFunction() { 
  return new Promise(resolve => { 
    axios({
      method: 'post',
      url: 'https://asia-northeast1-logtest-demo.cloudfunctions.net/translate',
      data: {
        body: 'This is Node.js test error',
        locale: 'ja'
      }
    }).then(response => {
      resolve(response.data)
    })

  })
}

export function translate(sentence, locale = 'ja') {
  return new Promise(resolve => {
    callTranslateFunction()
      .then(resData => {
        resolve(resData)
      })
  })
}

export function hello() {
  return 'hello'
}
