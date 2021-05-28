const Discord = require('discord.js');

module.exports = {
  name: 'helpcenter',
  description: "Provides commonly used links to CC's Help Centre",
  guildOnly: false,

  execute(msg, args, con) {
    if (args == 'plaintext') {
      msg.channel.send(
        '**Codecademy Help Center:** https://help.codecademy.com/hc/en-us\n' +
          '**Submit A Request:** https://help.codecademy.com/hc/en-us/requests/new\n' +
          '**Bug Reporting:** To report a bug, click *Get Unstuck* in the learning environment, then click *Bugs*.\n' +
          'All billing-related queries should be directed to the Submit A Request form linked above.'
      );
    } else {
      const embed = new Discord.MessageEmbed()
        .setTitle('Codecademy Help Center Resources')
        .setColor('DARK_NAVY')
        .addField(
          'Codecademy Help Center',
          'https://help.codecademy.com/hc/en-us'
        )
        .addField(
          'Submit A Request',
          'https://help.codecademy.com/hc/en-us/requests/new'
        )
        .addField(
          'Bug Reporting',
          'To report a bug, click *Get Unstuck* in the learning environment, then click *Bugs*.'
        )
        .setFooter(
          'All billing-related queries should be directed to the Submit A Request form linked above.'
        );

      msg.reply(embed);
    }
  },
};
