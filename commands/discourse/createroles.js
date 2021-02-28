module.exports = {
  name: 'createroles',
  description: 'Creates all the roles based off of the discourse badges',
  execute(msg, fetch, colors) {
    if (!msg.member.hasPermission('ADMINISTRATOR')) {
      return msg.reply('You need administrator perms to run this command');
    } else {
      msg.reply('Creating roles...');

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

          if (role === undefined) {
            msg.guild.roles
              .create({
                data: {
                  name: badges.badges[i].name,
                  color: colors[i],
                },
                reason: badges.badges[i].description,
              })
              .catch(console.error);
            counter += 1;
          }
        }

        msg.reply(`${counter} roles created`);
      })();
    }
  },
};
