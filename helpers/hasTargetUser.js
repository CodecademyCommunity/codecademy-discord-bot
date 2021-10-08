function hasTargetUser(msg, targetUser, action) {
  if (targetUser) {
    return true;
  } else {
    msg.reply(failSnark(action));
    return false;
  }
}

function failSnark(action) {
  const snarkMessages = [
    `Ok there bud, who are you trying to ${action} again?`,
    'You definitely missed the target user there...',
    'Shoot first ask later? You forgot the target user',
    `Not judging, but you didn't set a user to ${action}`,
    `Without a target user I can't ${action} anyone but you`,
    'Forgot the target user. Wanna try again?',
    `Please tell you *do* know who to ${action}? You forgot the user`,
    'You definitely missed the target user there...',
    `Not judging, but you didn't set a user to ${action}...`,
    'You forgot the target user',
    'Forgot the target user. Wanna try again?',
    'Here I was thinking this command was easy enough. You forgot the target user',
  ];
  return snarkMessages[Math.floor(Math.random() * snarkMessages.length)];
}

module.exports = {hasTargetUser};
