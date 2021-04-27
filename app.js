const Discord = require('discord.js');
const {getClient} = require('./config/client.js');
const {collectCommands} = require('./config/commands');
const {messageHandler} = require('./handlers/messageHandler');
require('dotenv').config();

const client = getClient();
const commandsDir = `${__dirname}/commands`;

collectCommands(client, commandsDir);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildCreate', (guild) => {
  guild.roles
    .create({
      data: {
        name: 'Muted',
        color: 'DARK_BUT_NOT_BLACK',
        permissions: [],
      },
    })
    .then(console.log)
    .catch(console.error);
});

// Denies reacting and message sending permissions for users with Muted role.
client.on('guildMemberUpdate', (oldMember, newMember) => {
  const muted = newMember.guild.roles.cache.find(
    (role) => role.name === 'Muted'
  );
  newMember.guild.channels.cache.forEach((channel) => {
    if (
      channel.type === 'text' &&
      newMember === channel.members.find((member) => member.id === newMember.id)
    ) {
      channel.updateOverwrite(muted.id, {
        ADD_REACTIONS: false,
        SEND_MESSAGES: false,
        SEND_TTS_MESSAGES: false,
      });
    }
  });
});

// Upon channel creation, mutes all users with Muted role in the new channel.
client.on('channelCreate', (channel) => {
  if (channel.guild != null) {
    const muted = channel.guild.roles.cache.find(
      (role) => role.name === 'Muted'
    );
    channel.updateOverwrite(muted.id, {
      ADD_REACTIONS: false,
      SEND_MESSAGES: false,
      SEND_TTS_MESSAGES: false,
    });
  }
});

client.on('message', messageHandler);

client.on('messageDelete', async function (message) {
  if (!message.partial) {
    // Stolen from StackOverFlow: https://stackoverflow.com/questions/53328061/finding-who-deleted-the-message
    // Add latency as audit logs aren't instantly updated, adding a higher latency will result in slower logs, but higher accuracy.
    await Discord.Util.delayFor(900);

    // Fetch a couple audit logs than just one as new entries could've been added right after this event was emitted.
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

    // If entry exists, grab the user that deleted the message and display username + tag, if none, display 'Unknown'.
    const executor = auditEntry ? auditEntry.executor.tag : message.author.tag;

    const channel = message.guild.channels.cache.find(
      (channel) => channel.name === 'audit-logs'
    );
    console.log(`message is deleted -> ${message}`);
    // channel.send(`${message.author.username} deleted: ${message.content}`)
    const exampleEmbed = new Discord.MessageEmbed()
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
      .setFooter(`${message.guild.name}`);

    channel.send(exampleEmbed);
  }
});

client.login(process.env.DISCORD_SECRET_KEY);
