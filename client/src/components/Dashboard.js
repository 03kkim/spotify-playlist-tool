import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import SpotifyWebApi from "spotify-web-api-node";

import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Stack } from "@mui/material";

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

  const [playlistCount, setPlaylistCount] = useState(20);
  const [topTrackCounts, setTopTrackCounts] = useState([]);

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

    async function fetchData() {
      let newPlaylistTracks = [];
      let newIsPlaylistOpen = [];
      let newTopTrackCounts = [];
      // Setting Up the spotifyApi with AccessToken so that we can use its functions anywhere in the component without setting AccessToken value again & again.
      spotifyApi.setAccessToken(accessToken);
      let my_data = await spotifyApi.getMe();
      setMyData(my_data);

      const data = await spotifyApi.getUserPlaylists();
      const playlists = data.body.items;
      setUserPlaylists(playlists);
      for (let i = 0; i < playlists.length; i++) {
        const tracks = await spotifyApi.getPlaylistTracks(playlists[i].id);

        let formattedItems = [];
        let nonNullTracks = [];

        for (let j = 0; j < tracks.body.items.length; j++) {
          if (tracks.body.items[j].track !== null) {
            nonNullTracks.push(tracks.body.items[j].track);
          }
        }

        let topTrackCount = 0;
        for (let j = 0; j < nonNullTracks.length; j++) {
          const item = {};
          // TODO: Make this dependent on ALL artists, not just the first (if any of them have top, then it counts)
          const artistTopTracks = await spotifyApi.getArtistTopTracks(
            nonNullTracks[j].artists[0].id,
            my_data.body.country
          );

          // console.log(artistTopTracks);

          item.isTopTrack = false;
          for (let k = 0; k < artistTopTracks.body.tracks.length; k++) {
            // console.log(nonNullTracks[j].id);
            if (nonNullTracks[j].id === artistTopTracks.body.tracks[k].id) {
              item.isTopTrack = true;
              topTrackCount += 1;
            }
          }
          item.data = tracks.body.items[j];
          formattedItems.push(item);
        }
        // console.log(formattedItems);
        const obj = {};
        obj.id = playlists[i].id;
        obj.items = formattedItems;
        newPlaylistTracks.push(obj);
        newIsPlaylistOpen.push(false);
        newTopTrackCounts.push(topTrackCount);
      }
      console.log({ newPlaylistTracks, newIsPlaylistOpen, newTopTrackCounts });
      setPlaylistTracks(newPlaylistTracks);
      setIsPlaylistOpen(newIsPlaylistOpen);
      setTopTrackCounts(newTopTrackCounts);
      setFinishedLoading(true);
    }
    fetchData();
  }, [accessToken]);

  return (
    <Container
      sx={{ bgcolor: "black", color: "white", height: "100%" }}
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
                  <ListItemText
                    primary={`${playlist.name} (${topTrackCounts[
                      index
                    ].toString()})`}
                  />
                  {isPlaylistOpen[index] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse
                  in={isPlaylistOpen[index]}
                  timeout="auto"
                  unmountOnExit
                >
                  {finishedLoading &&
                    playlistTracks[index].items.map((item, idx) => {
                      if (item.data.track !== null) {
                        const artists = item.data.track.artists;
                        return (
                          <List component="div" disablePadding>
                            <ListItemButton sx={{ pl: 4 }}>
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                              >
                                <ListItemText
                                  primary={item.data.track.name + " -"}
                                  primaryTypographyProps={
                                    item.isTopTrack && {
                                      fontStyle: "italic",
                                      fontWeight: "bold",
                                    }
                                  }
                                />

                                <ListItemText
                                  primary={
                                    artists.length === 1
                                      ? artists[0].name
                                      : artists.map((artist, i) => {
                                          return i === artists.length - 1
                                            ? artist.name
                                            : artist.name + ", ";
                                        })
                                  }
                                />
                              </Stack>
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
