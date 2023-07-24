import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import SpotifyWebApi from "spotify-web-api-node";
// Setting the spotifyApi, so that we can use it's functions
const spotifyApi = new SpotifyWebApi({
  clientId: "2802a707032a4576ba6efcf043bfbc61",
});

const usePlaylists = (code) => {
  const { accessToken, refreshToken } = useAuth(code);
  const [playlists, setPlaylists] = useState([]);
  const [finishedLoading, setFinishedLoading] = useState(false);
  const [curPlaylistIdx, setCurPlaylistIdx] = useState(0);
  const [topTrackCounts, setTopTrackCounts] = useState([]);
  const [playlistFeatures, setPlaylistFeatures] = useState([]);

  const handleClick = (index) => {
    setCurPlaylistIdx(index);
  };

  const getNonNull = (array, func = (i) => i) => {
    let toReturn = [];
    for (const item of array) {
      if (item !== null) {
        toReturn.push(func(item));
      }
    }
    return toReturn;
  };

  useEffect(() => {
    if (!accessToken) {
      console.log("no access token");
      return;
    }

    async function fetchData() {
      let newPlaylistTracks = [];
      let newTopTrackCounts = [];

      spotifyApi.setAccessToken(accessToken);
      let my_data = await spotifyApi.getMe();

      const data = await spotifyApi.getUserPlaylists();
      const playlists = data.body.items;
      for (const playlist of playlists) {
        // console.log("Made it here");
        const tracks = await spotifyApi.getPlaylistTracks(playlist.id);
        // console.log(tracks);
        let formattedItems = [];
        let nonNullTracks = getNonNull(
          tracks.body.items,
          (track) => track.track
        );

        let topTrackCount = 0;
        for (const track of nonNullTracks) {
          const item = {};
          // TODO: Make this dependent on ALL artists, not just the first (if any of them have top, then it counts)

          // Something weird happens with some songs where the artist has no ID
          // In this case, we'll just assume the track is not a top track for any artist since there are no ID to match it to
          item.isTopTrack = false;
          if (track.artists[0].id !== null) {
            // console.log(JSON.stringify(track.artists));
            const artistTopTracks = await spotifyApi.getArtistTopTracks(
              track.artists[0].id,
              my_data.body.country
            );

            const nonNullArtistTopTracks = getNonNull(
              artistTopTracks.body.tracks
            );
            for (const topTrack of nonNullArtistTopTracks) {
              if (track.id === topTrack.id) {
                item.isTopTrack = true;
                topTrackCount += 1;
              }
            }
          }

          item.data = track;
          formattedItems.push(item);
        }

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
          audioFeatures = await spotifyApi.getAudioFeaturesForTracks(ids);
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

      console.log({ newPlaylistTracks, newTopTrackCounts });
      setPlaylists(newPlaylistTracks);
      setTopTrackCounts(newTopTrackCounts);
      setFinishedLoading(true);
    }
    fetchData();
  }, [accessToken]);
  return {
    playlists,
    finishedLoading,
    curPlaylistIdx,
    topTrackCounts,
    playlistFeatures,
    handleClick,
  };
};

export default usePlaylists;
