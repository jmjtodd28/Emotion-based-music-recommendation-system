import React, { useEffect, useState } from "react";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { useToken } from "../TokenContext";
import { useSpotifyPlayer } from "../SpotifyPlayerContext";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { MusicalNoteIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShuffle } from "@fortawesome/free-solid-svg-icons";
import { PlayIcon } from "@heroicons/react/24/solid";
import AddSearchItemToPlaylist from "./AddSearchItemToPlaylist";

const ShowPlaylistContent = ({ changeView, spotifyId }) => {
  const { username, checkExpire } = useToken();
  const { currentPlayerState } = useSpotifyPlayer();
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [playlistItems, setPlaylistItems] = useState([]);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [currentSong, setCurrentSong] = useState("");

  //state to monitor if the user follows this playlist
  const [followsPlaylist, setFollowsPlaylist] = useState(false);

  //this will be used to render play button and reomve button when hovering over a row
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleRowHover = (index) => {
    setHoveredIndex(index);
  };

  const handleRowLeave = () => {
    setHoveredIndex(null);
  };

  //need to check if the user follows this playlist
  useEffect(() => {
    getUserPlaylists();
  }, []);

  const getUserPlaylists = async () => {
    const token = await checkExpire();
    let usersPlaylists = [];
    fetch(`https://api.spotify.com/v1/users/${username}/playlists?limit=50`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        usersPlaylists = data.items.map((item) => item.id);
        if (usersPlaylists.includes(spotifyId)) {
          setFollowsPlaylist(true);
        } else {
          setFollowsPlaylist(false);
        }
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    getPlaylistInfo();
  }, [spotifyId]);

  const getPlaylistInfo = async () => {
    const token = await checkExpire();
    fetch(
      `https://api.spotify.com/v1/playlists/${spotifyId}?market=GB&fields=images%2Cname%2Cowner%2Curi%2Ctracks.total`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((response) => response.json())
      .then((data) => setPlaylistInfo(data))
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    getPlaylistTracks();
  }, [playlistInfo]);

  const getPlaylistTracks = async () => {
    const token = await checkExpire();
    if (playlistInfo !== null) {
      let offset = 0;
      let numberOfTracks = playlistInfo.tracks.total;
      while (offset < numberOfTracks) {
        fetch(
          `https://api.spotify.com/v1/playlists/${spotifyId}/tracks?offset=${offset}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        )
          .then((response) => response.json())
          .then((data) => {
            setPlaylistItems((prevItems) => [...prevItems, ...data.items]);
          })
          .catch((error) => console.log(error));
        offset = offset + 100;
      }
    }
  };

  useEffect(() => {
    playerState();
  }, [currentPlayerState]);

  const playerState = async () => {
    const token = await checkExpire();

    setShuffleMode(currentPlayerState.shuffle);

    //get the current track which is playing to show in table of tracks,
    //ids from sdk and api dont match up so i need to get current playback state to see what song is playing

    fetch("https://api.spotify.com/v1/me/player", {
      method: "Get",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCurrentSong(data.item.id);
      })
      .catch((error) => console.log(error));
  };

  const playPlaylist = async () => {
    const token = await checkExpire();
    const contextUri = playlistInfo.uri;

    fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context_uri: contextUri,
      }),
    }).catch((error) => console.log(error));
  };

  const toggleShuffleMode = async () => {
    const token = await checkExpire();
    const newMode = !shuffleMode;
    setShuffleMode((prevShuffleMode) => !prevShuffleMode);

    //set the shuffle mode on the player
    const apiUrl = `https://api.spotify.com/v1/me/player/shuffle?state=${newMode}`;

    fetch(apiUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }).catch((error) => console.log(error));
  };

  const playSong = async (trackUri) => {
    const token = await checkExpire();
    fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context_uri: playlistInfo.uri,
        offset: {
          uri: trackUri,
        },
      }),
    }).catch((error) => console.log(error));
  };

  const addPlaylistToLibrary = async () => {
    const token = await checkExpire();
    fetch(`https://api.spotify.com/v1/playlists/${spotifyId}/followers`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(setFollowsPlaylist(true))
      .catch((error) => console.log(error));
  };

  const formatDate = (rawDate) => {
    //Date arrives in ISO 8601 format
    const isoDate = new Date(rawDate);

    const day = isoDate.getDate().toString().padStart(2, "0");
    const month = (isoDate.getMonth() + 1).toString().padStart(2, "0");
    const year = isoDate.getFullYear();

    if (year === 1970) {
      return "";
    }

    return `${day}-${month}-${year}`;
  };

  const formatDuration = (ms) => {
    const secs = Math.floor(ms / 1000);
    const mins = Math.floor(secs / 60);
    const formatSec = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(formatSec).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div>
      <div className="sticky z-20 top-0 w-full bg-fourth p-8">
        <ArrowUturnLeftIcon
          onClick={() => changeView(null)}
          className="text-white hover:text-third h-10 w-10 hover:cursor-pointer around"
        ></ArrowUturnLeftIcon>
      </div>
      <div className="flex px-8 bg-gradient-to-b from-fourth">
        {playlistInfo?.images?.length > 0 ? (
          <img
            className="h-48 w-48 rounded-xl shadow-lg"
            src={playlistInfo.images[0].url}
          ></img>
        ) : (
          <MusicalNoteIcon className="h-48 w-48 text-black"></MusicalNoteIcon>
        )}

        <div className="flex items-end ml-4">
          <div className="flex flex-col">
            <div className="font-bold text-5xl mb-10">{playlistInfo?.name}</div>
            <div className="mb-1">{playlistInfo?.description}</div>
            <div className="mb-1">{playlistInfo?.tracks.total} tracks</div>
            <div>Made by {playlistInfo?.owner.display_name}</div>
          </div>
        </div>
        <div className="flex ml-auto mt-auto mr-10">
          <button
            onClick={() => playPlaylist()}
            className="transition ease-in-out mr-4 bg-third rounded-full p-4 hover:-translate-y-1 hover:scale-110 duration-300 hover:brightness-90"
          >
            <PlayIcon className="h-10 w-10 text-white"></PlayIcon>
          </button>
          <button
            onClick={() => toggleShuffleMode()}
            className=" rounded-full hover:brightness-90"
          >
            <FontAwesomeIcon
              className={`h-10 w-10  ${
                shuffleMode === true
                  ? "text-fourth hover:brightness-90"
                  : "text-black hover:text-fourth"
              }`}
              icon={faShuffle}
            />
          </button>
          {followsPlaylist ? (
            <button>
              <CheckCircleIcon className="text-third h-10 w-10 ml-4"></CheckCircleIcon>
            </button>
          ) : (
            <button>
              <PlusCircleIcon
                onClick={() => addPlaylistToLibrary()}
                className="text-black h-10 w-10 ml-4 hover:text-third"
              ></PlusCircleIcon>
            </button>
          )}
        </div>
      </div>
      <table className="p-6 border-separate border-spacing-y-0 table-fixed w-full">
        <thead className="sticky z-20 bg-second" style={{ top: "104px" }}>
          <tr className="text-left ">
            <th className="w-1/12 border-b-2 border-third pb-2 text-center">
              #
            </th>
            <th className="w-4/12 border-b-2 border-third pb-2">Track</th>
            <th className="w-4/12 border-b-2 border-third pb-2">Album</th>
            <th className="w-2/12 border-b-2 border-third pb-2">Date Added</th>
            <th className="w-1/12 border-b-2 border-third pb-2">Duration</th>
          </tr>
        </thead>
        <tbody>
          {playlistItems.map((item, index) => (
            <tr
              className="group text-black hover:bg-fourth hover:text-white rounded-xl "
              key={index}
              onMouseEnter={() => handleRowHover(index)}
              onMouseLeave={handleRowLeave}
            >
              <td className="py-8 px-2 rounded-l-xl text-center ">
                {hoveredIndex === index ? (
                  <button onClick={() => playSong(item.track.uri)}>
                    <PlayIcon className="h-5 w-5 hover:text-third" />
                  </button>
                ) : (
                  index + 1
                )}
              </td>
              <td>
                <div className="flex">
                  {item.track.album.images.length > 0 ? (
                    <img
                      src={item.track.album.images[0].url}
                      className="h-12 w-12 rounded-md"
                    ></img>
                  ) : (
                    <MusicalNoteIcon className="h-12 w-12 text-black"></MusicalNoteIcon>
                  )}

                  <div className="flex flex-col ml-4 overflow-hidden">
                    <div
                      className={`mb-1 font-bold text-ellipsis overflow-hidden whitespace-nowrap ${
                        currentSong === item.track.id && "text-third"
                      }`}
                    >
                      {item.track.name}
                    </div>
                    <div className="text-ellipsis overflow-hidden whitespace-nowrap">
                      {item.track.artists.map((artist, index) => (
                        <span key={artist.name}>
                          {artist.name}
                          {index < item.track.artists.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div className="line-clamp-1">{item.track.album.name}</div>
              </td>
              <td>{formatDate(item.added_at)}</td>

              <td className="rounded-r-xl">
                <div className="flex items-center">
                  {formatDuration(item.track.duration_ms)}
                  <AddSearchItemToPlaylist
                    username={username}
                    trackUri={item.track.uri}
                  ></AddSearchItemToPlaylist>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShowPlaylistContent;
