// const express = require("express");
// const app = express();
// const cors = require("cors");
// const dotenv = require("dotenv");
// const querystring = require("querystring");
// const axios = require("axios");

// dotenv.config();

// const port = 8080;
// const client_id = process.env.CLIENT_ID;
// const client_secret = process.env.CLIENT_SECRET;
// const redirect_uri = "http://localhost:8080/callback";
// var state = "";

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());

// const AuthRoutes = require("./routes/authRoutes.js");
// app.use("/api", cors(), AuthRoutes);

// // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
// function generateRandomString(length) {
//   let result = "";
//   const characters =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   const charactersLength = characters.length;
//   let counter = 0;
//   while (counter < length) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     counter += 1;
//   }
//   return result;
// }

// app.get("/test", (req, res) => {
//   console.log("test called!");
//   res.json("Success");
// });

// app.get("/", (req, res) => {
//   res.json("Main page");
// });

// app.listen(port, () => {
//   console.log(`Server listening on the port::${port}`);
// });

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 8080;
const application = express();

application.use(express.json());
application.use(express.urlencoded({ extended: true }));
application.use(cors());

const AuthRoutes = require("./routes/authRoutes.js");
application.use("/", cors(), AuthRoutes);

application.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
