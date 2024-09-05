import { createContext, useContext, useState } from "react";
import React from "react";

const SpotifyPlayerContext = createContext();

export const SpotifyPlayerProvider = ({ children }) => {
  const [currentPlayerState, setCurrentPlayerState] = useState(null);
  const [songSkipped, setSongSkipped] = useState(0);

  const updatePlayerState = (newState) => {
    setCurrentPlayerState(newState);
  };

  //this is a way to detect when a song has been skipped, hard to detect with just sdk, skip button will trigger this in the music player
  const updateSongSkipped = () => {
    setSongSkipped(songSkipped + 1);
  };

  return (
    <SpotifyPlayerContext.Provider
      value={{
        currentPlayerState,
        updatePlayerState,
        updateSongSkipped,
        songSkipped,
      }}
    >
      {children}
    </SpotifyPlayerContext.Provider>
  );
};

export const useSpotifyPlayer = () => {
  return useContext(SpotifyPlayerContext);
};
