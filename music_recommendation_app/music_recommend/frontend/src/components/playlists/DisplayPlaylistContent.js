import React, { useEffect, useState } from "react";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { useToken } from "../TokenContext";
import { MusicalNoteIcon, TrashIcon } from "@heroicons/react/24/outline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShuffle } from "@fortawesome/free-solid-svg-icons";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useSpotifyPlayer } from "../SpotifyPlayerContext";
import TrackManagment from "./TrackManagment";
import AddSearchItemToPlaylist from "../search/AddSearchItemToPlaylist";

const DisplayPlaylistContent = ({
  selectedPlaylistID,
  showPlaylist,
  selectedPlaylistContent,
  playlists,
  updateKey,
  setUpdateKey,
}) => {
  const { username, checkExpire } = useToken();
  const { currentPlayerState } = useSpotifyPlayer();
  const [playlistItems, setPlaylistItems] = useState([]);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [currentSong, setCurrentSong] = useState("");
  const [deletePlaylistPopup, setDeletePlaylistPopup] = useState(false);

  //this will be used to render play button and reomve button when hovering over a row
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleRowHover = (index) => {
    setHoveredIndex(index);
  };

  const handleRowLeave = () => {
    setHoveredIndex(null);
  };

  useEffect(() => {
    if (selectedPlaylistContent === undefined) {
      return;
    }
    getPlaylistItems();
  }, [selectedPlaylistContent]);

  //need to use the async with awaits to make sure we get the items in the correct order and there are no duplicate calls for the same offset
  const getPlaylistItems = async () => {
    let offset = 0;
    let numberOfTracks = selectedPlaylistContent.tracks.total;
    const allItems = [];

    while (offset < numberOfTracks) {
      try {
        const _token = await checkExpire();
        const response = await fetch(
          `https://api.spotify.com/v1/playlists/${selectedPlaylistID}/tracks?offset=${offset}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${_token}` },
          }
        );
        const data = await response.json();
        allItems.push(...data.items);
      } catch (error) {
        console.log(error);
      }
      offset += 100;
    }

    setPlaylistItems(allItems);
  };

  const playerState = async () => {
    const _token = await checkExpire();
    //set the shuffle state
    setShuffleMode(currentPlayerState.shuffle);

    //get the current track which is playing to show in table of tracks,
    //ids from sdk and api dont match up so i need to get current playback state to see what song is playing

    fetch("https://api.spotify.com/v1/me/player", {
      method: "Get",
      headers: {
        Authorization: `Bearer ${_token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCurrentSong(data.item.id);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    playerState();
  }, [currentPlayerState]);

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

  const playPlaylist = async () => {
    const _token = await checkExpire();
    const contextUri = selectedPlaylistContent.uri;

    fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context_uri: contextUri,
      }),
    }).catch((error) => console.log(error));
  };

  const toggleShuffleMode = async () => {
    const newMode = !shuffleMode;
    setShuffleMode((prevShuffleMode) => !prevShuffleMode);

    const _token = await checkExpire();

    //set the shuffle mode on the player
    const apiUrl = `https://api.spotify.com/v1/me/player/shuffle?state=${newMode}`;

    fetch(apiUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${_token}` },
    }).catch((error) => console.log(error));
  };

  const playSong = async (trackUri) => {
    const _token = await checkExpire();
    fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context_uri: selectedPlaylistContent.uri,
        offset: {
          uri: trackUri,
        },
      }),
    }).catch((error) => console.log(error));
  };

  const handlePlaylistDelete = async () => {
    const _token = await checkExpire();
    fetch(
      `https://api.spotify.com/v1/playlists/${selectedPlaylistID}/followers`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${_token}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        showPlaylist("");
        setUpdateKey(updateKey + 1);
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="bg-second h-full overflow-y-auto">
      <button className="sticky top-0 w-full z-20 bg-fourth">
        <ArrowUturnLeftIcon
          onClick={() => showPlaylist("")}
          className="text-white h-10 w-10 hover:cursor-pointer m-6 hover:text-third "
        ></ArrowUturnLeftIcon>
      </button>
      <div className="bg-gradient-to-b from-fourth">
        <div className="flex p-6 ">
          {selectedPlaylistContent &&
          selectedPlaylistContent.images &&
          selectedPlaylistContent?.images.length > 0 ? (
            <img
              className="h-48 w-48 rounded-xl shadow-2xl"
              src={selectedPlaylistContent.images[0].url}
            ></img>
          ) : (
            <MusicalNoteIcon className="h-48 w-48 text-black"></MusicalNoteIcon>
          )}
          <div className="flex items-end ml-4">
            <div className="flex flex-col">
              <div className="font-bold text-5xl mb-10">
                {selectedPlaylistContent?.name}
              </div>
              <div className="mb-1">{selectedPlaylistContent?.description}</div>
              <div className="mb-1">
                {selectedPlaylistContent?.tracks.total} tracks
              </div>
              <div>Made by {selectedPlaylistContent?.owner.display_name}</div>
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
            <button onClick={() => setDeletePlaylistPopup(true)}>
              <TrashIcon className="text-black h-10 w-10 hover:text-third ml-4"></TrashIcon>
            </button>
          </div>
        </div>
      </div>
      <table className="p-6 border-separate border-spacing-y-0 table-fixed w-full bg-second">
        <thead className="sticky z-20  bg-second" style={{ top: "88px" }}>
          <tr className="text-left">
            <th className="w-1/12 border-b-2 border-third py-3 text-center">
              #
            </th>
            <th className="w-4/12 border-b-2 border-third pb-2 ">Track</th>
            <th className="w-4/12 border-b-2 border-third pb-2 ">Album</th>
            <th className="w-2/12 border-b-2 border-third pb-2">Date Added</th>
            <th className="w-1/12 border-b-2 border-third pb-2">Duration</th>
          </tr>
        </thead>
        <tbody>
          {playlistItems.map((item, index) => (
            <tr
              className="group text-black hover:bg-fourth hover:text-white rounded-xl transition-all duration-200 ease-in-out"
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
              <td className="w-4/12">
                <div className="flex">
                  {item.track.album.images.length > 0 ? (
                    <img
                      src={item.track.album.images[0].url}
                      className="h-12 w-12 rounded-md"
                    ></img>
                  ) : (
                    <MusicalNoteIcon className="h-12 w-12 text-black"></MusicalNoteIcon>
                  )}

                  <div className="flex flex-col ml-4 overflow-hidden ">
                    <div
                      className={`mb-1 font-bold text-ellipsis overflow-hidden whitespace-nowrap ${
                        currentSong === item.track.id && "text-third"
                      }`}
                    >
                      {item.track.name}
                    </div>
                    <div className="flex overflow-hidden text-ellipsis">
                      {item.track.artists.map((artist, index) => (
                        <div
                          className="text-ellipsis whitespace-nowrap"
                          key={artist.name}
                        >
                          {artist.name}
                          {index < item.track.artists.length - 1 && ", "}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </td>
              <td className="pl-2 overflow-hidden text-ellipsis whitespace-nowrap">
                {item.track.album.name}
              </td>
              <td>{formatDate(item.added_at)}</td>
              <td className="rounded-r-xl">
                <div className="flex items-center">
                  {formatDuration(item.track.duration_ms)}
                  {selectedPlaylistContent?.owner.display_name === username ? (
                    <TrackManagment
                      trackUri={item.track.uri}
                      setPlaylistItems={setPlaylistItems}
                      selectedPlaylistID={selectedPlaylistID}
                    ></TrackManagment>
                  ) : (
                    <AddSearchItemToPlaylist
                      username={username}
                      trackUri={item.track.uri}
                    ></AddSearchItemToPlaylist>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {deletePlaylistPopup === true && (
        <div className="absolute z-30 flex flex-col bg-white top-1/4 left-1/2 transform  border border-third rounded-xl p-4">
          <div className="font-bold text-2xl mb-4">
            Remove playlist from your library?
          </div>
          <div className="flex mb-4">
            <span>This will remove </span>
            <span className="font-bold px-1">
              {" " + selectedPlaylistContent?.name + " "}
            </span>
            <span> from your library</span>
          </div>
          <div className="flex w-full">
            <button
              className="mr-4 bg-fourth rounded-lg text-white hover:brightness-75 p-2 ml-auto"
              onClick={() => setDeletePlaylistPopup(false)}
            >
              Cancel
            </button>
            <button
              onClick={() => handlePlaylistDelete()}
              className="rounded-lg bg-third p-2 hover:brightness-75 text-white"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayPlaylistContent;
