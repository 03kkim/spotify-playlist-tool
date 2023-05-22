import React, { useState, useEffect } from "react";
import useAuth from "./useAuth";
import SpotifyWebApi from "spotify-web-api-node";

import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

// Setting the spotifyApi, so that we can use it's functions
const spotifyApi = new SpotifyWebApi({
  clientId: "2802a707032a4576ba6efcf043bfbc61",
});

const Dashboard = ({ code }) => {
  const { accessToken, refreshToken } = useAuth(code);
  const [myData, setMyData] = useState();
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [finishedLoading, setFinishedLoading] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState([]);

  const handleClick = (index) => {
    setIsPlaylistOpen((existingItems) => {
      return [
        ...existingItems.slice(0, index),
        !existingItems[index],
        ...existingItems.slice(index + 1),
      ];
    });
  };

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
        setIsPlaylistOpen((oldArray) => [...oldArray, false]);
      }
      setFinishedLoading(true);
    });
  }, [accessToken]);

  // useEffect(() => {
  //   console.log(playlistTracks);

  //   console.log("finished");
  // }, [playlistTracks]);
  return (
    <Container
      sx={{
        bgcolor: "black",
        color: "white",
        height: "100vh",
      }}
      maxWidth="100%"
    >
      {finishedLoading ? (
        <List
          component="nav"
          aria-labelledby="nested-list-subheader"
          subheader={
            <ListSubheader
              component="div"
              id="nested-list-subheader"
              sx={{
                bgcolor: "black",
                color: "white",
              }}
            >
              Playlists:
            </ListSubheader>
          }
        >
          {userPlaylists.map((playlist, index) => {
            return (
              <>
                <ListItemButton onClick={() => handleClick(index)}>
                  <ListItemText primary={playlist.name} />
                  {isPlaylistOpen[index] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse
                  in={isPlaylistOpen[index]}
                  timeout="auto"
                  unmountOnExit
                >
                  {finishedLoading &&
                    playlistTracks[index].items.map((item, idx) => {
                      if (item.track !== null) {
                        return (
                          <List component="div" disablePadding>
                            <ListItemButton sx={{ pl: 4 }}>
                              <ListItemText primary={item.track.name} />
                            </ListItemButton>
                          </List>
                        );
                      }
                    })}
                </Collapse>
              </>
            );
          })}
        </List>
      ) : (
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            height: "100vh",
            backgroundColor: "black",
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;
