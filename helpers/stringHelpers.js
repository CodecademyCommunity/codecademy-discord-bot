module.exports = {
  name: 'strings',
  isTooLong(text, maxLength = 255) {
    const lengthOver = text.length - maxLength;

    if (lengthOver > 0) {
      return lengthOver;
    } else {
      return 0;
    }
  },

  verifyReasonLength(text, msg, maxLength = 255) {
    const amountOver = this.isTooLong(text, maxLength);
    if (amountOver) {
      return msg.reply(
        `The reason you provided is over the 255 character limit by ${amountOver}. Please shorten and retry.`
      );
    }
  },
};
