module.exports = {
    name: 'mute',
    description: 'Mute a user',

    execute(msg) {
        if (!msg.member.roles.cache.some(
        role => role.name === "Moderator" || role.name === "Admin")) {
            return msg.reply("You must be a moderator or admin to use this command.");

        } else {
            const toMute = msg.mentions.members.first();
            const reason = msg.content.substr(msg.content.indexOf("@") + toMute.displayName.length + 2);

            if (!toMute) {
                return msg.reply("Please provide a user to mute.");
            }
            if (reason === "") {
                return msg.reply("Please provide a reason for muting.");
            }

            // Denies reacting and message sending permissions in all channels for user.
            msg.guild.channels.cache.forEach(channel => {
                channel.overwritePermissions([{
                    id: toMute.id,
                    deny: ['ADD_REACTIONS', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES']
                }])
            });
            // Adds Muted role to user.
            toMute.roles.add(msg.guild.roles.find(role => role.name === "Muted"));

            return msg.channel.send(`@${toMute.displayName} was muted by @${msg.member.displayName}.\nReason: ${reason}`);
        }
    },
};