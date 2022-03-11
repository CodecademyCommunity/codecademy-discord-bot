const {ID_CODE_COUNSELOR, ID_MODERATOR, ID_ADMIN, ID_SUPER_ADMIN} = process.env;

module.exports = {
  commandRoles: new Map([
    ['slash-ping', [ID_SUPER_ADMIN, ID_ADMIN]],
    ['slash-format', [ID_MODERATOR, ID_CODE_COUNSELOR]],
    ['slash-helpcenter', [ID_SUPER_ADMIN, ID_ADMIN]],
    ['slash-stats', [ID_MODERATOR]],
  ]),
};
