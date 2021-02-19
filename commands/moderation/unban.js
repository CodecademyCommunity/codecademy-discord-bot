module.exports = {
    name: "unban",
    description: "Unban a user",
    
    execute(msg) {
        if (!msg.member.roles.cache.some(
            role => role.name === "Admin")) {
                return msg.reply("You must be a super user, moderator, or admin to use this command.");
        }
    }
}
