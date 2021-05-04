function createMutedRole(guild) {
  if (guild.available) {
    guild.roles
      .create({
        data: {
          name: 'Muted',
          color: 'DARK_BUT_NOT_BLACK',
          permissions: [],
        },
      })
      .then(console.log)
      .catch(console.error);
  }
}

function applyMute(oldMember, newMember) {
  const muted = newMember.guild.roles.cache.find(
    (role) => role.name === 'Muted'
  );
  newMember.guild.channels.cache.forEach((channel) => {
    if (
      channel.type === 'text' &&
      newMember === channel.members.find((member) => member.id === newMember.id)
    ) {
      channel.updateOverwrite(muted.id, {
        ADD_REACTIONS: false,
        SEND_MESSAGES: false,
        SEND_TTS_MESSAGES: false,
      });
    }
  });
}

module.exports = {
  createMutedRole: createMutedRole,
  applyMute: applyMute,
};
