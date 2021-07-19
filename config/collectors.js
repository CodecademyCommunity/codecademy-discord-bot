const Discord = require('discord.js');
const fs = require('fs');

function collectCommands(client, commandsDir) {
  client.commands = new Discord.Collection();
  collect(commandsDir, client.commands);
}

function collect(dir, collection) {
  const folders = fs.readdirSync(dir);
  for (const folder of folders) {
    const files = fs
      .readdirSync(`${dir}/${folder}`)
      .filter((file) => file.endsWith('.js'));
    for (const file of files) {
      const item = require(`${dir}/${folder}/${file}`);
      collection.set(item.name, item);
    }
  }
}

module.exports = {
  collectCommands,
  collect,
};
