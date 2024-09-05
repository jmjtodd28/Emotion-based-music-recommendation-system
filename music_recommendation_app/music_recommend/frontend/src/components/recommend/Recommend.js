import React, { useEffect, useState, useRef } from "react";
import { useToken } from "../TokenContext";
import EmotionSelection from "./EmotionSelection";
import StartPlayingButton from "./StartPlayingButton";
import { VideoCameraSlashIcon } from "@heroicons/react/24/outline";
import Webcam from "react-webcam";
import { useSpotifyPlayer } from "../SpotifyPlayerContext";

const Recommend = ({ setCurrentView }) => {
  const { checkExpire } = useToken();
  const { currentPlayerState, songSkipped } = useSpotifyPlayer();
  const [userPreferences, setUserPreferences] = useState({
    happy: { genres: [], track: [], artist: [] },
    sad: { genres: [], track: [], artist: [] },
    angry: { genres: [], track: [], artist: [] },
    neutral: { genres: [], track: [], artist: [] },
  });

  //valid prefernces are those where there is at least one seed for every emotion, cant get recommendaiton with no seeds for a genre
  const [validPreferences, setValidPreferences] = useState(false);
  const [liveDetect, setLiveDetect] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [liveEmotion, setLiveEmotion] = useState(null);
  //have to manually keep a queue as you cant interact with the spotify queue fully through the api
  const [trackHasEnded, setTrackHasEnded] = useState(true);
  const [firstPlay, setFirstPlay] = useState(true);
  const webcamRef = useRef(null);
  //this is the manual emotion selection option
  const [selectedOption, setSelectedOption] = useState("");

  useEffect(() => {
    getPreferences();
  }, []);

  useEffect(() => {
    playRecommendation(selectedEmotion);
  }, [songSkipped]);

  useEffect(() => {
    //it is difficult to detect when a song has ended with the sdk but i found a solution here: https://github.com/spotify/web-playback-sdk/issues/35
    //song has ended
    if (currentPlayerState === null) {
      return;
    }

    if (
      currentPlayerState &&
      currentPlayerState.track_window.previous_tracks.find(
        (x) => x.id === currentPlayerState.track_window.current_track.id
      ) &&
      !currentPlayerState.paused
    ) {
      setTrackHasEnded(true);
    } else {
      setTrackHasEnded(false);
    }
  }, [currentPlayerState]);

  useEffect(() => {
    if (trackHasEnded) {
      //console.log("track has ended");
      playRecommendation(selectedEmotion);
    }
  }, [trackHasEnded]);

  //get user preferences from the backend
  const getPreferences = async () => {
    fetch("http://localhost:8000/api/set-preferences", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        const convertData = {
          happy: data.data.happy,
          sad: data.data.sad,
          angry: data.data.angry,
          neutral: data.data.neutral,
        };
        //We need to check to see if there as at least one seed for each emotions otherwise api will give error

        const isValid = Object.keys(convertData).every((emotion) => {
          const emotionData = convertData[emotion];
          return (
            emotionData.genres.length > 0 ||
            emotionData.track.length > 0 ||
            emotionData.artist.length > 0
          );
        });

        if (isValid) {
          setUserPreferences(convertData);
          setValidPreferences(true);
        } else {
          setValidPreferences(false);
        }

        setUserPreferences(convertData);
      })
      .catch((error) => console.log(error));
  };

  const getRecommendation = () => {
    if (selectedEmotion !== "detect") {
      playRecommendation(selectedEmotion);
    } else {
      toggleWebcam();
    }
  };

  //get reccommendation to spotify api with the seeds
  const playRecommendation = async (emotion) => {
    if (emotion === "" || emotion === "detect") {
      return;
    }
    const emotionPreferences = userPreferences[emotion];

    const genres = emotionPreferences.genres;
    const trackSeeds = emotionPreferences.track.map((obj) => obj.spotifyId);
    const artistSeeds = emotionPreferences.artist.map((obj) => obj.spotifyId);

    const urlParams = [];
    const apiUrl = "https://api.spotify.com/v1/recommendations?";

    urlParams.push(`market=GB`);
    urlParams.push("limit=1");

    if (genres.length > 0) {
      urlParams.push(`seed_genres=${encodeURIComponent(genres.join(","))}`);
    }

    if (trackSeeds.length > 0) {
      urlParams.push(`seed_tracks=${encodeURIComponent(trackSeeds.join(","))}`);
    }

    if (artistSeeds.length > 0) {
      urlParams.push(
        `seed_artists=${encodeURIComponent(artistSeeds.join(","))}`
      );
    }

    const finalUrl = `${apiUrl}${urlParams.join("&")}`;

    const token = await checkExpire();

    fetch(finalUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        const trackUri = data.tracks[0].uri;
        playSong(trackUri);
      })
      .catch((error) => console.log(error));
  };

  const playSong = async (trackUri) => {
    const token = await checkExpire();
    const trackUris = [trackUri];
    fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: trackUris,
        position_ms: 0,
      }),
    }).catch((error) => console.log(error));
  };

  const toggleWebcam = () => {
    if (liveDetect) {
      setFirstPlay(false);
      setLiveDetect(false);
    } else {
      setLiveDetect(true);
    }
  };

  //Takes screenshot of video feed, sends to backend to be evaluated
  const getEmotion = async () => {
    const imgSrc = webcamRef.current.getScreenshot();

    if (imgSrc === null) {
      return;
    }

    //send it to the backend to reveice emotion analysis
    fetch("http://localhost:8000/api/get-emotion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imgSrc }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success === false) {
          setLiveEmotion("No face detected");
        } else {
          setLiveEmotion(data.prediction);
          setSelectedEmotion(data.prediction);
          if (firstPlay) {
            setFirstPlay((prevFirstPlay) => {
              if (prevFirstPlay) {
                playRecommendation(data.prediction);
                return false;
              }
              return prevFirstPlay;
            });
          }
        }
      })
      .catch((error) => console.log(error));
  };

  //  runs when the camera is open
  useEffect(() => {
    const interval = setInterval(() => {
      if (liveDetect) {
        getEmotion();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [liveDetect]);

  return (
    <div className="w-full bg-second h-full overflow-y-auto">
      <h1 className="text-3xl font-bold pl-12 pt-8">Emotion-Based Music</h1>
      <div className="p-8 px-12 flex">
        <div className="w-1/2">
          <div className="flex mb-4 items-center">
            <div className="w-full h-0.5 px-2 mr-12 bg-third"></div>
          </div>
          <div className="flex flex-col">
            <div className="text-xl font-bold mb-4">Live Emotion Detection</div>
            <div className="mb-2 pr-12">
              Clicking the button below will turn on you camera and start
              recommending music based off your current facial emotions and
              music preferences.
            </div>
            {!liveDetect && (
              <button
                onClick={() => {
                  setSelectedEmotion("detect");
                  getRecommendation();
                  toggleWebcam();
                }}
                className="bg-fourth self-center rounded-xl text-white hover:brightness-90 p-4 mt-2 w-1/3"
              >
                Start Emotion Detection!
              </button>
            )}
          </div>
          <div>
            {liveDetect ? (
              <div className="flex flex-col">
                <div className="font-bold text-xl mb-4">
                  Detected Emotion:{" "}
                  <span className="text-third capitalize">{liveEmotion}</span>
                </div>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  className="rounded-xl self-center w-5/6"
                ></Webcam>
                <div className="flex flex-col items-center pt-4">
                  <button
                    className="bg-fourth rounded-xl text-white hover:brightness-90 p-4  "
                    onClick={() => {
                      toggleWebcam();
                      setFirstPlay(false);
                    }}
                  >
                    End facial Detection
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <VideoCameraSlashIcon className="h-72 w-72"></VideoCameraSlashIcon>
              </div>
            )}
          </div>
        </div>
        <div className="w-1/2">
          <div className="flex mb-4 items-center">
            <div className="  w-full bg-third h-0.5 px-2"></div>
          </div>
          <EmotionSelection
            setSelectedEmotion={setSelectedEmotion}
            setSelectedOption={setSelectedOption}
            selectedOption={selectedOption}
          ></EmotionSelection>
          <div>
            <StartPlayingButton
              validPreferences={validPreferences}
              getRecommendation={getRecommendation}
              selectedOption={selectedOption}
            ></StartPlayingButton>
          </div>
          <div className="flex my-4 items-center">
            <div className="  w-full bg-third h-0.5 px-2"></div>
          </div>
          <div className="flex flex-col">
            <div className="text-xl font-bold mb-4">Like what you hear? </div>
            <div className="flex">
              <div className="w-1/2 flex flex-col mr-1">
                <div className="text-xl text-bold text-green-500">YES!</div>
                <div className="py-2">Add songs you like to your playlists</div>
              </div>
              <div className="flex flex-col w-1/2 ml-1">
                <div className="text-xl text-bold text-red-500">NO!</div>
                <div className="py-2">
                  Edit your music preferences to change what you hear
                </div>
                <button
                  onClick={() => setCurrentView("preferences")}
                  className="p-4 w-2/3 text-white self-center rounded-lg bg-fourth hover:brightness-90"
                >
                  Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommend;
