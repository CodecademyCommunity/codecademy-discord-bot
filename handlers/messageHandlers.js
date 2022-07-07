const Discord = require('discord.js');
const {setTimeout} = require('timers/promises');
const {getClient} = require('../config/client');

const client = getClient();

const messageHandler = async (msg) => {
  if (msg.webhookId) {
    return;
  } else if (msg.member && msg.guild && msg.author.id != client.user.id) {
    await client.commands.get('filter').execute(msg);
  }
};

async function logDeletedMessages(message) {
  // Inspired by StackOverFlow: https://stackoverflow.com/questions/53328061/finding-who-deleted-the-message
  // Add latency as audit logs aren't instantly updated, adding a higher latency will result in slower logs, but higher accuracy.
  // Replaced Discord.Util.delayFor(900) with node timer in conversion to discord.js v13.
  await setTimeout(900);

  const deletedPost = await fetchAndAudit(message);
  // If entry exists, grab the user that deleted the message and display username + tag, if none, display 'Unknown'.
  const executor = deletedPost ? deletedPost.executor.tag : message.author.tag;

  const channel = message.guild.channels.cache.find(
    (channel) => channel.name === 'audit-logs'
  );
  console.log(`message is deleted -> ${message}`);

  const deletedMessageEmbed = buildEmbed(message, executor);

  channel.send({embeds: [deletedMessageEmbed]});
}

const fetchAndAudit = async (message) => {
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
};

const buildEmbed = (message, executor) => {
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
      .setFooter({text: `${message.guild.name}`})
  );
};

module.exports = {
  messageHandler: messageHandler,
  logDeletedMessages: logDeletedMessages,
};
