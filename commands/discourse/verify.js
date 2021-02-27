module.exports = {
  name: "verify",
  description: "Verifies the user ID you provided",
  execute(msg, con, fetch) {
    const params = msg.content.substr(msg.content.indexOf(" ") + 1);
    const clientId = params.split(" ");

    if (clientId == "cc!verify") {
      msg.reply("Please include your verification code");
    } else {
      const member = msg.mentions.members.first() || msg.member;

      const sql = `SELECT * FROM verifications WHERE id = '${clientId[0]}'`;
      con.query(sql, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          if (result.length === 0) {
            msg.reply("The ID you entered is invalid");
          } else {
            console.log(result[0].username);

            const currentDay = new Date();

            const expirationDate = new Date(result[0].expiration);
            if (currentDay.getTime() > expirationDate.getTime()) {
              msg.reply("This ID has expired, try generating a new one.");
            } else {
              (async () => {
                const response = await fetch(
                  `https://discuss.codecademy.com/user-badges/${result[0].username}.json`,
                  {
                    method: "get",
                    headers: {
                      "Api-Key": process.env.DISCOURSE_API_KEY,
                      "Api-Username": "vic-st",
                      "Content-Type": "application/json",
                    },
                  }
                );
                const jsonres = await response.json();

                const roleTest = msg.guild.roles.cache.find(
                  ({name}) => name === jsonres.badges[0].name
                );

                if (roleTest === undefined) {
                  msg.reply(
                    "The admin hasn't pulled the roles from Discourse using !createroles"
                  );
                } else {
                  for (let i = 0; i < jsonres.badges.length; i++) {
                    console.log(jsonres.badges[i].name);

                    const role = msg.guild.roles.cache.find(
                      ({name}) => name === jsonres.badges[i].name
                    );

                    setTimeout(addUser, 500);

                    // TODO: Refactor this and remove this inner function
                    /* eslint-disable no-inner-declarations */
                    function addUser() {
                      member.roles.add(role);
                    }
                  }
                  msg.reply("Your roles have been assigned!");
                }
              })();
            }
          }
        }
      });
    }
  },
};
