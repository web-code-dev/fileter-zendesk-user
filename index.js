let dotenv = require('dotenv');
let express = require('express');

dotenv.config();
let zendesk_domain = process.env.zendesk_domain;
let zendesk_email = process.env.zendesk_email;
let zendesk_token = process.env.zendesk_token;

let app = express();
let port = process.env.PORT || 3000;
app.use(express.json());

app.post('/', async (req, res) => {
    try {
        let requesterId = req.body.requester_id;
        let requesterName = req.body.requester_name;

        if (requesterId && requesterName) {
            let cleanName = requesterName.replace(/[^a-zA-Z0-9 ]/g, '').trim();

            if (cleanName !== requesterName) {
                let response = await fetch(`https://${zendesk_domain}.zendesk.com/api/v2/users/${requesterId}.json`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${Buffer.from(`${zendesk_email}/token:${zendesk_token}`).toString('base64')}`
                    },
                    body: JSON.stringify({
                        user: {
                            name: cleanName
                        }
                    })
                });

                let result = await response.json();
                console.log("User updated in Zendesk:", result);
                res.status(200).json({ message: "User name cleaned and updated", cleanName });
            } else {
                console.log("Name already clean:", requesterName);
                res.status(200).json({ message: "Name already clean", cleanName });
            }
        } else {
            res.status(400).json({ error: "Missing requester_id or requester_name" });
        }
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
