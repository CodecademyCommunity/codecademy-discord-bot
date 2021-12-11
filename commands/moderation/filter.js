module.exports = {
  name: 'filter',
  description: 'filter a message',
  guildOnly: true,

  execute(msg) {
    if (!isHighRoller(msg)) {
      const wordMod = false; // control auto mod
      const spamMod = false; // control spam mod

      const content = convertToChar(msg.content.toLowerCase());

      if (spamCheck(content)) {
        if (spamMod) {
          mod(msg, 'spam', null);
        }
        logMsg(msg, 'spam', null);
      }

      const check = wordCheck(content.split(' '));
      if (check[0]) {
        if (check[1] === 'strong' && wordMod) {
          mod(msg, 'word', check[0]);
        }
        logMsg(msg, 'word', check[0]);
      }
    }
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
    author.send(message);
  } else {
    const message =
      'Your message, \n\n' +
      msg.content +
      '\n\n' +
      'was deleted due to possible spam.\nIf you believe this to be a mistake please contact ModMail with message details.';
    author.send(message);
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
      logs.send(message);
    } else {
      const message = `${msg.author} may have posted spam in ${msg.channel}\nhttps://discordapp.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}`;
      logs.send(message);
    }
  }
};

const convertToChar = (sentence) => {
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

const wordCheck = (words) => {
  const strongWords = /^(,|\.|\?|'|"|:|;|`)?(motherfucker|nigger|nigga|penis|vagina|asshole|shithole|sex|sexed|piss|pissed|sexual|sexuality|bastard|bitch|boobs|semen|sperm|jizz|jizzed|whore|prostitute|fornicate|fornication|adultery|adulter|adulteress|slut|buttplug|clitoris|condom|porn|pornography|pornographic)(,|\.|\?|'|"|:|;|`)?$/;

  const lightWords = /^(,|\.|\?|'|"|:|;|`)*?(hell|damn|goddamn|goddamned|godamn|damned|damnit|sexy|fuck|fucked|fucking|fucker|fuckwad|wtf|fuckin|shit)(,|\.|\?|'|"|:|;|`)?$/;

  let word;

  for (let i = 0; i < words.length; i++) {
    if (strongWords.test(words[i])) {
      return [words[i], 'strong'];
    } else if (lightWords.test(words[i])) {
      word = words[i];
    }
  }
  return word ? [word, null] : [null, null];
};

const spamCheck = (content) => {
  return content.includes('free') && content.includes('nitro');
};
