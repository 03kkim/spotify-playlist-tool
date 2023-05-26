import React from "react";

import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import { Stack } from "@mui/material";

function Track({ item }) {
  const artists = item.data.track.artists;
  return (
    <List component="div" disablePadding>
      <ListItemButton sx={{ pl: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center">
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

export default Track;
