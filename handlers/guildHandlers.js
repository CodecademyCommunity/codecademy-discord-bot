function createOnMuteRole(guild) {
  if (guild.available) {
    if (!guild.roles.cache.some((role) => role.name === 'On Mute')) {
      guild.roles
        .create({
          name: 'On Mute',
          color: 'DARK_BUT_NOT_BLACK',
          permissions: [],
        })
        .then(console.log)
        .catch(console.error);
    } else {
      const onMute = guild.roles.cache.find((role) => role.name === 'On Mute');
      applyMuteRestrictionsToOnMuteRole(onMute);
    }
  }
}

function applyMuteRestrictionsToOnMuteRole(role) {
  if (role.name == 'On Mute') {
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
  createOnMuteRole: createOnMuteRole,
  applyMuteRestrictionsToOnMuteRole: applyMuteRestrictionsToOnMuteRole,
};
