import React, { useState, useEffect } from "react";
import useAuth from "./useAuth";
import SpotifyWebApi from "spotify-web-api-node";

// Setting the spotifyApi, so that we can use it's functions
const spotifyApi = new SpotifyWebApi({
  clientId: "2802a707032a4576ba6efcf043bfbc61",
});

const Dashboard = ({ code }) => {
  const accessToken = useAuth(code);
  const [myData, setMyData] = useState();
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [finishedLoading, setFinishedLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      console.log("no access token");
      return;
    }

    // Setting Up the spotifyApi with AccessToken so that we can use its functions anywhere in the component without setting AccessToken value again & again.
    spotifyApi.setAccessToken(accessToken);

    // Get user details with help of getMe() function
    spotifyApi.getMe().then((data) => {
      setMyData(data);
    });
    spotifyApi.getUserPlaylists().then(async (data) => {
      const playlists = data.body.items;
      setUserPlaylists(playlists);
      for (let i = 0; i < playlists.length; i++) {
        const tracks = await spotifyApi.getPlaylistTracks(playlists[i].id);
        const obj = {};
        obj.id = playlists[i].id;
        obj.items = tracks.body.items;
        setPlaylistTracks((oldArray) => [...oldArray, obj]);
      }
      setFinishedLoading(true);
    });
  }, [accessToken]);

  // useEffect(() => {
  //   console.log(playlistTracks);

  //   console.log("finished");
  // }, [playlistTracks]);

  return (
    <div>
      Playlists:
      {userPlaylists.map((playlist, index) => {
        return (
          <div>
            <b key={index}>{playlist.name}</b>
            {/* {console.log(playlistTracks[index])} */}
            <div>
              {finishedLoading &&
                playlistTracks[index].items.map((item, index) => {
                  if (item.track !== null) {
                    return <div>{item.track.name}</div>;
                  }
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Dashboard;
