const fs = require('fs');
const Discord = require('discord.js');
const fetch = require('node-fetch');

const sgMail = require('@sendgrid/mail');
const mysql = require('mysql');
require('dotenv').config()
const { v4: uuidv4 } = require('uuid');

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

      
colors = ["#63B598", "#CE7D78", "#EA9E70", "#A48A9E", "#C6E1E8", "#648177", "#0D5AC1",
          "#F205E6", "#1C0365", "#14A9AD", "#4CA2F9", "#A4E43F", "#D298E2", "#6119D0",
          "#D2737D", "#C0A43C", "#F2510E", "#651BE6", "#79806E", "#61DA5E", "#CD2F00", 
          "#9348AF", "#01AC53", "#C5A4FB", "#996635", "#B11573", "#4BB473", "#75D89E", 
          "#2F3F94", "#2F7B99", "#DA967D", "#34891F", "#B0D87B", "#CA4751", "#7E50A8", 
          "#C4D647", "#E0EEB8", "#11DEC1", "#289812", "#566CA0", "#FFDBE1", "#2F1179", 
          "#935B6D", "#916988", "#513D98", "#AEAD3A", "#9E6D71", "#4B5BDC", "#0CD36D",
          "#250662", "#CB5BEA", "#228916", "#AC3E1B", "#DF514A", "#539397", "#880977",
          "#F697C1", "#BA96CE", "#679C9D", "#C6C42C", "#5D2C52", "#48B41B", "#E1CF3B",
          "#5BE4F0", "#57C4D8", "#A4D17A", "#225B8", "#BE608B", "#96B00C", "#088BAF",
          "#F158BF", "#E145BA", "#EE91E3", "#05D371", "#5426E0", "#4834D0", "#802234",
          "#6749E8", "#0971F0", "#8FB413", "#B2B4F0", "#C3C89D", "#C9A941", "#41D158",
          "#FB21A3", "#51AED9", "#5BB32D", "#807FB", "#21538E", "#89D534", "#D36647",
          "#7FB411", "#0023B8", "#3B8C2A", "#986B53", "#F50422", "#983F7A", "#EA24A3",
          "#79352C", "#521250", "#C79ED2", "#D6DD92", "#E33E52", "#B2BE57", "#FA06EC",
          "#1BB699", "#6B2E5F", "#64820F", "#1C271", "#21538E", "#89D534", "#D36647"]

let chapter = {
  started: false, 
  step1: false,
  step2: false, 
  step3: false,
  rolename: "",
  userid: ""
}

const commandParser = (msg) => {
  splitMessage = msg.content.split(" ")[0];
  
	const args = msg.content.slice("!".length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

  switch(command) {
    case 'createroles':
      client.commands.get('createroles').execute(msg, args, fetch);
      break;
    
    case 'deleteroles':
      client.commands.get('deleteroles').execute(msg, args, fetch);
      break;

    case 'sendcode':
      client.commands.get('sendcode').execute(msg, args, uuidv4(), fetch, con, sgMail);
      break;

    case 'verify':
      client.commands.get('verify').execute(msg, args, con, fetch);
      break;
    case 'ping':
      client.commands.get('ping').execute(msg, args);
      break
    case 'help':
    case 'info':
    case 'information':
      client.commands.get('help').execute(msg, args);
      break;

    default:
      msg.reply("That is not a command. Try !help for information.");
  }
}


client.on('message', msg => {

  //splitMessage = msg.content.split(" ")
  //const guild = msg.guild;

  if (msg.content[0] === '!' && !(msg.member === client)) {
    commandParser(msg);
  }
});

client.on("messageDelete", async function(message){
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
