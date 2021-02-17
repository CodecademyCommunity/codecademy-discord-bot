module.exports = {
	name: 'help',
	description: 'Send help message',
	execute(msg, args) {
		let member = msg.mentions.members.first() || msg.member 
          user = member.user;
          channel = msg.channel.id;

        msg.channel.send(`**Commands**
    !createroles* - Pulls all badges from Codecademy Discuss and creates a role for each one.
    !deleteroles* - Deletes all the roles added from Codecademy Discuss.
                        
    !sendcode [username] - Sends a verification code to your Codecademy Discuss email.
    !verify [code] - Verifies that the code entered is valid and gives you a role for every badge you have on Discourse.
    !help - Displays this page.
    *Admin Only`);
	},
};