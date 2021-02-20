module.exports = {
    name: 'unmute',
    description: 'Unmute a user',

    execute(msg, con) {
        var toUnmuteDisplay = undefined;
        var invalid = false;

        if (!msg.member.roles.cache.some(
        role => role.name === "Moderator" || role.name === "Admin" || role.name === "Super User")) {
            msg.reply("You must be a super user, moderator, or admin to use this command.");
            invalid = true;    
        } else {
            const toUnmute = msg.mentions.members.first();
            if (!toUnmute) {
                msg.reply("Please provide a user to unmute.");
                invalid = true;
            } else {
                toUnmuteDisplay = toUnmute.displayName;
            }
        }

        // Removes Muted role from user.
        if (!invalid) {
            toUnmute.roles.remove(msg.guild.roles.cache.find(role => role.name === "Muted"));
            msg.channel.send(`${toUnmute} was unmuted.`);
        }

        // Add record to infractions table.
        const timestamp = new Date(new Date().getTime() + 60 * 60 * 24 * 1000);
        var sql = `INSERT INTO infractions (timestamp, user, action, length_of_time, reason, invalid, moderator) 
        VALUES ('${timestamp}', '${toUnmuteDisplay}', 'cc!unmute', 'N/A', 'N/A', '${invalid}', '${msg.member.displayName}')`;

        con.query(sql, function (err, result) {
            if (err) {
            console.log(err);
            } else {
            console.log("1 record inserted.");
            }
        });

    },
};