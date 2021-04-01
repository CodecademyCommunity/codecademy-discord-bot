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
      
*/

const Discord = require('discord.js');

module.exports = {
  name: "filter",
  description: "filter a message",

  execute(msg) {
    
    if (isHighRoller(msg)) {

      let words = convertToChar(msg.content).split(' ');
      const results = needsAction(words);

      if (results[0] === 'auto') {
        
        console.log('auto');
        moderation(msg);
        
      } else if (results[0] === 'manual') {

        logSwear(msg, results[1]);

      }
    }
  },
};



const isHighRoller = (msg) => {
  if (
    !msg.member.roles.cache.some(
      (role) =>
        role.name === 'Super User' ||
        role.name === 'Moderator' ||
        role.name === 'Admin'
    )
  ) {
    return true;
  } else {
    return false;
  }
}



const moderation = (msg) => {
  
  msg.delete();
  
  const logs = msg.guild.channels.cache.find(channel => channel.name === 'audit-logs');
        
  if (logs) {
    const command = `cc!warn ${msg.author} In reference to your message in ${msg.channel}, please refrain from excessive cussing/offensive language.`;

    logs.send(command);
  }

  // room for channel creation later

}



const logSwear = (msg, word) => {

  let logs = msg.guild.channels.cache.find(channel => channel.name === 'swear-jar');
  
  if (logs) {
    const message = `${msg.author} said "${word}" in ${msg.channel}\nhttps://discordapp.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}`;

    logs.send(message);
  }

  // room for channel creation later

}



const convertToChar = (sentence) => {
  let result = '';
  
  for (let i = 0; i < sentence.length; i++) {
    if ((sentence[i] >= 'a' && sentence[i] <= 'z') || (sentence[i] >= 'A' && sentence[i] <= 'Z') || sentence[i] === ' ') {
      result += sentence[i];
    } else if (sentence[i] === '@') {
      result += 'a';
    } else if (sentence[i] === '1' || sentence[i] === '|' || sentence[i] === '!') {
      result += 'i';
    } else if (sentence[i] === '$') {
      result += 's';
    }
  }
  return result;
}



const needsAction = (words) => {

  const strongWords = /motherfucker|nigger|nigga|penis|vagina|asshole|sex|sexed|piss|pissed|sexual|sexuality|bastard|bitch|boobs|semen|sperm|jizz|jizzed|whore|prostitute|fornicate|fornication|adultery|adulter|adulteress|slut|buttplug|clitoris|condom/;

  const lightWords = /hell|damn|goddamn|goddamned|damned|damnit|sexy|fuck|fucked|fucking|fucker|fuckwad|wtf|fuckin/;

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
  if (manual) {
    return ['manual', word];
  } else {
    return 'clean';
  }
} 
