import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/outline";

const SpotifySearch = ({
  addPreference,
  emotion,
  field,
  token,
  toggleSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    if (!searchTerm) return setResults([]);

    const apiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      searchTerm
    )}&type=${field}`;

    fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data) => {
        if (field === "artist") {
          const artistInfo = data.artists.items.map((artist) => {
            const smallestImage =
              artist.images.length > 0
                ? artist.images.reduce(
                    (minHeightImage, currentImage) =>
                      currentImage.height < minHeightImage.height
                        ? currentImage
                        : minHeightImage,
                    artist.images[0]
                  ).url
                : null;

            return {
              type: "artist",
              name: artist.name,
              spotifyId: artist.id,
              image: smallestImage,
            };
          });
          setResults(artistInfo);
        } else {
          const trackInfo = data.tracks.items.map((track) => {
            const smallestImage = track.album.images.reduce(
              (minHeightImage, currentImage) =>
                currentImage.height < minHeightImage.height
                  ? currentImage
                  : minHeightImage
            ).url;

            return {
              type: "track",
              spotifyId: track.id,
              duration: track.duration_ms,
              name: track.name,
              artists: track.artists.map((artist) => artist.name),
              image: smallestImage,
            };
          });

          setResults(trackInfo);
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.log(error);
        }
      });

    return () => controller.abort();
  }, [searchTerm]);

  const handleSpotifySelect = (selectedResult) => {
    addPreference(emotion, field, selectedResult);
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
    <div className="flex flex-col p-2 h-full">
      <div className="sticky top-0 z-10 bg-white w-full">
        <div className="relative flex items-center">
          <MagnifyingGlassIcon className="w-5 h-5 absolute ml-3 pointer-events-none"></MagnifyingGlassIcon>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="appearance-none w-full  p-4 pl-10 text-md  outline-none"
          ></input>
        </div>
      </div>
      <div className="flex flex-col overflow-y-auto">
        {results.length === 0 && <div className="pl-4">No content to show</div>}
        {results.map((result, index) => (
          <button
            className="text-black  py-2 hover:bg-fourth hover:text-white rounded-xl"
            key={index}
            onClick={() => handleSpotifySelect(result)}
          >
            {result.type === "artist" ? (
              <div className="flex items-center pl-4">
                {result.image === null ? (
                  <MusicalNoteIcon className="h-12 w-12 text-black"></MusicalNoteIcon>
                ) : (
                  <img
                    src={result.image}
                    className="h-12 w-12 rounded-xl"
                  ></img>
                )}
                <span className="pl-4">{result.name}</span>
              </div>
            ) : (
              <div className="flex items-center pl-4">
                {result.image === null ? (
                  <MusicalNoteIcon className="h-12 w-12 text-black"></MusicalNoteIcon>
                ) : (
                  <img
                    src={result.image}
                    className="h-12 w-12 rounded-xl"
                  ></img>
                )}
                <div className="flex flex-col pl-4 text-left">
                  <div className="">{result.name}</div>
                  <div>{result.artists.join(", ")}</div>
                </div>
                <div className="ml-auto pr-4">
                  {formatDuration(result.duration)}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="flex p-2 sticky bottom-0 bg-white w-full justify-center mt-auto">
        <button
          className=" w-14 p-2 bg-third hover:brightness-75 text-white rounded-lg"
          onClick={() => toggleSearch(false, "", "")}
        >
          Exit
        </button>
      </div>
    </div>
  );
};

export default SpotifySearch;
