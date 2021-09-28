/*  
  List of offensive words for easy readability
  
    Strong Words 
      *one of these words will trigger the filter 
       
       buttplug      motherfucker  
       nigger        nigga
       penis         vagina
       asshole       sex
       sexed         piss
       pissed        condom
       sexual        sexuality
       bastard       clitoris
       bitch         boobs
       semen         sperm
       jizzed        jizz
       whore         prostitute
       fornicate     fornication
       adultery      adulter
       adulteress    slut
       porn          pornography
       pornographic  shithole
               
       
    Minor Words    
       *one of these words will notify staff

       hell          damn
       goddamn       goddamned
       goddamnit     damned
       damnit        hell
       sexy          fuck          
       fucked        wtf
       fucking       fucker
       fuckwad       fuckin
       shit
      
*/

module.exports = {
  name: 'filter',
  description: 'filter a message',
  guildOnly: true,

  execute(msg) {
    if (isHighRoller(msg)) {
      const autoMod = false; // change to activate auto mod
      const words = convertToChar(msg.content.toLowerCase()).split(' ');
      const results = needsAction(words);
      if (results[0] === 'auto' && autoMod) {
        moderation(msg);
      } else if (results[0] === 'manual' || results[0] === 'auto') {
        logSwear(msg, results[1]);
      }
    }
  },
};

const isHighRoller = (msg) => {
  if (
    !msg.member.roles.cache.some(
      (role) =>
        role.name === 'Forums Super User' ||
        role.name === 'Code Counselor' ||
        role.name === 'Moderator' ||
        role.name === 'Admin' ||
        role.name === 'Super Admin'
    )
  ) {
    return true;
  } else {
    return false;
  }
};

const moderation = (msg) => {
  msg.delete();

  const logs = msg.guild.channels.cache.find(
    (channel) => channel.name === 'audit-logs'
  );

  if (logs) {
    const command = `cc!warn ${msg.author} In reference to your message in ${msg.channel}, please refrain from excessive cussing/offensive language.`;

    logs.send(command);
  }

  // room for channel creation later
};

const logSwear = (msg, word) => {
  const logs = msg.guild.channels.cache.find(
    (channel) => channel.name === 'swear-jar'
  );

  if (logs) {
    const message = `${msg.author} said "${word}" in ${msg.channel}\nhttps://discordapp.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}`;

    logs.send(message);
  }

  // room for channel creation later
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

const needsAction = (words) => {
  const strongWords = /^(,|\.|\?|'|"|:|;|`)?(motherfucker|nigger|nigga|penis|vagina|asshole|shithole|sex|sexed|piss|pissed|sexual|sexuality|bastard|bitch|boobs|semen|sperm|jizz|jizzed|whore|prostitute|fornicate|fornication|adultery|adulter|adulteress|slut|buttplug|clitoris|condom|porn|pornography|pornographic)(,|\.|\?|'|"|:|;|`)?$/;

  const lightWords = /^(,|\.|\?|'|"|:|;|`)*?(hell|damn|goddamn|goddamned|godamn|damned|damnit|sexy|fuck|fucked|fucking|fucker|fuckwad|wtf|fuckin|shit)(,|\.|\?|'|"|:|;|`)?$/;

  let manual = false;
  let word;

  for (let i = 0; i < words.length; i++) {
    if (strongWords.test(words[i])) {
      return ['auto', words[i]];
    } else if (!manual && lightWords.test(words[i])) {
      manual = true;
      word = words[i];
    }
  }

  return manual ? ['manual', word] : ['clean', word];
};
