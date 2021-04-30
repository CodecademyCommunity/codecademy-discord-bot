module.exports = {
  name: 'deleteroles',
  description: 'Deletes all the roles created by the bot',
  execute(msg, fetch) {
    if (!msg.member.hasPermission('ADMINISTRATOR')) {
      return msg.reply('You need administrator perms to run this command');
    } else {
      msg.reply('Deleting roles...');

      let counter = 0;

      (async () => {
        const response = await fetch(
          'https://discuss.codecademy.com/admin/badges.json',
          {
            method: 'get',
            headers: {
              'Api-Key': process.env.DISCOURSE_API_KEY,
              'Api-Username': 'vic-st',
              'Content-Type': 'application/json',
            },
          }
        );

        const badges = await response.json();

        for (let i = 0; i < badges.badges.length; i++) {
          const role = msg.guild.roles.cache.find(
            ({name}) => name === badges.badges[i].name
          );

          if (role !== undefined) {
            role
              .delete('Deleting all roles pulled from by bot')
              .then((deleted) => console.log(`Deleted role ${deleted.name}`))
              .catch(console.error);
            counter += 1;
          }
        }
        msg.reply(`${counter} roles deleted`);
      })();
    }
  },
};
