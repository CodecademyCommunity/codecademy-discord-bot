module.exports = {
  name: 'help',
  description: 'Send help message',
  execute(msg, args) {
    if (args[0]) {
      switch (args[0]) {
        case 'cc!createroles':
        case 'createroles':
          msg.channel.send(
            'Pulls all badges from Codecademy Discuss and create a roll for each one. *Admin priviliges required'
          );
          break;

        case 'cc!deleteroles':
        case 'deleteroles':
          msg.channel.send(
            'Deletes all roles created from Codecademy Discuss. *Admin priviliges required'
          );
          break;

        case 'cc!sendcode':
        case 'sendcode':
          msg.channel.send(
            'Sends a varification code to your Codecademy Discull email. *requires you to insert your user name after command: cc!sendcode [username]'
          );
          break;

        case 'cc!verify':
        case 'verify':
          msg.channel.send(
            'Verifies that the code entered is valid and gives you a role for every badge you have on Discourse. *requires you to enter your verification code after command: cc!verify [code]'
          );
          break;

        case 'cc!ping':
        case 'ping':
          msg.channel.send('Responds with Pong.');
          break;

        case 'cc!stats':
        case 'stats':
          msg.channel.send(
            'Displays numbers of online members, offline members, and total members.'
          );
          break;

        default:
          msg.channel.send(
            'That is not a command. For a full list type cc!help'
          );
      }
    } else {
      msg.channel.send(`**Commands**
    cc!createroles* - Pulls all badges from Codecademy Discuss and creates a role for each one.
    cc!deleteroles* - Deletes all the roles added from Codecademy Discuss.
                        
    cc!sendcode [username] - Sends a verification code to your Codecademy Discuss email.
    cc!verify [code] - Verifies that the code entered is valid and gives you a role for every badge you have on Discourse.
    cc!ping - Responds with "Pong.".
    cc!stats - Displays number of online, offline, and total members.
    cc!help - Displays this page.
    *Admin Only`);
    }
  },
};
