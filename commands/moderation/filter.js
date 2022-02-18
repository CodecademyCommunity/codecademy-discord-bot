const Filter = require('bad-words');
const RoleEnum = require('../../handlers/permissionHandlers.js').RoleEnum;

module.exports = {
  name: 'filter',
  description: 'filter a message',
  guildOnly: true,

  execute(msg) {
    if (RoleEnum[msg.member.roles.highest.name]) return;

    const profanity = new Filter();
    const spam = new Filter({emptyList: true});
    spam.addWords(...['nitro']);
    const content = convert(msg.content);
    const profane = profanity.isProfane(content);
    const spammed = spam.isProfane(content);

    if (spammed) {
      logMsg(msg, 'spam');
    } else if (profane) {
      logMsg(msg, 'profanity');
    }
  },
};

const logMsg = (msg, ctx) => {
  const logs = msg.guild.channels.cache.find(
    (channel) => channel.name === 'swear-jar'
  );

  if (logs) {
    const reply = `${msg.author}'s message in ${msg.channel} has been flagged for possible ${ctx}:\nhttps://discordapp.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}`;

    logs.send({content: reply});
  }
};

const convert = (sentence) => {
  const map = {
    '@': 'a',
    4: 'a',

    1: 'i',
    '|': 'i',
    '!': 'i',

    $: 's',
    0: 'o',
    7: 't',
    3: 'e',
  };

  sentence = sentence
    .split('')
    .map((char) => {
      return map[char] ? map[char] : char;
    })
    .join('');
  return sentence;
};
