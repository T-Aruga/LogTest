let errMsg = 'this is 111 test error'
// let matcher = 'this is (.*) test error'
let template = 'これは ${val} テストエラーやで'
const matcherRegex = new RegExp(matcher)
let result = errMsg.match(matcherRegex)
if (result) {
  console.log(result[1])
  let matchStr = result[1]
  // const replaceRegex = new RegExp('\${(val)}')
  let response = template.replace(/\${(val)}/, matchStr)
  console.log(response);
} else {
  console.log("sinppai");
}
