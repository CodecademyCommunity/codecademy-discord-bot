module.exports = {
    name: 'mute',
    description: 'Mute a user',

    execute(msg, con) {
        var toMuteDisplay = undefined;
        var reason = undefined;
        var invalid = false;

        if (!msg.member.roles.cache.some(
        role => role.name === "Moderator" || role.name === "Admin")) {
            msg.reply("You must be a moderator or admin to use this command.");
            invalid = true;
        } else {
            const toMute = msg.mentions.members.first();
            if (!toMute) {
                msg.reply("Please provide a user to mute.");
                invalid = true;
            } else if (toMute === msg.member) {
                msg.reply("You cannot mute yourself.");
                invalid = true;
            } else if (toMute.roles.cache.some(
            role => role.name === "Moderator" || role.name === "Admin")) {
                msg.reply("You cannot mute a moderator or admin.");
                invalid = true;
            } else {
                toMuteDisplay = toMute.displayName;

                const reason = msg.content.substr(msg.content.indexOf(">") + 2);
                if (reason === "") {
                    msg.reply("Please provide a reason for muting.");
                    invalid = true;
                }
            }
    
            // Adds Muted role to user.
            if (!invalid) {
                toMute.roles.add(msg.guild.roles.cache.find(role => role.name === "Muted"));
                msg.channel.send(`${toMute} was muted by ${msg.member}.\nReason: ${reason}`);
            }
        }

        // Add record to infractions table.
        const timestamp = new Date(new Date().getTime() + 60 * 60 * 24 * 1000);
        var sql = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, invalid, moderator) 
        VALUES ('${timestamp}', '${toMuteDisplay}', 'cc!mute', 'N/A', '${reason}', '${invalid}', '${msg.member.displayName}')`;

        con.query(sql, function (err, result) {
            if (err) {
            console.log(err);
            } else {
            console.log("1 record inserted.");
            }
        });

    },
};