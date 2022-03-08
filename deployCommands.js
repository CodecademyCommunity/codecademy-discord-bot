const fs = require('fs');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
require('dotenv').config();

const commands = [];
const commandsDir = `${__dirname}/commands/slash`;
const commandFiles = fs
  .readdirSync(commandsDir)
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`${commandsDir}/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({version: '9'}).setToken(process.env.DISCORD_SECRET_KEY);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      {
        body: commands,
      }
    );

    console.log('Successfully registered application commands.');
  } catch (error) {
    console.error(error);
  }
})();
