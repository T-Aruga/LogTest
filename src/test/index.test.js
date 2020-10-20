const hello = require('../index.mjs');


test('return hello', () => {
  expect(hello()).toBe('hello');
});
