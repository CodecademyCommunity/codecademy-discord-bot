const Discord = require('discord.js');
const fetch = require('node-fetch');

const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');

const sgMail = require('@sendgrid/mail');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

require('dotenv').config({path: `${__dirname}/.env`})

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



const createRoles = (msg) => {
  if(!msg.member.hasPermission('ADMINISTRATOR')) {
    return msg.reply('You need administrator perms to run this command');
  }else{
    msg.reply("Creating roles...");

    let counter = 0;

    (async () => {
      const response = await fetch("https://discuss.codecademy.com/admin/badges.json", {
        method: 'get',
        headers: {
          'Api-Key': process.env.DISCOURSE_API_KEY,
          'Api-Username': 'vic-st',
          'Content-Type': 'application/json'
        }
      });
      const badges = await response.json();
      
      for(let i = 0; i < badges.badges.length; i++) {
        let role = msg.guild.roles.cache.find(({name}) => name === badges.badges[i].name)

        if(role === undefined) {
          msg.guild.roles.create({
            data: {
              name: badges.badges[i].name,
              color: colors[i],
            },
            reason: badges.badges[i].description
          })
            .catch(console.error);
          counter+= 1;
        }
      }

    msg.reply(`${counter} roles created`);

    })();

  }
}



const deleteRoles = (msg) => {

  if(!msg.member.hasPermission('ADMINISTRATOR')) {
    return msg.reply('You need administrator perms to run this command');
  }else{
    msg.reply("Deleting roles...");

    let counter = 0;

    (async () => {
      const response = await fetch("https://discuss.codecademy.com/admin/badges.json", {
        method: 'get',
        headers: {
          'Api-Key': process.env.DISCOURSE_API_KEY,
          'Api-Username': 'vic-st',
          'Content-Type': 'application/json'
        }
      });

      const badges = await response.json();

      
      for(let i = 0; i < badges.badges.length; i++) {

        let role = msg.guild.roles.cache.find(({name}) => name === badges.badges[i].name)

        if(role !== undefined) {
          role.delete('Deleting all roles pulled from by bot')
            .then(deleted => console.log(`Deleted role ${deleted.name}`))
            .catch(console.error);
          counter+=1
        }
      }
      msg.reply(`${counter} roles deleted`)
    })();
  }

}



const sendCode = (msg) => {

  params = msg.content.substr(msg.content.indexOf(" ") + 1);

  clientUsername = params.split(" ");
  
  const uuid = uuidv4();
  
  if(clientUsername == '!sendcode'){
    msg.reply("Please include your Codecademy Discuss username");
  }else{
    (async () => {

      const response = await fetch(`https://discuss.codecademy.com/users/${clientUsername[0]}/emails.json`, {
        method: 'get',
        headers: {
          'Api-Key': process.env.DISCOURSE_API_KEY,
          'Api-Username': 'vic-st',
          'Content-Type': 'application/json'
        }
      });
      jsonres = await response.json();

      const email = jsonres.email

      console.log(email)
      if(email === undefined) {
        msg.reply("The account name you entered does not exist");
      }else{
        const date = new Date(new Date().getTime() + 60 * 60 * 24 * 1000);

        console.log(date)
        
        var sql = `INSERT INTO verifications (username, id, expiration) VALUES ('${clientUsername[0]}', '${uuid}', '${date}')`;
        con.query(sql, function (err, result) {
          if (err) {
            console.log(err);
          } else {
            console.log("1 record inserted");

            const mail = {
              to: email, // Change to your recipient
              from: 'community@codecademy.com', // Change to your verified sender
              subject: `Your Codecademy Discord Verification`,
              text: `Hi @${clientUsername[0]}! Your Codecademy Discord Verification ID is ${uuid}. Paste this message into the channel #verification with the format: !verify ${uuid}.`,
              html: `<p>Hi @${clientUsername[0]}!</p><p>Your Codecademy Discord Verification ID is <strong>${uuid}</strong></p><p>Paste this message into the channel #verification with the format: !verify ${uuid}</p>`,
            }
            sgMail
              .send(mail)
              .then(() => {
                console.log('Email sent')
              })
              .catch((error) => {
                console.error(error)
              })

            msg.reply("Verification ID sent!")
          }
        });
      }
    })();
  }
}



