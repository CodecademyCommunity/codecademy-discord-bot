const {ID_CODE_COUNSELOR, ID_MODERATOR, ID_ADMIN, ID_SUPER_ADMIN} = process.env;

const allStaffRoles = [
  ID_CODE_COUNSELOR,
  ID_MODERATOR,
  ID_ADMIN,
  ID_SUPER_ADMIN,
];
const moderatorRoles = [ID_MODERATOR, ID_ADMIN, ID_SUPER_ADMIN];

const everyoneRoles = ['@everyone'];

const commandRoles = new Map([
  ['helpcenter', everyoneRoles],
  ['stats', everyoneRoles],
  ['ping', allStaffRoles],
  ['notes', allStaffRoles],
  ['addnote', allStaffRoles],
  ['removenote', moderatorRoles],
  ['clearmessages', moderatorRoles],
  ['kick', moderatorRoles],
  ['verbal', moderatorRoles],
  ['timeout', moderatorRoles],
  ['removetimeout', moderatorRoles],
]);

module.exports = {
  commandRoles,
};
