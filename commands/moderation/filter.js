/*  
  List of offensive words for easy readability
  
    Strong Words 
      *one of these words will trigger the filter 
       hell          damn
       goddamn       goddamned
       goddamnit     damned
       damnit        hell
       fuck          fucked
       fucking       fucker
       fuckwad       buttplug
       motherfucker  wtf
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
       *3+ of these words will trigger the filter
       darn        dern
       darned      derned
       darnit      dernit
       dang        heck
       frick       fricked
       crap        omg
       shit        sexy
      
*/

const Discord = require('discord.js');

module.exports = {
  name: "filter",
  description: "filter a message",

  execute(msg) {
    // Make sure user should be filtered
    if (
    !msg.member.roles.cache.some(
      (role) =>
        role.name === 'Super User' ||
        role.name === 'Moderator' ||
        role.name === 'Admin'
    )
  ) {

      let words = convertToChar(msg.content).split(' ');

      console.log(words);

      if (needsAction(words)) {
        
        moderation(msg);
        dmTheUser(msg);
        
      }
    }
  },
};



const moderation = (msg) => {
  
  msg.delete();
  
  const logs = msg.guild.channels.cache.find(channel => channel.name === 'audit-logs');
  
  logs.send(`I warned ${msg.author} for saying something hurtful in ${msg.channel}...`);
        
  const command = `cc!addnote ${msg.author} excessive cussing/offensive language in ${msg.channel}.`;

  const addition = ` User said: ${msg.content}`;
        
  if (command.length + addition.length <= 255) {
    logs.send(command + addition);
  } else {
    logs.send(command + ' Users message was to long too copy into database.');
  }
}



const dmTheUser = (msg) => {
  const Embed = new Discord.MessageEmbed()
    .setColor('#f1d302')
    .setTitle(`Reminder to ${msg.author.username}`)
    .setDescription(`Regarding your message in ${msg.channel}:\n\n"${msg.content}"\n\nPlease refrain from excessive cussing and/or posting offensive content.`)
    .setTimestamp()
    .setFooter(`${msg.guild.name}`);
  msg.author.send(Embed);
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

  let result = false;

  const strongWords = /hell|damn|goddamn|goddamned|damned|damnit|hell|fuck|fucked|fucking|fucker|fuckwad|fuckwad|motherfucker|wtf|nigger|nigga|penis|vagina|asshole|sex|sexed|piss|pissed|sexual|sexuality|bastard|bitch|boobs|semen|sperm|jizz|jizzed|whore|prostitute|fornicate|fornication|adultery|adulter|adulteress|slut|buttplug|clitoris|condom/;

  const lightWords = /darn|dern|darned|derned|darnit|dernit|dang|heck|frick|fricked|crap|omg|sexy|shit/;

  let numLightWords = 0;
  let numStrongWords = 0;

  let i = 0;
  
  while (i < words.length && !result) {
    if (strongWords.test(words[i])) {
      result = true;
    } else if (lightWords.test(words[i])) {
      numLightWords++;
    }

    if (numLightWords >= 3) {
      result = true;
    }

    i++;
  }

  return result;
} 
