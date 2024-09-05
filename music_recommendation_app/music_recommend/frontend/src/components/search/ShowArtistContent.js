import React, { useEffect, useState } from "react";
import { ArrowUturnLeftIcon, PlayIcon } from "@heroicons/react/24/solid";
import { useToken } from "../TokenContext";
import AddSearchItemToPlaylist from "./AddSearchItemToPlaylist";
import ShowAlbumContents from "./ShowAlbumContents";

const ShowArtistContent = ({ changeView, spotifyId }) => {
  const { username, checkExpire } = useToken();
  const [artistData, setArtistData] = useState(null);
  const [artistAlbums, setArtistAlbums] = useState(null);
  const [artistTopTracks, setArtistTopTracks] = useState(null);
  //state to render album contents
  const [albumView, setAlbumView] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
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

  useEffect(() => {
    getArtistInfo();
  }, []);

  const getArtistInfo = async () => {
    const token = await checkExpire();
    fetch(`https://api.spotify.com/v1/artists/${spotifyId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setArtistData(data);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    getArtistData();
  }, [artistData]);

  const getArtistData = async () => {
    const token = await checkExpire();
    if (artistData !== null) {
      fetch(
        `https://api.spotify.com/v1/artists/${spotifyId}/albums?include_groups=album&market=BG&limit=50`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          setArtistAlbums(data);
        })
        .catch((error) => console.log(error));

      fetch(
        `https://api.spotify.com/v1/artists/${spotifyId}/top-tracks?market=GB`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
        .then((response) => response.json())
        .then((data) => setArtistTopTracks(data))
        .catch((error) => console.log(error));
    }
  };

  const toggleAlbumView = (bool, id) => {
    setAlbumView(bool);
    setSelectedAlbumId(id);
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
    <div className="">
      {albumView === false ? (
        <div>
          <div className="sticky top-0 bg-fourth p-8 z-10">
            <ArrowUturnLeftIcon
              onClick={() => changeView(null)}
              className=" text-white h-10 w-10 hover:cursor-pointer hover:text-third"
            ></ArrowUturnLeftIcon>
          </div>
          <div className="flex flex-col bg-gradient-to-b from-fourth px-8">
            <div className="flex">
              <div className="flex p-6 rounded-xl">
                <img
                  src={artistData?.images[0].url}
                  className="w-48 h-48 rounded-xl"
                ></img>
                <div className="flex flex-col h-full ml-6 justify-end">
                  <div className="font-bold text-5xl text-left">
                    {artistData?.name}
                  </div>
                  <div className="capitalize">{artistData?.type}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col px-8 pb-16">
            <div className="w-full flex flex-col">
              <div className="font-bold text-xl p-6">Top Songs</div>
              {artistTopTracks?.tracks.slice(0, 5).map((track, index) => (
                <div
                  key={index}
                  className="flex p-2 pl-6 hover:bg-fourth hover:text-white hover:cursor-pointer rounded-lg mr-4"
                  onMouseEnter={() => handleRowHover(index)}
                  onMouseLeave={handleRowLeave}
                >
                  <div className="flex">
                    {hoveredIndex === index ? (
                      <button
                        onClick={() => playSong(track.uri)}
                        className="h-12 w-12 flex items-center justify-center"
                      >
                        <PlayIcon className="h-6 w-6 hover:text-third" />
                      </button>
                    ) : track.album.images.length > 0 ? (
                      <img
                        src={track.album.images[0].url}
                        className="h-12 w-12 rounded-lg"
                      ></img>
                    ) : (
                      <MusicalNoteIcon className="h-12 w-12 text-black"></MusicalNoteIcon>
                    )}

                    <div className="flex flex-col ml-4">
                      <div className="font-bold line-clamp-1">{track.name}</div>
                      <div className="line-clamp-1">
                        {track.artists.map((artist, index) => (
                          <span key={artist.name}>
                            {artist.name}
                            {index < track.artists.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex ml-auto items-center">
                    <div>{formatDuration(track.duration_ms)}</div>
                    <AddSearchItemToPlaylist
                      username={username}
                      trackUri={track.uri}
                    ></AddSearchItemToPlaylist>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full">
              <div className="font-bold text-xl p-6">Albums</div>
              <div className="flex flex-wrap gap-8 w-full justify-center">
                {artistAlbums?.items.map((item, index) => (
                  <div
                    className="flex flex-col p-6 w-1/5 rounded-xl bg-white shadow-xl hover:cursor-pointer hover:bg-fourth hover:text-white transition-all duration-300 ease-in-out"
                    key={index}
                    onClick={() => toggleAlbumView(true, item.id)}
                  >
                    {item.images.length > 0 ? (
                      <img
                        src={item.images[0].url}
                        className="h-40 w-40 rounded-xl"
                      ></img>
                    ) : (
                      <MusicalNoteIcon className="h-40 w-40 pt-2 pb-2"></MusicalNoteIcon>
                    )}
                    <p className="font-bold overflow-hidden text-ellipsis whitespace-nowrap mt-2">
                      {item.name}
                    </p>
                    <div>{item.release_date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ShowAlbumContents
          toggleAlbumView={toggleAlbumView}
          spotifyId={selectedAlbumId}
        ></ShowAlbumContents>
      )}
    </div>
  );
};

export default ShowArtistContent;
