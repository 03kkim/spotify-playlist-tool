import React from "react";
import { loginUrl } from "../spotify";
import { Box } from "@mui/material";

function Login() {
  return (
    <Box
      component="div"
      sx={{
        display: "grid",
        placeItems: "center",
        height: "100vh",
        backgroundColor: "black",

        "& img": {
          width: "50%",
        },

        "& a": {
          padding: "20px",
          borderRadius: "99px",
          backgroundColor: "#1db954",
          fontWeight: 600,
          color: "white",
          textDecoration: "none",
        },

        "& a:hover": {
          backgroundColor: " white",
          borderColor: "#1db954",
          color: "#1db954",
        },
      }}
    >
      <img
        src="https://getheavy.com/wp-content/uploads/2019/12/spotify2019-830x350.jpg"
        alt="Spotify-Logo"
      />
      <a href={loginUrl}>LOGIN WITH SPOTIFY</a>
    </Box>
  );
}

export default Login;
