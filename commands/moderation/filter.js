/*  
  List of offensive words for easy readability

    Strong Words 
      *one of these words will trigger the filter 
       hell       damn
       fuck       shit

    Minor Words    
      *3+ of these words will trigger the filter
      darn        dern
      dang        heck
      asshole
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
      // list of words in users message
      const words = msg.content.toLowerCase().split(' ');

      // regex expression of strong offensive words
      const strongWords = /hell|shit|damn|damned|damnit|fuck|fucked|fucking[.,/\\:;\*\?\!\@\#\$]?/;

      // regex expression of minor offensive words
      const lightWords = /darn|dern|dang|asshole|heck[.,/\\:;\*\?\!\@\#\$]?/;

      // numbers of strong and minor offensive words
      let numStrongWords = 0;
      let numLightWords = 0;

      for (let i = 0; i < words.length; i++) {
        if (strongWords.test(words[i])) {
          numStrongWords++;
        } else if (lightWords.test(words[i])) {
          numLightWords++
        }
      }

      // A single strong word or multiple light words invokes action
      if (numStrongWords > 0 || numLightWords > 2) {
        msg.delete();

        const logs = msg.guild.channels.cache.find(channel => channel.name === 'audit-logs')

        dmTheUser(msg);
        
        logs.send(`I warned ${msg.author} for saying something hurtful in ${msg.channel}...`);
        
        // prepare to call addnote function
        const command = `cc!addnote ${msg.author} excessive cussing/offensive language in ${msg.channel}.`;

        const addition = ` User said: ${msg.content}`;
        
        // call addnote function based on length of user message
        if (command.length + addition.length <= 255) {
          logs.send(command + addition);
        } else {
          logs.send(command + ' Users message was to long too copy into database.');
        }
      }
    }
  },
};

const dmTheUser = (msg) => {
  // Create an embed, craft it, and DM the user
  const Embed = new Discord.MessageEmbed()
    .setColor('#f1d302')
    .setTitle(`Reminder to ${msg.author.username}`)
    .setDescription(`Regarding your message in ${msg.channel}:\n\n"${msg.content}"\n\nPlease refrain from excessive cussing and/or posting offensive content.`)
    .setTimestamp()
    .setFooter(`${msg.guild.name}`);
  msg.author.send(Embed);
}
