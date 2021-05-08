// This is an example file showing how we can refactor messageHandlers.js
// so that Jest spyOn works properly for the inner functions.
// I will delete this later after people havea chance to compare the two

const Discord = require('discord.js');
const {getClient} = require('../config/client');
const {getConnection} = require('../config/db');

const con = getConnection();
const client = getClient();

module.exports = {
  async messageHandler(msg) {
    if (msg.content.substring(0, 3) === 'cc!') {
      await this.commandParser(client, con, msg);
    } else if (msg.author.id != client.user.id && msg.guild !== null) {
      await client.commands.get('filter').execute(msg);
    }
  },

  async commandParser(client, con, msg) {
    const args = msg.content.slice('cc!'.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    try {
      await command.execute(msg, args, con);
    } catch (error) {
      console.error(error);
      msg.reply(
        'There was an error trying to execute that command! Try cc!help for information.'
      );
    }
  },

  async logDeletedMessages(message) {
    if (!message.partial) {
      // Inspired by StackOverFlow: https://stackoverflow.com/questions/53328061/finding-who-deleted-the-message
      // Add latency as audit logs aren't instantly updated, adding a higher latency will result in slower logs, but higher accuracy.
      await Discord.Util.delayFor(900);

      const deletedPost = await this.fetchAndAudit(message);
      // If entry exists, grab the user that deleted the message and display username + tag, if none, display 'Unknown'.
      const executor = deletedPost
        ? deletedPost.executor.tag
        : message.author.tag;

      const channel = message.guild.channels.cache.find(
        (channel) => channel.name === 'audit-logs'
      );
      console.log(`message is deleted -> ${message}`);

      const deletedMessageEmbed = this.buildEmbed(message, executor);

      channel.send(deletedMessageEmbed);
    }
  },

  async fetchAndAudit(message) {
    const fetchedLogs = await message.guild
      .fetchAuditLogs({
        limit: 6,
        type: 'MESSAGE_DELETE',
      })
      .catch(() => ({
        entries: [],
      }));

    const auditEntry = fetchedLogs.entries.find(
      (a) =>
        // Small filter function to make use of the little discord provides to narrow down the correct audit entry.
        a.target.id === message.author.id &&
        a.extra.channel.id === message.channel.id &&
        // Ignore entries that are older than 20 seconds to reduce false positives.
        Date.now() - a.createdTimestamp < 20000
    );

    return auditEntry;
  },

  async buildEmbed(message, executor) {
    return (
      new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(
          `${message.author.tag} message was deleted by ${executor} from #${message.channel.name}:`
        )
        // .setAuthor(`${message.author.username}`, `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`)
        .setDescription(`${message.content}`)
        .setThumbnail(
          `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`
        )
        .setTimestamp()
        .setFooter(`${message.guild.name}`)
    );
  },
};
