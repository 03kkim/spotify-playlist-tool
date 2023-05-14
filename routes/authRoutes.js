const express = require("express");
const router = express.Router();
const querystring = require("querystring");

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = "http://localhost:8080/callback";
let access_token;
let refresh_token;

const axios = require("axios");
var state = "";

function generateRandomString(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

// this can be used as a seperate module
const encodeFormData = (data) => {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
};

router.get("/", (req, res) => {
  state = generateRandomString(16);
  var scope = "user-read-private user-read-email";

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

router.get("/callback", async (req, res) => {
  if (req.query.state !== state) {
    return;
  }
  console.log(req.query.state);
  // res.json("callback page");

  const body = {
    grant_type: "authorization_code",
    code: req.query.code,
    redirect_uri: redirect_uri,
  };

  const spotifyResponse = await axios.post(
    "https://accounts.spotify.com/api/token",
    querystring.stringify(body),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET,
          "utf8"
        ).toString("base64")}`,
      },
    }
  );
  access_token = spotifyResponse["data"]["access_token"];
  refresh_token = spotifyResponse["data"]["refresh_token"];
  // console.log(spotifyResponse);
  // console.log(refresh_token);
  // .then((response) => response.json());
  // .then((data) => {
  //   const query = querystring.stringify(data);
  //   res.redirect(`${process.env.CLIENT_REDIRECTURI}?${query}`);
  // });
});

router.get("/refresh_token", function (req, res) {
  console.log(refresh_token);
  console.log(access_token);

  axios.post(
    "https://accounts.spotify.com/api/token",
    querystring.stringify({
      access_token: access_token,
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    }),
    {
      headers: {
        Authorization:
          "Basic " +
          new Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
    }
  );
});
module.exports = router;
