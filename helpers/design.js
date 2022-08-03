function getEmbedHexFlairColor() {
  const embedFlair = [
    0xf8f272,
    0xf98948,
    0xa23e48,
    0x6096ba,
    0x86a873,
    0xd3b99f,
    0x6e6a6f,
  ];
  return embedFlair[Math.floor(Math.random() * embedFlair.length)];
}

module.exports = {getEmbedHexFlairColor};
