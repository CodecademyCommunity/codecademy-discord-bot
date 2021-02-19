const fs = require('fs');
const Discord = require('discord.js');
const fetch = require('node-fetch');

const sgMail = require('@sendgrid/mail');
const mysql = require('mysql');
require('dotenv').config()
const { v4: uuidv4 } = require('uuid');

const constants = require("./constants")

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.commands = new Discord.Collection();

const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const con = mysql.createConnection({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD
});


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildCreate', guild => {
  guild.roles.create({
    data: {
      name: 'Muted',
      color: 'DARK_BUT_NOT_BLACK',
      permissions: []
    }
  })
    .then(console.log)
    .catch(console.error);
})

// Denies reacting and message sending permissions for users with Muted role.
client.on('guildMemberUpdate', (oldMember, newMember) => {
  newMember.guild.channels.cache.forEach(channel => {
    if (channel.type === "text" && newMember === channel.members.find(member => member.id === newMember.id)) {
      channel.overwritePermissions([{
        id: newMember.guild.roles.cache.find(role => role.name === "Muted"),
        deny: ['ADD_REACTIONS', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES'] 
      }])
    }
  });
})

client.on('channelCreate', channel => {
  channel.overwritePermissions([{
    id: channel.guild.roles.cache.find(role => role.name === "Muted"),
    deny: ['ADD_REACTIONS', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES']
  }])
})

const commandParser = (msg) => {
	const args = msg.content.slice('cc!'.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

  switch(command) {
    case 'createroles':
      client.commands.get('createroles').execute(msg, fetch, constants.colors);
      break;
    
    case 'deleteroles':
      client.commands.get('deleteroles').execute(msg, fetch);
      break;

    case 'sendcode':
      client.commands.get('sendcode').execute(msg, uuidv4(), fetch, con, sgMail);
      break;
    
    case 'stats':
      client.commands.get('stats').execute(msg, Discord);
      break;

    case 'verify':
      client.commands.get('verify').execute(msg, con, fetch);
      break;
    
    case 'ping':
      client.commands.get('ping').execute(msg);
      break;

    case 'help':
    case 'info':
    case 'information':
      client.commands.get('help').execute(msg);
      break;

    case 'mute':
      client.commands.get('mute').execute(msg);
      break;

    case 'unmute':
      client.commands.get('unmute').execute(msg);
      break;

    case 'tempmute':
      client.commands.get('tempmute').execute(msg);
      break;

    default:
      msg.reply('That is not a command. Try cc!help for information.');
  }
}


client.on('message', msg => {
  if (msg.content.substring(0, 3) === 'cc!' && !(msg.member === client)) {
    commandParser(msg);
  }
});

client.on('messageDelete', async function(message){
  if (!message.partial) {
    // Stolen from StackOverFlow: https://stackoverflow.com/questions/53328061/finding-who-deleted-the-message
    // Add latency as audit logs aren't instantly updated, adding a higher latency will result in slower logs, but higher accuracy.
    await Discord.Util.delayFor(900);

    // Fetch a couple audit logs than just one as new entries could've been added right after this event was emitted.
    const fetchedLogs = await message.guild.fetchAuditLogs({
      limit: 6,
      type: 'MESSAGE_DELETE'
    }).catch(() => ({
      entries: []
    }));

    const auditEntry = fetchedLogs.entries.find(a =>
      // Small filter function to make use of the little discord provides to narrow down the correct audit entry.
      a.target.id === message.author.id &&
      a.extra.channel.id === message.channel.id &&
      // Ignore entries that are older than 20 seconds to reduce false positives.
      Date.now() - a.createdTimestamp < 20000
    );

    // If entry exists, grab the user that deleted the message and display username + tag, if none, display 'Unknown'. 
    const executor = auditEntry ? auditEntry.executor.tag : message.author.tag;


    let channel = message.guild.channels.cache.find(channel => channel.name === 'audit-logs')
    console.log(`message is deleted -> ${message}`);
    // channel.send(`${message.author.username} deleted: ${message.content}`)
    const exampleEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`${message.author.tag} message was deleted by ${executor}:`)
      // .setAuthor(`${message.author.username}`, `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`)
      .setDescription(`${message.content}`)
      .setThumbnail(`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`)
      .setTimestamp()
      .setFooter(`${message.guild.name}`);

    channel.send(exampleEmbed);
  }
});


client.login(process.env.DISCORD_SECRET_KEY);
