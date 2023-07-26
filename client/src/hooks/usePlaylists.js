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
      let newPlaylistFeatures = [];

      spotifyApi.setAccessToken(accessToken);
      let my_data = await spotifyApi.getMe();

      const data = await spotifyApi.getUserPlaylists();
      const playlists = data.body.items;
      for (const playlist of playlists) {
        // console.log("Made it here");
        const tracks = await spotifyApi.getPlaylistTracks(playlist.id);
        // console.log(tracks);
        let formattedItems = [];
        let nonNullTracks = getNonNull(tracks.body.items, (track) => track.track);

        let topTrackCount = 0;
        for (const track of nonNullTracks) {
          const item = {};
          // TODO: Make this dependent on ALL artists, not just the first (if any of them have top, then it counts)

          // Something weird happens with some songs where the artist has no ID
          // In this case, we'll just assume the track is not a top track for any artist since there are no ID to match it to
          item.isTopTrack = false;
          if (track.artists[0].id !== null) {
            // console.log(JSON.stringify(track.artists));
            const artistTopTracks = await spotifyApi.getArtistTopTracks(track.artists[0].id, my_data.body.country);

            const nonNullArtistTopTracks = getNonNull(artistTopTracks.body.tracks);
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

        // setting aggregated audio features
        const individualPlaylistFeatures = {
          acousticness: 0,
          danceability: 0,
          durationMs: 0,
          energy: 0,
          instrumentalness: 0,
          // "key": 0,
          liveness: 0,
          loudness: 0,
          mode: 0,
          speechiness: 0,
          tempo: 0,
          // "time_signature": 4,
          valence: 0,
        };
        let numTracksWithFeatures = 0;
        for (const track of obj.items) {
          // Some tracks don't have audio features, so we'll remove them from the average
          if (track.audioFeatures !== null) {
            numTracksWithFeatures += 1;
            individualPlaylistFeatures.acousticness += track.audioFeatures.acousticness;
            individualPlaylistFeatures.danceability += track.audioFeatures.danceability;
            individualPlaylistFeatures.durationMs += track.audioFeatures.duration_ms;
            individualPlaylistFeatures.energy += track.audioFeatures.energy;
            individualPlaylistFeatures.instrumentalness += track.audioFeatures.instrumentalness;
            individualPlaylistFeatures.liveness += track.audioFeatures.liveness;
            individualPlaylistFeatures.loudness += track.audioFeatures.loudness;
            individualPlaylistFeatures.mode += track.audioFeatures.mode;
            individualPlaylistFeatures.speechiness += track.audioFeatures.speechiness;
            individualPlaylistFeatures.tempo += track.audioFeatures.tempo;
            individualPlaylistFeatures.valence += track.audioFeatures.valence;
          }
          // console.log(JSON.stringify(track.audioFeatures));
          // individualPlaylistFeatures.acousticness +=
          //   track.audioFeatures.acousticness;
        }
        individualPlaylistFeatures.acousticness /= numTracksWithFeatures;
        individualPlaylistFeatures.danceability /= numTracksWithFeatures;
        individualPlaylistFeatures.durationMs /= numTracksWithFeatures;
        individualPlaylistFeatures.energy /= numTracksWithFeatures;
        individualPlaylistFeatures.instrumentalness /= numTracksWithFeatures;
        individualPlaylistFeatures.liveness /= numTracksWithFeatures;
        individualPlaylistFeatures.loudness /= numTracksWithFeatures;
        individualPlaylistFeatures.mode /= numTracksWithFeatures;
        individualPlaylistFeatures.speechiness /= numTracksWithFeatures;
        individualPlaylistFeatures.tempo /= numTracksWithFeatures;
        individualPlaylistFeatures.valence /= numTracksWithFeatures;

        individualPlaylistFeatures.acousticness = Math.round(individualPlaylistFeatures.acousticness * 100) / 100;
        individualPlaylistFeatures.danceability = Math.round(individualPlaylistFeatures.danceability * 100) / 100;
        individualPlaylistFeatures.durationMs = Math.round(individualPlaylistFeatures.durationMs * 100) / 100;
        individualPlaylistFeatures.energy = Math.round(individualPlaylistFeatures.energy * 100) / 100;
        individualPlaylistFeatures.instrumentalness =
          Math.round(individualPlaylistFeatures.instrumentalness * 100) / 100;
        individualPlaylistFeatures.liveness = Math.round(individualPlaylistFeatures.liveness * 100) / 100;
        individualPlaylistFeatures.loudness = Math.round(individualPlaylistFeatures.loudness * 100) / 100;
        individualPlaylistFeatures.mode = Math.round(individualPlaylistFeatures.mode * 100) / 100;
        individualPlaylistFeatures.speechiness = Math.round(individualPlaylistFeatures.speechiness * 100) / 100;
        individualPlaylistFeatures.tempo = Math.round(individualPlaylistFeatures.tempo * 100) / 100;
        individualPlaylistFeatures.valence = Math.round(individualPlaylistFeatures.valence * 100) / 100;

        newPlaylistTracks.push(obj);
        newTopTrackCounts.push(topTrackCount);
        newPlaylistFeatures.push(individualPlaylistFeatures);
        // console.log(individualPlaylistFeatures);
      }

      // console.log({ newPlaylistTracks, newTopTrackCounts });
      setPlaylistFeatures(newPlaylistFeatures);
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
