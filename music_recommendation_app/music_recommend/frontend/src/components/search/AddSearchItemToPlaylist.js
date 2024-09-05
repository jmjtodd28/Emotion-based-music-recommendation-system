import React, { useEffect, useState } from "react";
import { PlusIcon, MusicalNoteIcon } from "@heroicons/react/24/outline";
import { useToken } from "../TokenContext";

//The type refers to the type of button, if it is full then have icon + text, otherwise just have icon
const AddSearchItemToPlaylist = ({ username, trackUri, type }) => {
  const { checkExpire } = useToken();
  const [playlists, setPlaylists] = useState([]);
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);

  const getPlaylists = async () => {
    const token = await checkExpire();
    fetch(`https://api.spotify.com/v1/users/${username}/playlists?limit=50`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        const filteredPlaylists = data.items.filter(
          (playlist) => playlist.owner.id === username
        );
        setPlaylists(filteredPlaylists);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    if (modelOpen) {
      getPlaylists();
    }
  }, [modelOpen]);

  //listener to see if user clicks away form pop up
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modelOpen && !event.target.closest(".relative")) {
        setSelectedPlaylists([]);
        setModelOpen(false);
      }
    };

    window.addEventListener("click", handleOutsideClick);

    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [modelOpen]);

  const handleButtonClick = () => {
    if (modelOpen) {
      setSelectedPlaylists([]);
      setModelOpen(false);
    } else {
      setModelOpen(true);
      setSelectedPlaylists([]);
    }
  };

  const handlePlaylistSelection = (playlistId) => {
    if (selectedPlaylists.includes(playlistId)) {
      setSelectedPlaylists(selectedPlaylists.filter((id) => id !== playlistId));
    } else {
      setSelectedPlaylists([...selectedPlaylists, playlistId]);
    }
  };

  const addSongToPlaylists = async () => {
    setModelOpen(false);
    const token = await checkExpire();

    for (let i in selectedPlaylists) {
      fetch(
        `https://api.spotify.com/v1/playlists/${selectedPlaylists[i]}/tracks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: [trackUri],
          }),
        }
      ).catch((error) => console.log(error));
    }
  };

  return (
    <div className="relative">
      {modelOpen && (
        <div className="h-80 w-64 z-30 flex flex-col bg-second text-black absolute overflow-hidden right-10 bottom-0 mt-2 rounded-lg shadow-xl border-2 border-third">
          <div className="text-black p-2">Add to playlist</div>
          <ul className="p-2 bg-white flex-1 overflow-y-scroll cursor-pointer overscroll-contain">
            {playlists?.map((playlist) => (
              <li
                key={playlist.id}
                className="flex group/select items-center mb-3 text-lg "
                onClick={() => handlePlaylistSelection(playlist.id)}
              >
                {playlist.images && playlist.images.length > 0 ? (
                  <img
                    src={playlist.images[0].url}
                    className="h-6 w-6 mr-2 rounded-sm"
                  ></img>
                ) : (
                  <MusicalNoteIcon className="h-6 w-6 mr-2"></MusicalNoteIcon>
                )}

                <div>{playlist.name}</div>
                <div
                  className={`ml-auto border-2 border-third h-4 w-4 rounded-full hover:bg-third group-hover/select:bg-third  ${
                    selectedPlaylists.includes(playlist.id)
                      ? "bg-third"
                      : "bg-white"
                  }`}
                ></div>
              </li>
            ))}
          </ul>

          <div className="flex mt-auto ml-auto  p-2 text-white bg-second">
            <button
              className=" text-white rounded-lg bg-third p-2 w-14 hover:bg-pink-600"
              onClick={() => handleButtonClick()}
            >
              Close
            </button>
            {selectedPlaylists.length > 0 && (
              <button
                className=" text-white rounded-lg bg-fourth p-2 mr-2 ml-2 w-14 hover:bg-indigo-700"
                onClick={addSongToPlaylists}
              >
                Add
              </button>
            )}
          </div>
        </div>
      )}
      {type === "full" ? (
        <button onClick={handleButtonClick} className="flex ml-2 items-center">
          <PlusIcon className="text-black h-6 w-6"></PlusIcon>
          <div className="ml-2">Add To Playlist</div>
        </button>
      ) : (
        <button onClick={handleButtonClick} className="flex ml-2">
          <PlusIcon className="text-black h-6 w-6 hover:text-third"></PlusIcon>
        </button>
      )}
    </div>
  );
};

export default AddSearchItemToPlaylist;
