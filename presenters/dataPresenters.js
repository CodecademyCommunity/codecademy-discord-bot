const {formatDistanceToNow} = require('date-fns');

function notesPresenter(interaction, notes) {
  const formattedNotes = notes.reduce((validNotes, currentNote) => {
    if (currentNote.valid) {
      validNotes.push({
        name: `ID: ${currentNote.id}   ${formatDistanceToNow(
          currentNote.timestamp
        )} ago`,
        value: `${interaction.guild.members.cache.get(
          currentNote.moderator
        )}: ${currentNote.note}`,
      });
    }
    return validNotes;
  }, []);

  return {name: 'notes', records: formattedNotes};
}

function infractionsPresenter(infractions) {
  const formattedInfractions = infractions.reduce(
    (validInfractions, currentInfraction) => {
      if (currentInfraction.valid) {
        validInfractions.push({
          name: `ID: ${currentInfraction.id}  ${
            currentInfraction.action
          }  ${formatDistanceToNow(currentInfraction.timestamp)} ago`,
          value: currentInfraction.reason,
        });
      }
      return validInfractions;
    },
    []
  );
  return {name: 'infractions', records: formattedInfractions};
}

module.exports = {
  notesPresenter,
  infractionsPresenter,
};
