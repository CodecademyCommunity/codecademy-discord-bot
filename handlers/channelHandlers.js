const extendMutes = (channel) => {
  if (channel.guild != null && channel.isText()) {
    const onMute = channel.guild.roles.cache.find(
      (role) => role.name === 'On Mute'
    );
    channel.permissionOverwrites.edit(onMute.id, {
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
};

module.exports = {
  extendMutes: extendMutes,
};
