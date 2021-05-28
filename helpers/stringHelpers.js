module.exports = {
  name: 'strings',
  isOver255(text, preText = '', postText = '') {
    const fullText = `${preText}${text}${postText}`;

    const lengthOver = fullText.length - 255;

    if (lengthOver > 0) {
      return lengthOver;
    } else {
      return 0;
    }
  },
};
