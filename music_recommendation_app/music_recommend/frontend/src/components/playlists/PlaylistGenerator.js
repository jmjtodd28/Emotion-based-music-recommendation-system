import React, { useEffect, useState } from "react";
import { useToken } from "../TokenContext";
import {
  MagnifyingGlassIcon,
  MusicalNoteIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const PlaylistGenerator = ({ setGenerateView, updateKey, setUpdateKey }) => {
  const { username, checkExpire } = useToken();
  const [genPlaylistData, setGenPlaylistData] = useState({
    name: "",
    description: "",
    numberOfTracks: 50,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState("");

  const [currentSearchType, setCurrentSearchType] = useState("Artists");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [genres, setGenres] = useState("");
  const [filteredGenres, setFilteredGeners] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGenPlaylistData({
      ...genPlaylistData,
      [name]: value,
    });
  };

  useEffect(() => {
    getGenres();
  }, []);

  const getGenres = async () => {
    const token = await checkExpire();
    fetch("https://api.spotify.com/v1/recommendations/available-genre-seeds", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => setGenres(data.genres))
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    if (!searchTerm.trim()) return setResults([]);

    const controller = new AbortController();

    if (currentSearchType === "Artists") {
      spotifySearch("artist", controller);
    } else if (currentSearchType === "Tracks") {
      spotifySearch("track", controller);
    } else {
      genreSearch();
    }

    return () => controller.abort();
  }, [searchTerm]);

  const spotifySearch = async (searchType, controller) => {
    const token = await checkExpire();
    const apiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      searchTerm
    )}&type=${searchType}`;

    fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data) => setResults(data))
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.log(error);
        }
      });
  };

  const genreSearch = () => {
    const filteredGenres = genres.filter((genre) =>
      genre.toLowerCase().includes(searchTerm)
    );
    setFilteredGeners(filteredGenres);
  };

  const generatePlaylist = async () => {
    // this can only be accessed if the name field has been filled in and at least one seed provided
    // We will create a playlist with the name and optional desc -> get tracks from seeds -> populate new playlist with new tracks
    // To order fetches successfully I use the await async/await syntax

    const token = await checkExpire();

    try {
      //create playlist
      const createPlaylistRes = await fetch(
        `https://api.spotify.com/v1/users/${username}/playlists`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: genPlaylistData.name,
            description: genPlaylistData.description,
          }),
        }
      );

      const playlistData = await createPlaylistRes.json();
      const playlistId = playlistData.id;

      //get songs
      const trackIds = selectedTracks.map((obj) => obj.id);
      const artistIds = selectedArtists.map((obj) => obj.id);

      let urlParams = [];
      const apiUrl = "https://api.spotify.com/v1/recommendations?";
      urlParams.push(`market=GB`);

      if (genPlaylistData.numberOfTracks > 100) {
        genPlaylistData.numberOfTracks = 100;
      }

      urlParams.push(`limit=${genPlaylistData.numberOfTracks}`);

      if (selectedGenres.length > 0) {
        urlParams.push(
          `seed_genres=${encodeURIComponent(selectedGenres.join(","))}`
        );
      }

      if (trackIds.length > 0) {
        urlParams.push(`seed_tracks=${encodeURIComponent(trackIds.join(","))}`);
      }

      if (artistIds.length > 0) {
        urlParams.push(
          `seed_artists=${encodeURIComponent(artistIds.join(","))}`
        );
      }

      const finalUrl = `${apiUrl}${urlParams.join("&")}`;

      const recommendaitonRes = await fetch(finalUrl, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const songData = await recommendaitonRes.json();
      const trackUris = songData.tracks.map((obj) => obj.uri);

      //populate playlist
      const popRes = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: trackUris,
          }),
        }
      ).catch((error) => console.log(error));

      //finally update the playlist view to show the new playlist
      setUpdateKey(updateKey + 1);
    } catch (error) {
      console.log(error);
    }

    setGenerateView(false);
  };

  const addArtist = (artist) => {
    setSelectedArtists([...selectedArtists, artist]);
    setSearchTerm("");
  };

  const removeArtist = (artist) => {
    setSelectedArtists(selectedArtists.filter((item) => item.id !== artist));
  };

  const addTrack = (track) => {
    setSelectedTracks([...selectedTracks, track]);
    setSearchTerm("");
  };

  const removeTrack = (track) => {
    setSelectedTracks(selectedTracks.filter((item) => item.id !== track));
  };

  const addGenre = (genre) => {
    setSelectedGenres([...selectedGenres, genre]);
    setSearchTerm("");
  };

  const removeGenre = (genre) => {
    setSelectedGenres(selectedGenres.filter((item) => item !== genre));
  };

  return (
    <div>
      <div className="absolute flex flex-col w-5/6 h-5/6 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-third rounded-xl">
        <div className="flex w-full h-5/6">
          <div className="w-2/3 flex flex-col overflow-hidden overflow-y-auto">
            <div className="p-4 font-bold text-xl">Playlist Generator</div>
            <div className="px-4">
              Select up to 5 seeds (Artists/Tracks/Genres) to grow your new
              playlist!
            </div>
            <div className="flex w-full">
              <div className="w-1/2 p-4">
                <div className="mb-4 flex flex-col">
                  <label className="mb-2 text-lg font-bold">
                    Playlist Name
                  </label>
                  <input
                    className="appearance-none w-full bg-second rounded-lg border p-4 text-md hover:border-third focus:border-third focus:border-2 outline-none"
                    type="text"
                    name="name"
                    value={genPlaylistData.name}
                    placeholder="Required"
                    onChange={handleInputChange}
                    required
                  ></input>
                </div>
                <div className="mb-4 flex flex-col">
                  <label className="mb-2 text-lg font-bold">Description</label>
                  <textarea
                    className="appearance-none w-full bg-second rounded-lg border p-4 text-md hover:border-third focus:border-third focus:border-2 outline-none"
                    type="text"
                    name="description"
                    value={genPlaylistData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-lg font-bold">
                    Number of tracks (1-100)
                  </label>
                  <input
                    className="appearance-none w-full bg-second rounded-lg border p-4 text-md hover:border-third focus:border-third focus:border-2 outline-none"
                    type="number"
                    min={1}
                    max={100}
                    name="numberOfTracks"
                    placeholder="Default: 50"
                    value={genPlaylistData.numberOfTracks}
                    onChange={handleInputChange}
                  ></input>
                </div>
              </div>
              <div className="flex flex-col items-center w-1/2 p-4 h-full">
                <span className="mb-2 self-start pl-4 text-lg font-bold">
                  Selected Seeds:
                </span>
                {selectedArtists.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center rounded-xl bg-fourth text-white w-full shadow-xl mb-2"
                  >
                    {item.images.length === 0 ? (
                      <MusicalNoteIcon className="h-16 w-16 text-black"></MusicalNoteIcon>
                    ) : (
                      <img
                        src={item.images[0].url}
                        className="h-16 w-16 rounded-xl"
                      ></img>
                    )}
                    <span className="ml-4 font-bold">{item.name}</span>
                    <button
                      onClick={() => removeArtist(item.id)}
                      className="ml-auto"
                    >
                      <XMarkIcon className="text-white hover:text-third h-12 w-12 pr-2"></XMarkIcon>
                    </button>
                  </div>
                ))}
                {selectedTracks.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center rounded-xl bg-fourth text-white w-full shadow-xl mb-2"
                  >
                    {item.album.images.length > 0 ? (
                      <img
                        src={item.album.images[0].url}
                        className="h-16 w-16 rounded-xl"
                      ></img>
                    ) : (
                      <MusicalNoteIcon className="h-16 w-16 text-black"></MusicalNoteIcon>
                    )}
                    <div className="flex flex-col ml-4 text-left">
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
                    <button
                      onClick={() => removeTrack(item.id)}
                      className="ml-auto"
                    >
                      <XMarkIcon className="text-white hover:text-third h-12 w-12 pr-2"></XMarkIcon>
                    </button>
                  </div>
                ))}
                {selectedGenres.map((item, index) => (
                  <div
                    key={index}
                    className=" flex bg-fourth text-white items-center w-full rounded-xl shadow-xl mb-2 "
                  >
                    <MusicalNoteIcon className="h-16 w-16 text-white"></MusicalNoteIcon>
                    <span className="font-bold ml-4 capitalize">{item}</span>
                    <button
                      onClick={() => removeGenre(item)}
                      className="ml-auto"
                    >
                      <XMarkIcon className="text-white hover:text-third h-12 w-12 pr-2"></XMarkIcon>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-1/3 flex flex-col border-l-third border-l p-4">
            <div className="relative flex items-center pb-2">
              <MagnifyingGlassIcon className="w-5 h-5 absolute ml-3 pointer-events-none"></MagnifyingGlassIcon>
              <input
                type="text"
                placeholder="Search Seeds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="appearance-none w-full bg-second rounded-lg border p-4 pl-10 text-md hover:border-third focus:border-third focus:border-2 outline-none"
              ></input>
            </div>
            <div className="flex pb-2 justify-between">
              <SearchTypePill
                searchType={"Artists"}
                setCurrentSearchType={setCurrentSearchType}
                currentSearchType={currentSearchType}
                setSearchTerm={setSearchTerm}
                setFilteredGeners={setFilteredGeners}
              />
              <SearchTypePill
                searchType={"Tracks"}
                setCurrentSearchType={setCurrentSearchType}
                currentSearchType={currentSearchType}
                setSearchTerm={setSearchTerm}
                setFilteredGeners={setFilteredGeners}
              />
              <SearchTypePill
                searchType={"Genres"}
                setCurrentSearchType={setCurrentSearchType}
                currentSearchType={currentSearchType}
                setSearchTerm={setSearchTerm}
                setFilteredGeners={setFilteredGeners}
              />
            </div>
            <div className=" flex flex-col overflow-y-auto overflow-hidden overscroll-contain h-full">
              {results.length === 0 && filteredGenres.length === 0 && (
                <div>No content</div>
              )}
              {currentSearchType === "Artists"
                ? results?.artists?.items.map((item, index) => (
                    <button
                      onClick={() => addArtist(item)}
                      className="py-2 hover:bg-fourth hover:text-white rounded-xl"
                      key={index}
                    >
                      <div className="flex items-center pl-4">
                        {item.images.length === 0 ? (
                          <MusicalNoteIcon className="h-12 w-12 text-black"></MusicalNoteIcon>
                        ) : (
                          <img
                            src={item.images[0].url}
                            className="h-12 w-12 rounded-xl"
                          ></img>
                        )}
                        <span className="pl-4 line-clamp-1">{item.name}</span>
                      </div>
                    </button>
                  ))
                : currentSearchType === "Tracks"
                ? results?.tracks?.items.map((item, index) => (
                    <button
                      onClick={() => addTrack(item)}
                      key={index}
                      className="py-2 hover:bg-fourth hover:text-white rounded-xl"
                    >
                      <div className="flex items-center pl-4">
                        {item.album.images.length > 0 ? (
                          <img
                            src={item.album.images[0].url}
                            className="h-12 w-12 rounded-xl"
                          ></img>
                        ) : (
                          <MusicalNoteIcon className="h-12 w-12 text-black"></MusicalNoteIcon>
                        )}
                        <div className="flex flex-col ml-4 text-left">
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
                    </button>
                  ))
                : filteredGenres?.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => addGenre(item)}
                      className="py-2 hover:bg-fourth hover:text-white rounded-xl capitalize"
                    >
                      {item}
                    </button>
                  ))}
            </div>
          </div>
        </div>
        <div className="flex h-1/6 items-center p-4  w-full border-t border-t-third">
          <button
            onClick={() => generatePlaylist()}
            className={`rounded-lg bg-fourth ml-auto text-white hover:brightness-75 p-2 mr-4 ${
              (genPlaylistData.name.trim() === "" ||
                selectedArtists.length +
                  selectedTracks.length +
                  selectedGenres.length ===
                  0) &&
              "pointer-events-none brightness-75"
            }`}
          >
            Generate Playlist
          </button>
          <button
            onClick={() => setGenerateView(false)}
            className="rounded-lg bg-third text-white hover:brightness-75 p-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const SearchTypePill = ({
  searchType,
  setCurrentSearchType,
  currentSearchType,
  setSearchTerm,
  setFilteredGeners,
}) => {
  return (
    <button
      className={`flex rounded-xl border border-fourth pl-4 pr-4 hover:bg-fourth hover:text-white hover:brightness-75 ${
        searchType === currentSearchType ? "bg-fourth text-white" : "bg-white"
      }`}
      onClick={() => {
        setCurrentSearchType(searchType);
        setSearchTerm("");
        setFilteredGeners([]);
      }}
    >
      {searchType}
    </button>
  );
};

export default PlaylistGenerator;
