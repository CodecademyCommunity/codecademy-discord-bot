const RoleEnum = require('../../handlers/permissionHandlers.js').RoleEnum;
const Filters = require('../../config/filters.js');

module.exports = {
  name: 'filter',
  description: 'filter a message',
  guildOnly: true,

  execute(msg) {
    if (RoleEnum[msg.member.roles.highest.name]) return;

    const profanity = Filters.getProfanity();
    const spam = Filters.getSpam();
    const content = convert(msg.content);
    const isProfane = profanity.isProfane(content);
    const isSpam = spam.isProfane(content);

    if (isSpam) {
      logMsg(msg, 'spam');
    } else if (isProfane) {
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
  const map = Filters.getMap();

  sentence = sentence
    .split('')
    .map((char) => {
      return map.get(char) ? map.get(char) : char;
    })
    .join('');
  return sentence;
};
