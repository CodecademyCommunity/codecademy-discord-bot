const {ID_CODE_COUNSELOR, ID_MODERATOR, ID_ADMIN, ID_SUPER_ADMIN} = process.env;

module.exports = {
  // Commands with .setDefaultPermission(false) need to be enabled by role IDs.
  // Commands without .setDefaultPermission(false) need to be listed in commandRoles
  // but can use an empty array for permission roles (all users can access them).

  commandRoles: new Map([
    ['helpcenter', []],
    ['ping', [ID_CODE_COUNSELOR]],
    ['stats', [ID_MODERATOR, ID_ADMIN, ID_SUPER_ADMIN]],
  ]),
};
