import React, { useState } from "react";
import { PlayIcon, MusicalNoteIcon } from "@heroicons/react/24/solid";
import AddSearchItemToPlaylist from "./AddSearchItemToPlaylist";
import { useToken } from "../TokenContext";

const TrackView = ({ results, username }) => {
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
    const token = await checkExpire();
    fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
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
    <table className="border-separate border-spacing-y-0 table-fixed w-full pb-10">
      <thead>
        <tr className="text-left">
          <th className="w-1/12 border-b-2 border-third pb-2 text-center">#</th>
          <th className="w-1/4 border-b-2 border-third pb-2">Track</th>
          <th className="w-1/4 border-b-2 border-third pb-2">Artist</th>
          <th className="w-1/4 border-b-2 border-third pb-2">Album</th>
          <th className="w-1/12 border-b-2 border-third pb-2">Duration</th>
        </tr>
      </thead>
      <tbody>
        {results.items.map((item, index) => (
          <tr
            key={index}
            className="group text-black hover:bg-fourth hover:text-white rounded-xl"
            onMouseEnter={() => handleRowHover(index)}
            onMouseLeave={handleRowLeave}
          >
            <td className="py-8 px-2 rounded-l-xl text-center">
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
                {item.album.images.length > 0 ? (
                  <img
                    src={item.album.images[0].url}
                    className="h-12 w-12 rounded-md"
                  ></img>
                ) : (
                  <MusicalNoteIcon className="h-12 w-12 text-black"></MusicalNoteIcon>
                )}
                <div className="ml-2 font-bold line-clamp-1">{item.name}</div>
              </div>
            </td>
            <td>
              <div className="line-clamp-1">
                {item.artists.map((artist, index) => (
                  <span key={index}>
                    {artist.name}
                    {index < item.artists.length - 1 && ", "}
                  </span>
                ))}
              </div>
            </td>
            <td>
              <div className="line-clamp-1">{item.album.name}</div>
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
  );
};

export default TrackView;
