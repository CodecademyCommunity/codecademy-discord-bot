const {hasTargetUser} = require('../../helpers/hasTargetUser');
const {infractionsInDB} = require('../utility/infractions');
const {notesInDB} = require('./notes');

module.exports = {
  name: 'rapsheet',
  description:
    'Returns the notes and infractions for a user with a single command.',
  guildOnly: true,
  staffOnly: true,
  minRole: 'Moderator',

  execute(msg, args, con) {
    const targetUser =
      msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);

    if (hasTargetUser(msg, targetUser, 'get notes and infractions from')) {
      // Find and send all infraction records
      infractionsInDB(msg, con, targetUser);

      // Find and send all notes
      notesInDB(msg, con, targetUser);
    }
  },
};
