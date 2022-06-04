const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('helpcenter')
    .setDescription('Provides information to access the helpcenter!')
    .addBooleanOption((option) =>
      option
        .setName('plaintext')
        .setDescription('Provides helpcenter in plaintext format')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (interaction.options.getBoolean('plaintext') == true) {
      await interaction.reply({
        content:
          '**Codecademy Help Center:** https://help.codecademy.com/hc/en-us\n' +
          '**Submit A Request:** https://help.codecademy.com/hc/en-us/requests/new\n' +
          '**Bug Reporting:** To report a bug, click *Get Unstuck* in the learning environment, then click *Bugs*.\n' +
          'All billing-related queries should be directed to the Submit A Request form linked above.',
      });
    } else {
      const HelpCenterMessage = new MessageEmbed()
        .setTitle('Codecademy Help Center Resources')
        .setColor('DARK_NAVY')
        .addFields(
          {
            name: 'Codecademy Help Center',
            value: 'https://help.codecademy.com/hc/en-us',
          },
          {
            name: 'Submit A Request',
            value: 'https://help.codecademy.com/hc/en-us/requests/new',
          },
          {
            name: 'Bug Reporting',
            value:
              'To report a bug, click *Get Unstuck* in the learning environment, then click *Bugs*.',
          }
        )
        .setFooter({
          text:
            'All billing-related queries should be directed to the Submit A Request form linked above.',
        });

      interaction.reply({embeds: [HelpCenterMessage]});
    }
  },
};
