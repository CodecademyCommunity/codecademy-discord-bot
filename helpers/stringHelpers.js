module.exports.name = 'strings';

function isTooLong(text, maxLength = 255) {
  const lengthOver = text.length - maxLength;

  if (lengthOver > 0) {
    return lengthOver;
  } else {
    return 0;
  }
}
module.exports.isTooLong = isTooLong;

function verifyReasonLength(text, msg, maxLength = 255) {
  const amountOver = isTooLong(text, maxLength);
  if (amountOver) {
    msg.reply(
      `The reason you provided is over the ${maxLength} character limit by ${amountOver}. Please shorten and retry.`
    );
    return false;
  }
  return true;
}
module.exports.verifyReasonLength = verifyReasonLength;
