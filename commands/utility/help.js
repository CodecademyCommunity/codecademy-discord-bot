const Discord = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Send help message',
  guildOnly: false,
  staffOnly: false,
  execute(msg, args, con) {
    if (args[0]) {
      switch (args[0]) {
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
            '`cc!ban [user] [reason]`\nBans a user. *Moderator and above only.*'
          );
          break;

        case 'cc!unban':
        case 'unban':
          msg.channel.send(
            '`cc!unban [userid]`\nUnbans a user. *Moderator and above only.*'
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
            '`cc!kick [user] [reason]`\nKicks a user from the server. *Moderator and above only.*'
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
            '`cc!unmute [user]`\nUnmutes a user. *Moderator and above only.*'
          );
          break;

        case 'cc!tempmute':
        case 'tempmute':
          msg.channel.send(
            '`cc!tempmute [user] [lengthoftime] [reason]`\nTemporarily mutes a user for a set time period. *Moderator and above only.*'
          );
          break;

        case 'cc!warn':
        case 'warn':
          msg.channel.send(
            '`cc!warn [user] [reason]`\nWarns a user of an infraction and logs infraction in db. *Moderator and above only.*'
          );
          break;

        case 'cc!verbal':
        case 'verbal':
          msg.channel.send(
            '`cc!verbal [user] [reason]`\nSends a user a verbal through DMs and logs as a note in db. *Moderator and above only.*'
          );
          break;

        case 'cc!infractions':
        case 'infractions':
          msg.channel.send(
            '`cc!infractions [user]`\nFinds user infraction record in db and returns it to channel. *Moderator and above only.*'
          );
          break;

        case 'cc!addnote':
        case 'addnote':
          msg.channel.send(
            '`cc!addnote [user] [note]`\nAdds a note to a user. *Code Counselor and above only.*'
          );
          break;

        case 'cc!helpcenter':
        case 'helpcenter':
          msg.channel.send(
            "`cc!helpcenter {plaintext}`\nProvides links to Codecademy's Help Center (either embedded or plaintext)."
          );
          break;

        case 'cc!notes':
        case 'notes':
          msg.channel.send(
            '`cc!notes [user]`\nDisplays all notes that have been added to a user. *Code Counselor and above only.*'
          );
          break;

        case 'cc!removenote':
        case 'removenote':
          msg.channel.send(
            '`cc!removenote [user] [noteid]`\nSets a single note as invalid. *Moderator and above only.*'
          );
          break;

        case 'cc!removeinfraction':
        case 'removeinfraction':
          msg.channel.send(
            '`cc!removeinfraction [user] [infractionid]`\nSets a single infraction as invalid. *Moderator and above only.*'
          );
          break;

        case 'cc!clearinfractions':
        case 'clearinfractions':
          msg.channel.send(
            "`cc!clearinfractions [user]`\nSets all the specified user's infractions as invalid. *Admin only.*"
          );
          break;

        case 'cc!records':
        case 'records':
          msg.channel.send(
            '`cc!records [user]`\nDisplays all notes and infractions from a user. *Moderator and above only.*'
          );
          break;

        case 'cc!clearmessages':
        case 'clearmessages':
          msg.channel.send(
            '`cc!clearmessages [numberofmessages]`\nClears the specified number of messages in the channel where the command is used. *Moderator and above only.*'
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
        .addField('Admin Only', 'cc!clearinfractions')
        .addField(
          'Moderator & Above Only',
          'cc!ban, cc!unban, cc!tempban, cc!mute, cc!unmute, cc!tempmute, cc!kick, cc!warn, cc!verbal, cc!infractions, cc!removeinfraction, cc!removenote, cc!clearmessages, cc!records'
        )
        .addField('Code Counselor & Above Only', 'cc!addnote, cc!notes, cc!ping')
        .addField('Everyone', 'cc!stats, cc!helpcenter, cc!help');

      msg.channel.send(commandsEmbed);
    }
  },
};
