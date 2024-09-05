import React, { useEffect, useState } from "react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useToken } from "../TokenContext";
import { MusicalNoteIcon } from "@heroicons/react/24/outline";

const AddToPlaylistButton = () => {
  const { checkExpire, username } = useToken();
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
    getPlaylists();
  }, [username, modelOpen]);

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
    const token = await checkExpire();
    setModelOpen(false);
    // for every playlist, we will add the song to that playlist
    //first we check our current state to get the song id then we can add it

    fetch("https://api.spotify.com/v1/me/player", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        const trackUri = data.item.uri;
        //We will add the song to every selected playlist
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
      })
      .then(setSelectedPlaylists([]))
      .catch((error) => console.log(error));
  };

  return (
    <div className="relative">
      {modelOpen && (
        <div className=" h-80 w-64 flex flex-col bg-second text-black absolute overflow-hidden bottom-0 mb-12 rounded-lg shadow-xl border-2 border-third">
          <div className="text-black p-2">Add to playlist</div>
          <ul className="p-2 bg-white flex-1 overflow-y-scroll cursor-pointer">
            {playlists.map((playlist) => (
              <li
                key={playlist.id}
                className="flex group items-center mb-3 text-lg "
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
                  className={`ml-auto border-2 border-third h-4 w-4 rounded-full group-hover:bg-third ${
                    selectedPlaylists.includes(playlist.id) && "bg-third"
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
      <button onClick={handleButtonClick} className="flex ml-2  ">
        <PlusCircleIcon className="text-white h-6 w-6 hover:text-third"></PlusCircleIcon>
      </button>
    </div>
  );
};

export default AddToPlaylistButton;
