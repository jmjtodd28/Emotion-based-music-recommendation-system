import React, { useEffect, useState } from "react";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { useToken } from "../TokenContext";
import { useSpotifyPlayer } from "../SpotifyPlayerContext";
import { MusicalNoteIcon } from "@heroicons/react/24/outline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShuffle } from "@fortawesome/free-solid-svg-icons";
import { PlayIcon } from "@heroicons/react/24/solid";
import AddSearchItemToPlaylist from "./AddSearchItemToPlaylist";

const ShowAlbumContents = ({ toggleAlbumView, spotifyId }) => {
  const { username, checkExpire } = useToken();
  const { currentPlayerState } = useSpotifyPlayer();
  const [albumItems, setAlbumItems] = useState(null);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [currentSong, setCurrentSong] = useState("");

  //this will be used to render play button and reomve button when hovering over a row
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleRowHover = (index) => {
    setHoveredIndex(index);
  };

  const handleRowLeave = () => {
    setHoveredIndex(null);
  };

  useEffect(() => {
    getAlbumItems();
  }, [spotifyId]);

  const getAlbumItems = async () => {
    const token = await checkExpire();

    fetch(`https://api.spotify.com/v1/albums/${spotifyId}?market=GB`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => setAlbumItems(data))
      .catch((error) => console.log(error));
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
        context_uri: albumItems.uri,
        offset: {
          uri: trackUri,
        },
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

  const playPlaylist = async () => {
    const token = await checkExpire();
    const contextUri = albumItems.uri;

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
      <div className="sticky top-0 z-20 w-full bg-fourth p-8 ">
        <ArrowUturnLeftIcon
          onClick={() => toggleAlbumView(false, "")}
          className="text-white h-10 w-10 hover:cursor-pointer hover:text-third"
        ></ArrowUturnLeftIcon>
      </div>
      <div className="bg-gradient-to-b from-fourth">
        <div className="flex p-6 ">
          {albumItems?.images.length > 0 ? (
            <img
              className="h-48 w-48 rounded-xl shadow-xl"
              src={albumItems.images[0].url}
            ></img>
          ) : (
            <MusicalNoteIcon className="h-48 w-48 text-black"></MusicalNoteIcon>
          )}

          <div className="flex items-end ml-4">
            <div className="flex flex-col">
              <div className="font-bold text-5xl mb-10">{albumItems?.name}</div>
              <div className="mb-1">{albumItems?.tracks.total} tracks</div>
              <div className="">
                {albumItems?.artists.map((artist, index) => (
                  <span key={artist.name}>
                    {artist.name}
                    {index < albumItems.artists.length - 1 && ", "}
                  </span>
                ))}
              </div>
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
          </div>
        </div>
      </div>
      <table className="p-6 border-separate border-spacing-y-0 table-fixed w-full">
        <thead
          className="sticky z-20 top-14 bg-second"
          style={{ top: "104px" }}
        >
          <tr className="text-left ">
            <th className="w-1/12 border-b-2 border-third pb-2 text-center">
              #
            </th>
            <th className="w-6/12 border-b-2 border-third pb-2">Track</th>
            <th className="w-4/10 border-b-2 border-third pb-2">Artists</th>
            <th className="w-1/12 border-b-2 border-third pb-2">Duration</th>
          </tr>
        </thead>
        <tbody>
          {albumItems?.tracks.items.map((item, index) => (
            <tr
              className="group text-black hover:bg-fourth hover:text-white rounded-xl "
              key={index}
              onMouseEnter={() => handleRowHover(index)}
              onMouseLeave={handleRowLeave}
            >
              <td className="py-8 px-2 rounded-l-xl text-center ">
                {hoveredIndex === index ? (
                  <button onClick={() => playSong(item.uri)}>
                    <PlayIcon className="h-5 w-5 hover:text-third" />
                  </button>
                ) : (
                  index + 1
                )}
              </td>
              <td>
                <div className="flex items-center">
                  {albumItems.images.length > 0 ? (
                    <img
                      src={albumItems.images[0].url}
                      className="h-12 w-12 rounded-md"
                    ></img>
                  ) : (
                    <MusicalNoteIcon className="h-12 w-12 text-black"></MusicalNoteIcon>
                  )}

                  <div className="flex flex-col ml-4 justify-center">
                    <div
                      className={`mb-1 font-bold line-clamp-1 ${
                        currentSong === item.id && "text-third"
                      }`}
                    >
                      {item.name}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div className="line-clamp-1">
                  {item.artists.map((artist, index) => (
                    <span key={artist.name}>
                      {artist.name}
                      {index < item.artists.length - 1 && ", "}
                    </span>
                  ))}
                </div>
              </td>

              <td className="rounded-r-xl">
                <div className="flex items-center">
                  {formatDuration(item.duration_ms)}
                  <AddSearchItemToPlaylist
                    username={username}
                    trackUri={item.uri}
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

export default ShowAlbumContents;
