const extendMutes = (channel) => {
  if (channel.guild != null && channel.isText()) {
    const muted = channel.guild.roles.cache.find(
      (role) => role.name === 'Muted'
    );
    channel.permissionOverwrites.edit(muted.id, {
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
