const Discord = require('discord.js');
const fs = require('fs');

function collectCommands(client, commandsDir) {
  client.commands = new Discord.Collection();

  const commandFolders = fs.readdirSync(commandsDir);

  for (const folder of commandFolders) {
    const commandFiles = fs
      .readdirSync(`${commandsDir}/${folder}`)
      .filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(`${commandsDir}/${folder}/${file}`);
      client.commands.set(command.name, command);
    }
  }
}

module.exports = {
  collectCommands: collectCommands,
};
