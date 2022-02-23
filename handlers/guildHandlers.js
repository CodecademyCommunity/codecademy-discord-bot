function createMutedRole(guild) {
  if (guild.available) {
    guild.roles
      .create({
        name: 'Muted',
        color: 'DARK_BUT_NOT_BLACK',
        permissions: [],
      })
      .then(console.log)
      .catch(console.error);
  }
}

function applyMute(role) {
  if (role.name == 'Muted') {
    role.guild.channels.cache.forEach((channel) => {
      if (channel.isText()) {
        channel.permissionOverwrites.edit(role.id, {
          ADD_REACTIONS: false,
          ATTACH_FILES: false,
          CREATE_PUBLIC_THREADS: false,
          CREATE_PRIVATE_THREADS: false,
          SEND_MESSAGES: false,
          SEND_MESSAGES_IN_THREADS: false,
          SEND_TTS_MESSAGES: false,
          USE_APPLICATION_COMMANDS: false,
        });
      }
    });
  }
}

module.exports = {
  createMutedRole: createMutedRole,
  applyMute: applyMute,
};
