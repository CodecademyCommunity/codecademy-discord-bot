async function isServerStaff(interaction, targetUser) {
  const user = await interaction.guild.members.cache.get(targetUser.id);
  return user?.roles?.cache.some((role) =>
    [
      process.env.ID_CODE_COUNSELOR,
      process.env.ID_MODERATOR,
      process.env.ID_ADMIN,
      process.env.ID_SUPER_ADMIN,
    ].includes(role.id)
  )
    ? true
    : false;
}

async function sendNoTargetStaffReply(interaction) {
  return await interaction.reply(
    `You cannot use this command on a Code Counselor, Moderator or Admin.`
  );
}

module.exports = {isServerStaff, sendNoTargetStaffReply};
