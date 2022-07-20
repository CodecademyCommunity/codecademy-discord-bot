const {ID_CODE_COUNSELOR, ID_MODERATOR, ID_ADMIN, ID_SUPER_ADMIN} = process.env;

const allStaffRoles = [
  ID_CODE_COUNSELOR,
  ID_MODERATOR,
  ID_ADMIN,
  ID_SUPER_ADMIN,
];
const moderatorRoles = [ID_MODERATOR, ID_ADMIN, ID_SUPER_ADMIN];
const adminRoles = [ID_ADMIN, ID_SUPER_ADMIN];

const everyoneRoles = ['@everyone'];

const commandRoles = new Map([
  ['helpcenter', everyoneRoles],
  ['stats', everyoneRoles],
  ['addnote', allStaffRoles],
  ['notes', allStaffRoles],
  ['ping', allStaffRoles],
  ['timeout', allStaffRoles],
  ['ban', moderatorRoles],
  ['clearmessages', moderatorRoles],
  ['infractions', moderatorRoles],
  ['kick', moderatorRoles],
  ['records', moderatorRoles],
  ['removenote', moderatorRoles],
  ['removetimeout', moderatorRoles],
  ['unban', moderatorRoles],
  ['verbal', moderatorRoles],
  ['warn', moderatorRoles],
  ['clearinfractions', adminRoles]
]);

module.exports = {
  commandRoles,
};
