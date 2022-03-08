const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slash-helpcenter')
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

      interaction.reply({embeds: [HelpCenterMessage]});
    }
  },
};
