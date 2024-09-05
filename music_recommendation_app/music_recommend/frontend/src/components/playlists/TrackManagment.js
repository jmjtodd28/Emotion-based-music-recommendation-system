import React, { useState, useEffect } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useToken } from "../TokenContext";
import AddSearchItemToPlaylist from "../search/AddSearchItemToPlaylist";

const TrackManagment = ({ trackUri, selectedPlaylistID, setPlaylistItems }) => {
  const { username, checkExpire } = useToken();
  const [modelOpen, setModelOpen] = useState(false);

  //listener to see if user clicks away form pop up
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modelOpen && !event.target.closest(".relative")) {
        setModelOpen(false);
      }
    };

    window.addEventListener("click", handleOutsideClick);

    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [modelOpen]);

  const deleteTrack = async () => {
    const token = await checkExpire();
    setModelOpen(!modelOpen);
    fetch(`https://api.spotify.com/v1/playlists/${selectedPlaylistID}/tracks`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tracks: [{ uri: trackUri }],
      }),
    })
      .then((repsonse) => {
        if (repsonse.ok) {
          //filter the playlist items to remove deleted track
          setPlaylistItems((prevItems) =>
            prevItems.filter((item) => item.track.uri !== trackUri)
          );
        }
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="relative">
      {modelOpen && (
        <div className="flex z-30 flex-col w-64 bg-second text-black absolute  right-5 bottom-0 mt-2 rounded-lg shadow-xl border-2 border-third">
          <div className="flex pt-2 pb-2 pr-2 group hover:text-third">
            <AddSearchItemToPlaylist
              username={username}
              trackUri={trackUri}
              type={"full"}
            ></AddSearchItemToPlaylist>
          </div>
          <button
            onClick={() => deleteTrack()}
            className="flex items-center p-2 group hover:text-third"
          >
            <TrashIcon className="h-6 w-6 text-black "></TrashIcon>
            <div className="ml-2">Remove From Playlist</div>
          </button>
        </div>
      )}
      <button onClick={() => setModelOpen(!modelOpen)}>
        <EllipsisVerticalIcon className="h-6 w-6 text-black hover:text-third"></EllipsisVerticalIcon>
      </button>
    </div>
  );
};

export default TrackManagment;
