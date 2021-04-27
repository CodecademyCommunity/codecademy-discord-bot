module.exports = {
  commandParser: async (client, con, msg) => {
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
};
