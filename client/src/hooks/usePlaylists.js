import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import SpotifyWebApi from "spotify-web-api-node";
// Setting the spotifyApi, so that we can use it's functions
const spotifyApi = new SpotifyWebApi({
  clientId: "2802a707032a4576ba6efcf043bfbc61",
});

const usePlaylists = ({ code }) => {
  console.log(code);
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
            }
          }

          item.isTopTrack = false;
          for await (const topTrack of nonNullArtistTopTracks) {
            if (track.id === topTrack.id) {
              item.isTopTrack = true;
              topTrackCount += 1;
            }
          }

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
    accessToken,
    myData,
    playlists,
    finishedLoading,
    curPlaylistIdx,
    topTrackCounts,
    playlistFeatures,
    handleClick,
  };
};

export default usePlaylists;
