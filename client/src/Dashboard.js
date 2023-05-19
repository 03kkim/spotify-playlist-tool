import React, { useEffect } from "react";
import useAuth from "./useAuth";
import SpotifyWebApi from "spotify-web-api-node";

// Setting the spotifyApi, so that we can use it's functions
const spotifyApi = new SpotifyWebApi({
  clientId: "2802a707032a4576ba6efcf043bfbc61",
});

const Dashboard = ({ code }) => {
  const accessToken = useAuth(code);

  useEffect(() => {
    if (!accessToken) {
      console.log("no access token");
      return;
    }

    // Setting Up the spotifyApi with AccessToken so that we can use its functions anywhere in the component without setting AccessToken value again & again.
    spotifyApi.setAccessToken(accessToken);

    // Get user details with help of getMe() function
    spotifyApi.getMe().then((data) => {
      console.log(data);
    });
    spotifyApi.getUserPlaylists().then((data) => {
      console.log(data);
    });
  }, [accessToken]);

  return <div>{code}</div>;
};

export default Dashboard;
