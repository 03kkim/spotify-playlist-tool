const express = require("express");
const cors = require("cors");
const spotifyWebApi = require("spotify-web-api-node");

const app = express();
const port = 8000;

require("dotenv").config();

app.use(cors()); // To handle cross-origin requests
app.use(express.json()); // To parse JSON bodies

const credentials = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: "http://localhost:3000/",
};

let spotifyApi = new spotifyWebApi(credentials);

app.get("/", (req, res) => {
  console.log("Hello World!");
});

app.post("/refreshAccessToken", (req, res) => {
  console.log("reached");
  console.log(req.body.refreshToken);

  spotifyApi.setRefreshToken(req.body.refreshToken);
  spotifyApi.refreshAccessToken().then((data) => {
    console.log("expires in: " + data.body.expires_in);
    res.json({
      accessToken: data.body.access_token,
      expiresIn: data.body.expires_in,
      refreshToken: spotifyApi.getRefreshToken(),
    });
  });
});

app.post("/login", (req, res) => {
  //  Get the "code" value posted from the client-side and get the user's accessToken from the spotify api
  const code = req.body.code;

  // Retrieve an access token
  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      // Returning the User's AccessToken in the json formate
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
