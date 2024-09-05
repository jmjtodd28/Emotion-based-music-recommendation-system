import React, { useEffect, useState } from "react";
import { useToken } from "../TokenContext";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import AllView from "./AllView";
import TrackView from "./TrackView";
import PlaylistView from "./PlaylistView";
import ArtistView from "./ArtistView";
import ShowArtistContent from "./ShowArtistContent";
import ShowPlaylistContent from "./ShowPlaylistContent";

const Search = () => {
  const { token, username } = useToken();
  const [searchTerm, setSearchTerm] = useState("");
  //this can be album, track, artist, playlist or all
  const [currentSearchType, setCurrentSearchType] = useState("All");
  const [results, setResults] = useState([]);
  //const [username, setUsername] = useState("");

  //this will be used to view an artist or playlist from searches
  const [currentView, setCurrentView] = useState(null);
  const [spotifyId, setSpotifyId] = useState(null);

  const changeView = (newView, spotifyId) => {
    setCurrentView(newView);
    setSpotifyId(spotifyId);
  };

  useEffect(() => {
    if (!searchTerm.trim()) return setResults([]);

    const controller = new AbortController();

    const apiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      searchTerm
    )}&type=playlist%2Ctrack%2Cartist`;

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

    return () => controller.abort();
  }, [searchTerm]);

  return (
    <div className="flex flex-col bg-second h-full overflow-y-auto">
      {currentView === null && (
        <div>
          <div className="sticky top-0 pt-8 bg-second z-10 px-8">
            <div className="relative flex items-center">
              <MagnifyingGlassIcon className="w-5 h-5 absolute ml-3 pointer-events-none"></MagnifyingGlassIcon>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="appearance-none w-1/2 bg-white rounded-lg border p-4 pl-10 text-md hover:border-third focus:border-third focus:border-2 outline-none"
              ></input>
            </div>
            <div className="flex mt-4 mb-4">
              <SearchTypePill
                searchType={"All"}
                setCurrentSearchType={setCurrentSearchType}
                currentSearchType={currentSearchType}
              />
              <SearchTypePill
                searchType={"Tracks"}
                setCurrentSearchType={setCurrentSearchType}
                currentSearchType={currentSearchType}
              />
              <SearchTypePill
                searchType={"Artists"}
                setCurrentSearchType={setCurrentSearchType}
                currentSearchType={currentSearchType}
              />
              <SearchTypePill
                searchType={"Playlists"}
                setCurrentSearchType={setCurrentSearchType}
                currentSearchType={currentSearchType}
              />
            </div>
          </div>
          <div className="flex w-full h-full">
            <div className="w-full ">
              {results.length !== 0 ? (
                <div>
                  {currentSearchType === "All" && (
                    <AllView
                      results={results}
                      username={username}
                      changeView={changeView}
                    />
                  )}
                  {currentSearchType === "Tracks" && (
                    <TrackView results={results.tracks} username={username} />
                  )}
                  {currentSearchType === "Artists" && (
                    <ArtistView
                      results={results.artists}
                      changeView={changeView}
                    />
                  )}
                  {currentSearchType === "Playlists" && (
                    <PlaylistView
                      results={results.playlists}
                      changeView={changeView}
                    />
                  )}
                </div>
              ) : (
                <div className="px-8">No results to show</div>
              )}
            </div>
          </div>
        </div>
      )}
      {currentView === "artist" && (
        <ShowArtistContent
          changeView={changeView}
          spotifyId={spotifyId}
        ></ShowArtistContent>
      )}
      {currentView === "playlist" && (
        <ShowPlaylistContent
          changeView={changeView}
          spotifyId={spotifyId}
        ></ShowPlaylistContent>
      )}
    </div>
  );
};

const SearchTypePill = ({
  searchType,
  setCurrentSearchType,
  currentSearchType,
}) => {
  return (
    <button
      className={`flex rounded-xl border border-fourth mr-4 pl-4 pr-4 hover:bg-fourth hover:text-white hover:brightness-75 ${
        searchType === currentSearchType ? "bg-fourth text-white" : "bg-white"
      }`}
      onClick={() => setCurrentSearchType(searchType)}
    >
      {searchType}
    </button>
  );
};

export default Search;
