const Discord = require('discord.js');
const fs = require('fs');

function collectCommands({client, regularCommandsDir, slashCommandsDir}) {
  client.commands = new Discord.Collection();
  collect(regularCommandsDir, client.commands);

  client.slashCommands = new Discord.Collection();
  collect(slashCommandsDir, client.slashCommands);
}

function collect(dir, collection) {
  const folders = fs.readdirSync(dir);
  for (const folder of folders) {
    const files = fs
      .readdirSync(`${dir}/${folder}`)
      .filter((file) => file.endsWith('.js'));
    for (const file of files) {
      const item = require(`${dir}/${folder}/${file}`);
      collection.set(item.data ? item.data.name : item.name, item);
    }
  }
}

module.exports = {
  collectCommands,
};
