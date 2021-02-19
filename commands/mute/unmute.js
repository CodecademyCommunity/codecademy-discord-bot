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

            // Provides reacting and message sending permissions in all channels for user.
            msg.guild.channels.cache.forEach(channel => {
                channel.overwritePermissions([{
                    id: toUnmute.id,
                    allow: ['ADD_REACTIONS', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES']
                }])
            });
            // Removes Muted role to user.
            toUnmute.roles.remove(msg.guild.roles.cache.find(role => role.name === "Muted"));

            return msg.reply(`@${toUnmute.displayName} was successfully unmuted.`);
        }
    },
};