import React, { useState } from "react";
import { MusicalNoteIcon, PlayIcon } from "@heroicons/react/24/outline";
import AddSearchItemToPlaylist from "./AddSearchItemToPlaylist";
import { useToken } from "../TokenContext";

const AllView = ({ results, username, changeView }) => {
  const { checkExpire } = useToken();
  //this will be used to render play button and reomve button when hovering over a row
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleRowHover = (index) => {
    setHoveredIndex(index);
  };

  const handleRowLeave = () => {
    setHoveredIndex(null);
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
        uris: [trackUri],
      }),
    }).catch((error) => console.log(error));
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
    <>
      {results.length !== 0 ? (
        <div className="flex flex-col px-8">
          <div className="flex w-full">
            <div className="w-1/2 flex flex-col mr-2">
              <h1 className="font-bold text-xl mb-4">Top Songs</h1>
              {results.tracks.items.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex p-2 w-full hover:bg-fourth hover:text-white hover:cursor-pointer rounded-lg mr-4"
                  onMouseEnter={() => handleRowHover(index)}
                  onMouseLeave={handleRowLeave}
                >
                  <div className="flex">
                    {hoveredIndex === index ? (
                      <button
                        onClick={() => playSong(item.uri)}
                        className="h-12 w-12 flex items-center justify-center"
                      >
                        <PlayIcon className="h-6 w-6 hover:text-third" />
                      </button>
                    ) : item.album.images.length > 0 ? (
                      <img
                        src={item.album.images[0].url}
                        className="h-12 w-12 rounded-lg"
                      ></img>
                    ) : (
                      <MusicalNoteIcon className="h-12 w-12 text-black"></MusicalNoteIcon>
                    )}

                    <div className="flex flex-col ml-4">
                      <p className="font-bold line-clamp-1">{item.name}</p>
                      <div className="line-clamp-1">
                        {item.artists.map((artist, index) => (
                          <span key={artist.name}>
                            {artist.name}
                            {index < item.artists.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex ml-auto items-center">
                    <div>{formatDuration(item.duration_ms)}</div>
                    <AddSearchItemToPlaylist
                      username={username}
                      trackUri={item.uri}
                    ></AddSearchItemToPlaylist>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-1/2 ml-2">
              <div className="font-bold text-xl mb-4">Top Artists</div>
              <div className="grid grid-cols-2 gap-6">
                {results.artists.items.slice(0, 4).map((item, index) => (
                  <button
                    key={index}
                    className="flex bg-white rounded-l-full rounded-r-full group items-center shadow-xl hover:text-white hover:bg-fourth transition-all duration-300 ease-in-out"
                    onClick={() => changeView("artist", item.id)}
                  >
                    {item.images.length > 0 ? (
                      <img
                        src={item.images[0].url}
                        className="h-32 w-32 rounded-full"
                      ></img>
                    ) : (
                      <MusicalNoteIcon className="h-32 w-32"></MusicalNoteIcon>
                    )}
                    <div className="text-center font-bold mr-4 ml-2 w-full">
                      {item.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className=" w-full flex flex-col mb-4">
            <div className="font-bold text-xl mb-4">Top Playlists</div>
            <div className="flex justify-between">
              {results.playlists.items.slice(0, 4).map((item, index) => (
                <button
                  className="flex flex-col bg-white w-1/5 p-6 items-center shadow-2xl hover:bg-fourth hover:text-white rounded-xl cursor-pointer overflow-hidden transition-all duration-300 ease-in-out"
                  key={index}
                  onClick={() => changeView("playlist", item.id)}
                >
                  {item.images.length > 0 ? (
                    <img
                      src={item.images[0].url}
                      className="h-40 w-40 rounded-xl"
                    ></img>
                  ) : (
                    <MusicalNoteIcon className="h-32 w-32 pt-2 pb-2"></MusicalNoteIcon>
                  )}
                  <div className="overflow-hidden font-bold text-ellipsis  mt-2 text-left line-clamp-2">
                    {item.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>No results to show</div>
      )}
    </>
  );
};

export default AllView;
