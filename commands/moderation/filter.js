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

    console.log(profane, spammed);
  },
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

const mod = (msg, ctx, word) => {
  const author = msg.author;

  if (ctx == 'word') {
    const message = `Your message, \n\n" + msg.context + "\n\n" + "was deleted due to language: "${word}"\nIf you believe this to be a mistake please contact ModMail with message details.`;
    author.send({content: message});
  } else {
    const message =
      'Your message, \n\n' +
      msg.content +
      '\n\n' +
      'was deleted due to possible spam.\nIf you believe this to be a mistake please contact ModMail with message details.';
    author.send({content: message});
  }

  msg.delete();
};

const logMsg = (msg, ctx, word) => {
  const logs = msg.guild.channels.cache.find(
    (channel) => channel.name === 'swear-jar'
  );

  if (logs) {
    if (ctx == 'word') {
      const message = `${msg.author} said "${word}" in ${msg.channel}\nhttps://discordapp.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}`;
      logs.send({content: message});
    } else {
      const message = `${msg.author} may have posted spam in ${msg.channel}\nhttps://discordapp.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}`;
      logs.send({content: message});
    }
  }
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

const spamCheck = (content) => {
  return content.includes('free') && content.includes('nitro');
};
