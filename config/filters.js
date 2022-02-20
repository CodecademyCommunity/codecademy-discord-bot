const Filter = require('bad-words');
const profanity = new Filter();
const spam = new Filter({emptyList: true});
spam.addWords(...['nitro']);

const map = new Map([
  ['@', 'a'],
  ['4', 'a'],

  ['1', 'i'],
  ['|', 'i'],
  ['!', 'i'],

  ['$', 's'],
  ['0', 'o'],
  ['7', 't'],
  ['3', 'e'],
]);

module.exports = {
  getProfanity: () => profanity,
  getSpam: () => spam,
  getMap: () => map,
};
