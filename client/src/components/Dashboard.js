import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import SpotifyWebApi from "spotify-web-api-node";
import CheckIcon from "@mui/icons-material/Check";
import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Paper, Stack, Grid } from "@mui/material";

import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

import Track from "./Track";
// Setting the spotifyApi, so that we can use it's functions
const spotifyApi = new SpotifyWebApi({
  clientId: "2802a707032a4576ba6efcf043bfbc61",
});

const Dashboard = ({ code }) => {
  const { accessToken, refreshToken } = useAuth(code);
  const [myData, setMyData] = useState();
  const [playlists, setPlaylists] = useState([]);
  const [finishedLoading, setFinishedLoading] = useState(false);
  const [curPlaylistIdx, setCurPlaylistIdx] = useState(0);
  const [topTrackCounts, setTopTrackCounts] = useState([]);
  const [playlistFeatures, setPlaylistFeatures] = useState([]);

  const handleClick = (index) => {
    setCurPlaylistIdx(index);
  };

  useEffect(() => {
    if (!accessToken) {
      console.log("no access token");
      return;
    }

    async function fetchData() {
      let newPlaylistTracks = [];
      let newTopTrackCounts = [];
      // Setting Up the spotifyApi with AccessToken so that we can use its functions anywhere in the component without setting AccessToken value again & again.
      spotifyApi.setAccessToken(accessToken);
      let my_data = await spotifyApi.getMe();
      setMyData(my_data);

      const data = await spotifyApi.getUserPlaylists();
      const playlists = data.body.items;
      for await (const playlist of playlists) {
        const tracks = await spotifyApi.getPlaylistTracks(playlist.id);
        // console.log(tracks);
        let formattedItems = [];
        let nonNullTracks = [];
        // console.log(tracks.body.items.length);
        for await (const track of tracks.body.items) {
          nonNullTracks.push(
            track.track === undefined ? ["bruh"] : track.track
          );
        }

        let topTrackCount = 0;
        for await (const track of nonNullTracks) {
          const item = {};
          // TODO: Make this dependent on ALL artists, not just the first (if any of them have top, then it counts)
          const artistTopTracks = await spotifyApi.getArtistTopTracks(
            track.artists[0].id,
            my_data.body.country
          );

          let nonNullArtistTopTracks = [];
          for await (const topTrack of artistTopTracks.body.tracks) {
            if (topTrack !== null) {
              nonNullArtistTopTracks.push(topTrack);
              // console.log(nonNullArtistTopTracks[topTrackIdx]);
            }
          }

          item.isTopTrack = false;
          for await (const topTrack of nonNullArtistTopTracks) {
            if (track.id === topTrack.id) {
              item.isTopTrack = true;
              topTrackCount += 1;
            }
          }
          // try {
          //   if (track === null) console.log("bruh");
          // } catch (err) {
          //   console.log(err);
          // }
          // if (track === null) console.log("bruh");

          item.data = track;
          formattedItems.push(item);
        }

        // console.log(formattedItems);
        const obj = {};
        obj.id = playlist.id;
        obj.name = playlist.name;
        obj.items = formattedItems;

        let ids = [];
        for (const item of obj.items) {
          ids.push(item.data.id);
        }

        let audioFeatures;

        try {
          // console.log(trackIdx + "/" + nonNullTracks.length);
          // track.id === null && console.log(track);
          audioFeatures = await spotifyApi.getAudioFeaturesForTracks(ids);
          console.log(audioFeatures);
        } catch (err) {
          console.log("bruh");
          console.log(err);
        }
        for (let i = 0; i < obj.items.length; i++) {
          obj.items[i].audioFeatures = audioFeatures.body.audio_features[i];
        }

        newPlaylistTracks.push(obj);
        newTopTrackCounts.push(topTrackCount);
      }

      // console.log(track);

      console.log({ newPlaylistTracks, newTopTrackCounts });
      setPlaylists(newPlaylistTracks);
      setTopTrackCounts(newTopTrackCounts);
      setFinishedLoading(true);
    }
    fetchData();
  }, [accessToken]);

  return (
    <Grid container>
      {finishedLoading ? (
        <>
          <Grid
            item
            xs={12}
            sx={{ textAlign: "center" }}
            component="h1"
            height="7vh"
          >
            Title
          </Grid>
          <Grid item xs={12} container spacing={2}>
            <Grid item xs={6} sx={{ height: "100%" }}>
              <Paper elevation={3} sx={{ height: "90vh", overflow: "auto" }}>
                Playlists:
                <List component="nav" aria-labelledby="nested-list-subheader">
                  {playlists.map((playlist, index) => {
                    return (
                      <>
                        <ListItemButton onClick={() => handleClick(index)}>
                          <ListItemText
                            primary={`${playlist.name} (${topTrackCounts[
                              index
                            ].toString()}/${playlists[
                              curPlaylistIdx
                            ].items.length.toString()})`}
                          />
                          {index === curPlaylistIdx && <CheckIcon />}
                        </ListItemButton>
                      </>
                    );
                  })}
                </List>
              </Paper>
            </Grid>
            {
              <Grid item xs={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sx={{ height: "40vh", overflow: "auto" }}>
                    <Paper elevation={3}>
                      <Box>Songs:</Box>
                      <List
                        component="nav"
                        aria-labelledby="nested-list-subheader"
                      >
                        {playlists[curPlaylistIdx].items.map((item) => {
                          if (item.data.track !== null) {
                            return <Track item={item} />;
                          }
                        })}
                      </List>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper
                      elevation={3}
                      sx={{ height: "50vh", overflow: "auto" }}
                    >
                      <Box>Aggregated Features:</Box>
                      <List
                        component="nav"
                        aria-labelledby="nested-list-subheader"
                      >
                        {playlists[curPlaylistIdx].items.map((item) => {
                          if (item.data.track !== null) {
                            return <Track item={item} />;
                          }
                        })}
                      </List>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            }
          </Grid>
        </>
      ) : (
        <Grid xs={12}>
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              height: "100vh",
            }}
          >
            <CircularProgress />
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default Dashboard;
