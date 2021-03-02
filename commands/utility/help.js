const Discord = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Send help message',
  execute(msg, args) {
    if (args[0]) {
      switch (args[0]) {
        case 'cc!createroles':
        case 'createroles':
          msg.channel.send(
            '`cc!createroles`\nPulls all badges from Codecademy Discuss and creates a role for each one. *Admin only.*'
          );
          break;

        case 'cc!deleteroles':
        case 'deleteroles':
          msg.channel.send(
            '`cc!deleteroles`\nDeletes all the roles added from Codecademy Discuss. *Admin only.*'
          );
          break;

        case 'cc!sendcode':
        case 'sendcode':
          msg.channel.send(
            '`cc!sendcode [username]`\nSends a verification code to your Codecademy Discuss email. *Requires you to provide your Codecademy Discuss username.*'
          );
          break;

        case 'cc!verify':
        case 'verify':
          msg.channel.send(
            '`cc!verify [code]`\nVerifies that the code entered is valid and gives you a role for every badge you have on Discourse. *Requires you to enter your verification code.*'
          );
          break;

        case 'cc!ping':
        case 'ping':
          msg.channel.send('`cc!ping`\nPong!');
          break;

        case 'cc!stats':
        case 'stats':
          msg.channel.send(
            '`cc!stats`\nDisplays basic server statistics (online members, offline members, total members).'
          );
          break;

        case 'cc!ban':
        case 'ban':
          msg.channel.send(
            '`cc!ban [user] [reason]`\nBans a user. *Admin only.*'
          );
          break;

        case 'cc!unban':
        case 'unban':
          msg.channel.send(
            '`cc!unban [userid]`\nUnbans a user. *Admin only.*'
          );
          break;

        case 'cc!tempban':
        case 'tempban':
          msg.channel.send(
            '`cc!tempban [user] [lengthoftime] [reason]`\nTemporarily bans a user for a set time period. *Moderator and above only.*'
          );
          break;

        case 'cc!kick':
        case 'kick':
          msg.channel.send(
            '`cc!kick [user] [reason]`\nKicks a user from the server. *Super User and above only.*'
          );
          break;

        case 'cc!mute':
        case 'mute':
          msg.channel.send(
            '`cc!mute [user] [reason]`\nMutes a user by assigning them a *Muted* role (denies message sending and reacting privileges). *Moderator and above only.*'
          );
          break;

        case 'cc!unmute':
        case 'unmute':
          msg.channel.send(
            '`cc!unmute [user]`\nUnmutes a user. *Super User and above only.*'
          );
          break;

        case 'cc!tempmute':
        case 'tempmute':
          msg.channel.send(
            '`cc!tempmute [user] [lengthoftime] [reason]`\nTemporarily mutes a user for a set time period. *Super User and above only.*'
          );
          break;

        case 'cc!warn':
        case 'warn':
          msg.channel.send(
            '`cc!warn [user] [reason]`\nWarns a user of an infraction and logs infraction in db. *Super User and above only.*'
          );
          break;

        case 'cc!infractions':
        case 'infractions':
          msg.channel.send(
            '`cc!infractions [user]`\nFinds user infraction record in db and returns it to channel. *Super User and above only.*'
          );
          break;

        default:
          msg.channel.send(
            'That is not a command. For a full list type `cc!help`.'
          );
      }
    } else {
      const commandsEmbed = new Discord.MessageEmbed()
        .setTitle('Commands')
        .setDescription(
          'Use `cc!help [command]` to get more information about a particular command.'
        )
        .setColor('DARK_NAVY')
        .addField(
          'Admin Only',
          'cc!createroles, cc!deleteroles, cc!ban, cc!unban'
        )
        .addField('Moderator & Above Only', 'cc!tempban, cc!mute')
        .addField(
          'Super User & Above Only',
          'cc!unmute, cc!tempmute, cc!kick, cc!warn, cc!infractions'
        )
        .addField(
          'Everyone',
          'cc!sendcode, cc!verify, cc!stats, cc!ping, cc!help'
        );

      msg.channel.send(commandsEmbed);
    }
  },
};
