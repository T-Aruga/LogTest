import { translate } from './fei18n.mjs';

const locale = 'ja'
const sentence = 'hogettyu'

translate(sentence, locale).then(res => {
  console.log('データ取得成功');
  console.log(res.result);
}).catch(err => {
  console.log('エラー大発生!');
  console.log(err);
})
