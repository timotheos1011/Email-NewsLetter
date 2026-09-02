require("dotenv").config();
const apiKey = process.env.MAILCHIMP_API_KEY;
const listId = process.env.LIST_ID;
const express = require("express");
const https = require("https");

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
  console.log("The page is sending signup html");
});

app.post("/", function (req, res) {
        const firstName = req.body?.fName;
        const lastName = req.body?.lName;
        const email = req.body?.email;

        if (!firstName || !lastName || !email) {
          return res.status(400).send("Missing form data");
        }

        const data = {
          members: [
            {
              email_address: email,
              status: "subscribed",
              merge_fields: {
                FNAME: firstName,
                LNAME: lastName,
              },
            },
          ],
        };

        const jsonData = JSON.stringify(data);
        const url = "https://us10.api.mailchimp.com/3.0/lists/" + listId;
        const options = {
          method: "POST",
          auth: "angela1:" + apiKey,
        };

        const mailchimpRequest = https.request(url, options, function (response) {
          if (response.statusCode === 200) {
            res.sendFile(__dirname + "/success.html");
          } else {
            res.sendFile(__dirname + "/failure.html");
          }

          response.on("data", function (data) {
            console.log(JSON.parse(data));
          });
        });

        mailchimpRequest.write(jsonData);
        mailchimpRequest.end();
});

app.post("/failure", function (req, res) {
  res.redirect("/");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on port " + process.env.PORT);
});

