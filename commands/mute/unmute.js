module.exports = {
    name: 'unmute',
    description: 'Unmute a user',

    execute(msg) {
        if (!msg.member.roles.cache.some(
        role => role.name === "Moderator" || role.name === "Admin" || role.name === "Super User")) {
            return msg.reply("You must be a super user, moderator, or admin to use this command.");
        
        } else {
            const toUnmute = msg.mentions.members.first();
            if (!toUnmute) {
                return msg.reply("Please provide a user to unmute.");
            }

            // Removes Muted role from user.
            toUnmute.roles.remove(msg.guild.roles.cache.find(role => role.name === "Muted"));

            return msg.channel.send(`${toUnmute} was unmuted.`);
        }
    },
};