const verifyCode = (msg) => {

  params = msg.content.substr(msg.content.indexOf(" ") + 1);
  clientId = params.split(" ");

  if(clientId == "!verify"){
    msg.reply("Please include your verification code");
  }else{
    let member = msg.mentions.members.first() || msg.member 
        user = member.user;

    var sql = `SELECT * FROM verifications WHERE id = '${clientId[0]}'`;
    con.query(sql, function (err, result) {
      if (err) {
        console.log(err);
      }else{
        if(result.length === 0) {
          msg.reply("The ID you entered is invalid")
        }else{
          console.log(result[0].username);

          const currentDay = new Date();

          const expirationDate = new Date(result[0].expiration);
          if(currentDay.getTime() > expirationDate.getTime()) {
            msg.reply("This ID has expired, try generating a new one.")
          }else{
            (async () => {
              const response = await fetch(`https://discuss.codecademy.com/user-badges/${result[0].username}.json`, {
                method: 'get',
                headers: {
                  'Api-Key': process.env.DISCOURSE_API_KEY,
                  'Api-Username': 'vic-st',
                  'Content-Type': 'application/json'
                }
              });
              jsonres = await response.json();

              let roleTest = msg.guild.roles.cache.find(({name}) => name === jsonres.badges[0].name)

              if(roleTest === undefined) {
                  msg.reply("The admin hasn't pulled the roles from Discourse using !createroles");
                }else{
                  for(var i = 0; i < jsonres.badges.length; i++) {
                    console.log(jsonres.badges[i].name)

                    let role = msg.guild.roles.cache.find(({name}) => name === jsonres.badges[i].name)

                    setTimeout(addUser, 500);

                    function addUser() {
                      member.roles.add(role)
                    }
                  }
                  msg.reply("Your roles have been assigned!");
                }
              
            })();
          }
        }
      }
    });
  }
}



const printHelp = (msg) => {
  let member = msg.mentions.members.first() || msg.member 
          user = member.user;
          channel = msg.channel.id;

      msg.channel.send(`**Commands**
  !createroles* - Pulls all badges from Codecademy Discuss and creates a role for each one.
  !deleteroles* - Deletes all the roles added from Codecademy Discuss.
                      
  !sendcode [username] - Sends a verification code to your Codecademy Discuss email.
  !verify [code] - Verifies that the code entered is valid and gives you a role for every badge you have on Discourse.
  !help - Displays this page.
  *Admin Only`);
}



const commandParser = (msg) => {
  splitMessage = msg.content.split(" ")[0];

  switch(splitMessage) {
    case '!createroles':
      createRoles(msg);
      break;
    
    case '!deleteroles':
      deleteRoles(msg);
      break;

    case '!sendcode':
      sendCode(msg);
      break;

    case '!verify':
      verifyCode(msg);
      break;

    case '!help':
    case '!info':
    case '!information':
      printHelp(msg);
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
  
  
    
  // CHAPTER COMMAND

  // STEP 0
//   } else if (splitMessage[0] === '!start') { //If the message contained the command
//     const exampleEmbed = new Discord.MessageEmbed()
//       .setColor('#0099ff')
//       .addFields(
//         { name: 'Creating a Chapter', value: 'Reply with the name of your chapter \n This will be used to create the new channel and the role.' },
//       )
//       .setTimestamp()

//     msg.reply(exampleEmbed);

//     chapter.started = true
//     chapter.userid = msg.author.id
  
//   // STEP 1
//   }else if(chapter.started == true) {
//     console.log("Started")
//     params = msg.content.substr(msg.content.indexOf(" ") + 1);
//     clientId = params.split(" ");

    
//     if(msg.author.id != chapter.userid) {
//       return true
//     }

//     const leaderRole = guild.roles.cache.find(role => role.name === "Chapter Leader");
//     const modRole = guild.roles.cache.find(role => role.name === "Moderator");

//     msg.guild.channels.create(`${msg.content}`, { //Create a channel
//         type: 'text', //Make sure the channel is a text channel
//         permissionOverwrites: [{ //Set permission overwrites
//             id: msg.guild.id,
//             deny: ['VIEW_CHANNEL'],
//         },
//         {
//           id: leaderRole.id,
//           allow: ['VIEW_CHANNEL'],
//         },
//         {
//           id: modRole.id,
//           allow: ['VIEW_CHANNEL'],
//         }
//       ]
//     });

//     msg.guild.roles.create({
//       data: {
//         name: msg.content + " Chapter",
//         color: '#84eb0d',
//       },
//       reason: `New role for chapter ${msg.content}`
//     })
//       .catch(console.error);

//     console.log("Channel and Role Created!");
    

//     chapter.started == false;
//     chapter.step1 == true;

//     const exampleEmbed = new Discord.MessageEmbed()
//       .setColor('#0099ff')
//       .addFields(
//         { name: 'Creating a Chapter', value: "Channel and role created! \n Next, reply with the emoji you'd like to use for the reaction role." },
//       )
//       .setTimestamp()

//     msg.reply(exampleEmbed);
  
//   // STEP 2
//   }else if(chapter.step1 == true) {

//     if(msg.author.id != chapter.userid) {
//       return true
//     }

  // STEP 3

  // CHAPTER COMMAND END
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
