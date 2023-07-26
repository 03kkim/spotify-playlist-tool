import React from "react";
import CheckIcon from "@mui/icons-material/Check";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { Paper, Grid } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import usePlaylists from "../hooks/usePlaylists";
import Track from "./Track";

const Dashboard = ({ code }) => {
  const { playlists, finishedLoading, curPlaylistIdx, topTrackCounts, playlistFeatures, handleClick } =
    usePlaylists(code);
  return (
    <Grid container>
      {finishedLoading ? (
        <>
          <Grid item xs={12} sx={{ textAlign: "center" }} component="h1" height="7vh">
            Spotify Playlist Tool
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
                          {/* Rounded to the nearest percent */}
                          <ListItemText
                            primary={`${playlist.name} - ${Math.round(
                              100 - (topTrackCounts[index] / playlists[index].items.length) * 100
                            ).toString()}%`}
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
                      <List component="nav" aria-labelledby="nested-list-subheader">
                        {playlists[curPlaylistIdx].items.map((item) => {
                          if (item.data.track !== null) {
                            return <Track item={item} />;
                          }
                        })}
                      </List>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper elevation={3} sx={{ height: "50vh", overflow: "auto" }}>
                      <Box>Aggregated Features:</Box>
                      <List component="nav" aria-labelledby="nested-list-subheader">
                        <ListItemText
                          sx={{ pl: 4 }}
                          primary={`Acousticness: ${playlistFeatures[curPlaylistIdx].acousticness}`}
                        ></ListItemText>
                        <ListItemText
                          sx={{ pl: 4 }}
                          primary={`Danceability: ${playlistFeatures[curPlaylistIdx].danceability}`}
                        ></ListItemText>
                        <ListItemText
                          sx={{ pl: 4 }}
                          primary={`Duration (ms): ${playlistFeatures[curPlaylistIdx].durationMs}`}
                        ></ListItemText>
                        <ListItemText
                          sx={{ pl: 4 }}
                          primary={`Energy: ${playlistFeatures[curPlaylistIdx].energy}`}
                        ></ListItemText>
                        <ListItemText
                          sx={{ pl: 4 }}
                          primary={`Instrumentalness: ${playlistFeatures[curPlaylistIdx].instrumentalness}`}
                        ></ListItemText>
                        <ListItemText
                          sx={{ pl: 4 }}
                          primary={`Liveness: ${playlistFeatures[curPlaylistIdx].liveness}`}
                        ></ListItemText>
                        <ListItemText
                          sx={{ pl: 4 }}
                          primary={`Loudness: ${playlistFeatures[curPlaylistIdx].loudness}`}
                        ></ListItemText>
                        <ListItemText
                          sx={{ pl: 4 }}
                          primary={`Mode: ${playlistFeatures[curPlaylistIdx].mode}`}
                        ></ListItemText>
                        <ListItemText
                          sx={{ pl: 4 }}
                          primary={`Speechiness: ${playlistFeatures[curPlaylistIdx].speechiness}`}
                        ></ListItemText>
                        <ListItemText
                          sx={{ pl: 4 }}
                          primary={`Tempo: ${playlistFeatures[curPlaylistIdx].tempo}`}
                        ></ListItemText>
                        <ListItemText
                          sx={{ pl: 4 }}
                          primary={`Valence: ${playlistFeatures[curPlaylistIdx].valence}`}
                        ></ListItemText>
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
