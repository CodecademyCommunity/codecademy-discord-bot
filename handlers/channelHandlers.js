const extendMutes = (channel) => {
  if (channel.guild != null) {
    const muted = channel.guild.roles.cache.find(
      (role) => role.name === 'Muted'
    );
    channel.updateOverwrite(muted.id, {
      ADD_REACTIONS: false,
      SEND_MESSAGES: false,
      SEND_TTS_MESSAGES: false,
    });
  }
};

module.exports = {
  extendMutes: extendMutes,
};
