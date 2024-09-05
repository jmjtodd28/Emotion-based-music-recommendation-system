import React, { useState, useEffect } from "react";
import { useToken } from "../TokenContext";
import ChoosePlaylist from "./ChoosePlaylist";
import DisplayPlaylistContent from "./DisplayPlaylistContent";

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const { username, checkExpire } = useToken();
  const [selectedPlaylistID, setSelectedPlaylistID] = useState("");
  const [selectedPlaylistContent, setSelectedPlaylistContent] = useState([]);
  const [playlistView, setPlaylistView] = useState(false);
  //this will be used to rerender the playlists once a new one has been added
  const [updateKey, setUpdateKey] = useState(0);

  useEffect(() => {
    getPlaylists();
  }, [updateKey]);

  const getPlaylists = async () => {
    const token = await checkExpire();
    fetch(`https://api.spotify.com/v1/users/${username}/playlists?limit=50`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setPlaylists(data.items);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    const selected = playlists.find(
      (playlist) => playlist.id === selectedPlaylistID
    );
    setSelectedPlaylistContent(selected);
  }, [selectedPlaylistID, playlists]);

  const showPlaylist = (playlistId) => {
    if (playlistView) {
      setPlaylistView(false);
    } else {
      setPlaylistView(true);
      setSelectedPlaylistID(playlistId);
    }
  };

  return (
    <div className="">
      {!playlistView ? (
        <ChoosePlaylist
          playlists={playlists}
          showPlaylist={showPlaylist}
          updateKey={updateKey}
          setUpdateKey={setUpdateKey}
        ></ChoosePlaylist>
      ) : (
        <DisplayPlaylistContent
          selectedPlaylistID={selectedPlaylistID}
          selectedPlaylistContent={selectedPlaylistContent}
          showPlaylist={showPlaylist}
          playlists={playlists}
          updateKey={updateKey}
          setUpdateKey={setUpdateKey}
        ></DisplayPlaylistContent>
      )}
    </div>
  );
};

export default Playlists;
