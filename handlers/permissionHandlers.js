const {has} = require('../helpers/has');

const RoleEnum = {
  'Forums Super User': 0,
  'Code Counselor': 1,
  Moderator: 2,
  Admin: 3,
  'Super Admin': 4,
  'Better Then Admin': 5,
};

function hasPermission(msg, command) {
  const highestRole = msg.member.roles.highest.name;

  if (!has(RoleEnum, highestRole)) {
    return false;
  }

  if (RoleEnum[highestRole] < RoleEnum[command.minRole]) {
    return false;
  }

  return true;
}

module.exports = {
  RoleEnum: RoleEnum,
  hasPermission: hasPermission,
};
