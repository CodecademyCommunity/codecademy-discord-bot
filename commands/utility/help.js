module.exports = {
	name: 'help',
	description: 'Send help message',
	execute(msg) {
        msg.channel.send(`**Commands**
    cc!createroles* - Pulls all badges from Codecademy Discuss and creates a role for each one.
    cc!deleteroles* - Deletes all the roles added from Codecademy Discuss.
                        
    cc!sendcode [username] - Sends a verification code to your Codecademy Discuss email.
    cc!verify [code] - Verifies that the code entered is valid and gives you a role for every badge you have on Discourse.
    cc!help - Displays this page.
    *Admin Only`);
	},
};
