function getEmbedHexFlairColor() {
  const embedFlair = [
    '#f8f272',
    '#f98948',
    '#a23e48',
    '#6096ba',
    '#86a873',
    '#d3b99f',
    '#6e6a6f',
  ];
  return embedFlair[Math.floor(Math.random() * embedFlair.length)];
}

module.exports = {getEmbedHexFlairColor};
