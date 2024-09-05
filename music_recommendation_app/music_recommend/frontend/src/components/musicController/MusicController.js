import React, { useEffect, useState, useRef } from "react";
import { useToken } from "../TokenContext";
import { useSpotifyPlayer } from "../SpotifyPlayerContext";
import {
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/outline";
import { PlayCircleIcon, PauseCircleIcon } from "@heroicons/react/24/solid";
import CustomSlider from "./customSlider/CustomSlider";
import AddToPlaylistButton from "./AddToPlaylistButton";

const track = {
  name: "",
  album: {
    images: [{ url: "" }],
  },
  artists: [{ name: "" }],
};

const MusicController = () => {
  const { updatePlayerState, updateSongSkipped } = useSpotifyPlayer();
  const { token } = useToken();
  const [player, setPlayer] = useState(undefined);
  const [deviceId, setDeviceId] = useState("");
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState(track);
  //position of current song
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const playerRef = useRef(null);

  //this is to update the value on the music slider every second the song is not paused
  useEffect(() => {
    const interval = setInterval(() => {
      if (is_paused) {
        return;
      } else if (position + 1000 < duration) {
        setPosition(position + 1000);
      } else {
        setPosition(duration);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [position, is_paused]);

  useEffect(() => {
    //code used to set up music player taken from https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => {
          cb(token);
        },
        volume: 0.5,
      });

      setPlayer(player);
      playerRef.current = player;

      player.addListener("ready", ({ device_id }) => {
        console.log("Music Player ready with Device ID", device_id);
        setDeviceId(device_id);

        //Sets the current listening device to the web sdk so no need for manual transfer
        fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            device_ids: [device_id],
          }),
        }).catch((error) => console.log(error));
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
        setDeviceId("");
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) {
          return;
        }

        setTrack(state.track_window.current_track);
        updatePlayerState(state);
        setPaused(state.paused);
        setPosition(state.position);
        setDuration(state.duration);

        player.getCurrentState().then((state) => {
          !state ? setActive(false) : setActive(true);
        });
      });

      player.connect();
    };
    return () => {
      const player = playerRef.current;
      if (player) {
        player.disconnect();
      }
    };
  }, []);

  //handles the change in value of the slider on the screen
  const handleSongSliderChange = (event) => {
    const newPostion = parseFloat(event.target.value);
    setPosition(newPostion);
  };

  //when the thumb is released this is triggered
  const handleSongMouseUp = (event) => {
    const newPostion = parseFloat(event.target.value);
    const apiUrl = `https://api.spotify.com/v1/me/player/seek?position_ms=${newPostion}`;

    fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch((error) => {
      if (error.name !== "AbortError") {
        console.log(error);
      }
    });
  };

  //handles the volume slider change
  const handleVolumeSliderChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);

    player.setVolume(newVolume / 100).catch((error) => console.log(error));
  };

  const handleVolumeMouseUp = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
  };

  const formatSongTimes = (ms) => {
    const secs = Math.floor(ms / 1000);
    const mins = Math.floor(secs / 60);
    const formatSec = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(formatSec).padStart(
      2,
      "0"
    )}`;
  };

  const formattedPos = formatSongTimes(position);
  const formattedDuration = formatSongTimes(duration);

  if (!is_active) {
    return (
      <div className="h-24 bg-fourth flex items-center justify-center text-white">
        Loading Music Player...
      </div>
    );
  } else
    return (
      <>
        <div className="h-24 flex text-white items-center bg-fourth">
          <div className="flex items-center w-3/12">
            <img
              src={current_track?.album.images[0].url}
              className="h-20 w-20 rounded-lg ml-4 mr-2"
            ></img>
            <div className="flex flex-col whitespace-nowrap overflow-hidden">
              <div className="truncate font-bold">{current_track?.name}</div>
              <div className="truncate">{current_track?.artists[0].name}</div>
            </div>
            <AddToPlaylistButton></AddToPlaylistButton>
          </div>
          <div className="flex items-center w-1/3 px-6">
            <div className="mr-4 w-18">{formattedPos}</div>
            <CustomSlider
              maxVal={duration}
              position={position}
              handleSliderChange={handleSongSliderChange}
              handleMouseUp={handleSongMouseUp}
              step={1000}
            ></CustomSlider>
            <div className="ml-4 w-18 ">{formattedDuration}</div>
          </div>
          <div className="w-3/12 flex items-center justify-center">
            <button>
              <BackwardIcon
                className="text-white h-6 w-6 mr-4 hover:fill-third hover:text-third"
                onClick={() => player.previousTrack()}
              ></BackwardIcon>
            </button>
            {!is_paused ? (
              <button>
                <PauseCircleIcon
                  className="text-white h-10 w-10 mr-4 hover:text-third"
                  onClick={() => player.togglePlay()}
                ></PauseCircleIcon>
              </button>
            ) : (
              <button>
                <PlayCircleIcon
                  className="text-white h-10 w-10 mr-4 hover:text-third"
                  onClick={() => player.togglePlay()}
                ></PlayCircleIcon>
              </button>
            )}
            <button>
              <ForwardIcon
                className="text-white h-6 w-6 mr-4 hover:fill-third hover:text-third"
                onClick={() => {
                  player.nextTrack();
                  updateSongSkipped();
                }}
              ></ForwardIcon>
            </button>
          </div>
          <div className="mr-4 flex items-center w-2/12">
            {volume === 0 ? (
              <SpeakerXMarkIcon className="text-white h-6 w-6 mr-4"></SpeakerXMarkIcon>
            ) : (
              <SpeakerWaveIcon className="text-white h-6 w-6 mr-4"></SpeakerWaveIcon>
            )}
            <CustomSlider
              maxVal={100}
              position={volume}
              handleSliderChange={handleVolumeSliderChange}
              handleMouseUp={handleVolumeMouseUp}
              step={1}
            ></CustomSlider>
          </div>
        </div>
      </>
    );
};

export default MusicController;
