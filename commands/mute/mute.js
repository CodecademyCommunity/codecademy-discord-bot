module.exports = {
    name: 'mute',
    description: 'Mute a user',

    execute(msg) {
        if (!msg.member.roles.cache.some(
        role => role.name === "Moderator" || role.name === "Admin")) {
            return msg.reply("You must be a moderator or admin to use this command.");

        } else {
            const toMute = msg.mentions.members.first();
            if (!toMute) {
                return msg.reply("Please provide a user to mute.");
            }

            const reason = msg.content.substr(msg.content.indexOf(">") + 2);
            if (reason === "") {
                return msg.reply("Please provide a reason for muting.");
            }

            // Adds Muted role to user.
            toMute.roles.add(msg.guild.roles.cache.find(role => role.name === "Muted"));

            return msg.channel.send(`@${toMute.displayName} was muted by @${msg.member.displayName}.\nReason: ${reason}`);
        }
    },
};