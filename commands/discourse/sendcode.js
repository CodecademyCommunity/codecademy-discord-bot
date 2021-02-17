module.exports = {
	name: 'sendcode',
	description: 'Sends the user a code based on their discourse email',
	execute(msg, args, userid, fetch, con, sgMail) {
        params = msg.content.substr(msg.content.indexOf(" ") + 1);

        clientUsername = params.split(" ");

        const uuid = userid;

        if(clientUsername == '!sendcode'){
        msg.reply("Please include your Codecademy Discuss username");
        }else{
        (async () => {

            const response = await fetch(`https://discuss.codecademy.com/users/${clientUsername[0]}/emails.json`, {
            method: 'get',
            headers: {
                'Api-Key': process.env.DISCOURSE_API_KEY,
                'Api-Username': 'vic-st',
                'Content-Type': 'application/json'
            }
            });
            jsonres = await response.json();

            const email = jsonres.email

            console.log(email)
            if(email === undefined) {
            msg.reply("The account name you entered does not exist");
            }else{
            const date = new Date(new Date().getTime() + 60 * 60 * 24 * 1000);

            console.log(date)
            
            var sql = `INSERT INTO verifications (username, id, expiration) VALUES ('${clientUsername[0]}', '${uuid}', '${date}')`;
            con.query(sql, function (err, result) {
                if (err) {
                console.log(err);
                } else {
                console.log("1 record inserted");

                const mail = {
                    to: email, // Change to your recipient
                    from: 'community@codecademy.com', // Change to your verified sender
                    subject: `Your Codecademy Discord Verification`,
                    text: `Hi @${clientUsername[0]}! Your Codecademy Discord Verification ID is ${uuid}. Paste this message into the channel #verification with the format: !verify ${uuid}.`,
                    html: `<p>Hi @${clientUsername[0]}!</p><p>Your Codecademy Discord Verification ID is <strong>${uuid}</strong></p><p>Paste this message into the channel #verification with the format: !verify ${uuid}</p>`,
                }
                sgMail
                    .send(mail)
                    .then(() => {
                    console.log('Email sent')
                    })
                    .catch((error) => {
                    console.error(error)
                    })

                msg.reply("Verification ID sent!")
                }
            });
            }
        })();
        }
    },
};

