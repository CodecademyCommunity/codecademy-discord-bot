const Filter = require('bad-words');

module.exports = {
  name: 'filter',
  description: 'filter a message',
  guildOnly: true,

  execute(msg) {
    if (isHighRoller(msg)) return;
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
    let reply = `${msg.author}'s message in ${msg.channel} has been flagged for possible ${ctx}:\nhttps://discordapp.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}`;

    logs.send({content: reply});
  }
};


const isHighRoller = (msg) => {
  return msg.member.roles.cache.some(
    (role) =>
      role.name === 'Forums Super User' ||
      role.name === 'Code Counselor' ||
      role.name === 'Moderator' ||
      role.name === 'Admin' ||
      role.name === 'Super Admin'
  );
};


const convert = (sentence) => {
  let result = '';
  for (let i = 0; i < sentence.length; i++) {
    if (sentence[i] === '@' || sentence[i] === '4') {
      result += 'a';
    } else if (
      sentence[i] === '1' ||
      sentence[i] === '|' ||
      sentence[i] === '!'
    ) {
      result += 'i';
    } else if (sentence[i] === '$') {
      result += 's';
    } else if (sentence[i] === '0') {
      result += 'o';
    } else if (sentence[i] === '7') {
      result += 't';
    } else if (sentence[i] === '3') {
      result += 'e';
    } else {
      result += sentence[i];
    }
  }
  return result;
};