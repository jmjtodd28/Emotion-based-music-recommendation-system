import React, { useEffect, useState } from "react";
import { useToken } from "../TokenContext";
import GenreSearch from "./GenreSearch";
import SpotifySearch from "./SpotifySearch";
import PreferenceCard from "./PreferenceCard";

const Preferences = () => {
  const { token, checkExpire } = useToken();
  const [genres, setGenres] = useState([]);
  const [emotion, setEmotion] = useState("");
  // This can be genres, track or artist
  const [field, setField] = useState("");
  const [userPreferences, setUserPreferences] = useState({
    happy: { genres: [], track: [], artist: [] },
    sad: { genres: [], track: [], artist: [] },
    angry: { genres: [], track: [], artist: [] },
    neutral: { genres: [], track: [], artist: [] },
  });
  const [genreSearchIsOpen, setGenreSearchIsOpen] = useState(false);
  const [spotifySearchIsOpen, setSpotifySearchIsOpen] = useState(false);
  const [accordionOption, setAccordionOption] = useState("happy");

  //obtained at https://developer.spotify.com/documentation/web-api/reference/get-recommendation-genres by doing the api call there
  const backupGenreList = [
    "acoustic",
    "afrobeat",
    "alt-rock",
    "alternative",
    "ambient",
    "anime",
    "black-metal",
    "bluegrass",
    "blues",
    "bossanova",
    "brazil",
    "breakbeat",
    "british",
    "cantopop",
    "chicago-house",
    "children",
    "chill",
    "classical",
    "club",
    "comedy",
    "country",
    "dance",
    "dancehall",
    "death-metal",
    "deep-house",
    "detroit-techno",
    "disco",
    "disney",
    "drum-and-bass",
    "dub",
    "dubstep",
    "edm",
    "electro",
    "electronic",
    "emo",
    "folk",
    "forro",
    "french",
    "funk",
    "garage",
    "german",
    "gospel",
    "goth",
    "grindcore",
    "groove",
    "grunge",
    "guitar",
    "happy",
    "hard-rock",
    "hardcore",
    "hardstyle",
    "heavy-metal",
    "hip-hop",
    "holidays",
    "honky-tonk",
    "house",
    "idm",
    "indian",
    "indie",
    "indie-pop",
    "industrial",
    "iranian",
    "j-dance",
    "j-idol",
    "j-pop",
    "j-rock",
    "jazz",
    "k-pop",
    "kids",
    "latin",
    "latino",
    "malay",
    "mandopop",
    "metal",
    "metal-misc",
    "metalcore",
    "minimal-techno",
    "movies",
    "mpb",
    "new-age",
    "new-release",
    "opera",
    "pagode",
    "party",
    "philippines-opm",
    "piano",
    "pop",
    "pop-film",
    "post-dubstep",
    "power-pop",
    "progressive-house",
    "psych-rock",
    "punk",
    "punk-rock",
    "r-n-b",
    "rainy-day",
    "reggae",
    "reggaeton",
    "road-trip",
    "rock",
    "rock-n-roll",
    "rockabilly",
    "romance",
    "sad",
    "salsa",
    "samba",
    "sertanejo",
    "show-tunes",
    "singer-songwriter",
    "ska",
    "sleep",
    "songwriter",
    "soul",
    "soundtracks",
    "spanish",
    "study",
    "summer",
    "swedish",
    "synth-pop",
    "tango",
    "techno",
    "trance",
    "trip-hop",
    "turkish",
    "work-out",
    "world-music",
  ];

  useEffect(() => {
    getPreferences();
    getGenres();
  }, []);

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
        setUserPreferences(convertData);
      })
      .catch((error) => console.log(error));
  };

  const toggleSearch = (bool, emotion, field) => {
    if (field === "genres") {
      setEmotion(emotion);
      setField(field);
      setGenreSearchIsOpen(bool);
    } else if (field === "") {
      setEmotion(emotion);
      setField(field);
      setSpotifySearchIsOpen(bool);
      setGenreSearchIsOpen(bool);
    } else {
      setSpotifySearchIsOpen(bool);
      setEmotion(emotion);
      setField(field);
    }
  };

  const addPreference = (emotion, field, value) => {
    if (value.type === "genre") {
      const newPreferences = {
        ...userPreferences,
        [emotion]: {
          ...userPreferences[emotion],
          [field]: [...userPreferences[emotion][field], value.genre],
        },
      };
      setUserPreferences(newPreferences);
      postPreferences(newPreferences);
    } else {
      const { spotifyId, name, image } = value;
      const newPreferences = {
        ...userPreferences,
        [emotion]: {
          ...userPreferences[emotion],
          [field]: [
            ...userPreferences[emotion][field],
            { spotifyId, name, image },
          ],
        },
      };
      setUserPreferences(newPreferences);
      postPreferences(newPreferences);
    }

    setSpotifySearchIsOpen(false);
    setGenreSearchIsOpen(false);
  };

  const removePreference = (emotion, field, removeValue) => {
    const newPreferences = {
      ...userPreferences,
      [emotion]: {
        ...userPreferences[emotion],
        [field]: userPreferences[emotion][field].filter(
          (value) => value !== removeValue
        ),
      },
    };

    setUserPreferences(newPreferences);
    postPreferences(newPreferences);
  };

  const postPreferences = async (newPreferences) => {
    fetch("http://localhost:8000/api/set-preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPreferences),
    })
      .then((response) => response.json())
      .catch((error) => console.log(error));
  };

  const getGenres = async () => {
    const _token = await checkExpire();
    fetch("https://api.spotify.com/v1/recommendations/available-genre-seeds", {
      method: "GET",
      headers: { Authorization: `Bearer ${_token}` },
    })
      .then((response) => response.json())
      .then((data) => setGenres(data.genres))
      .catch((error) => {
        //this endpoint can be buggy so if the fetch fails, we will hardcode the results -- may run into disparity if they change the genre list
        setGenres(backupGenreList);
      });
  };

  useEffect(() => {
    setGenreSearchIsOpen(false);
  }, [userPreferences]);

  return (
    <div className=" relative w-full flex-col bg-second h-full overflow-y-auto">
      {genreSearchIsOpen && (
        <div className="z-10 absolute w-1/3 h-96 overflow-y-auto overscroll-none top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-third rounded-xl  ">
          <GenreSearch
            genres={genres}
            addPreference={addPreference}
            emotion={emotion}
            field={field}
            toggleSearch={toggleSearch}
          ></GenreSearch>
        </div>
      )}

      {spotifySearchIsOpen && (
        <div className="z-10 absolute w-1/2 h-96 overflow-y-auto overscroll-none top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-third rounded-xl  ">
          <SpotifySearch
            addPreference={addPreference}
            emotion={emotion}
            field={field}
            token={token}
            toggleSearch={toggleSearch}
          ></SpotifySearch>
        </div>
      )}

      <div
        className={`flex flex-col w-full overflow-y-auto bg-second ${
          (genreSearchIsOpen || spotifySearchIsOpen) &&
          "blur pointer-events-none"
        }`}
      >
        <div className="px-12 py-8 text-3xl font-bold">Music Preferences</div>
        <div className="px-12 pb-8">
          Add up to five seeds (artists/songs/genres) for every emotion, these
          will be used in the Emotion-Based Music feature to recommend music.
        </div>
        <div className="flex flex-col px-12 pb-6 ">
          <PreferenceCard
            toggleSearch={toggleSearch}
            userPreferences={userPreferences}
            emotion={"happy"}
            removePreference={removePreference}
            accordionOption={accordionOption}
            setAccordionOption={setAccordionOption}
          ></PreferenceCard>
          <PreferenceCard
            toggleSearch={toggleSearch}
            userPreferences={userPreferences}
            emotion={"sad"}
            removePreference={removePreference}
            accordionOption={accordionOption}
            setAccordionOption={setAccordionOption}
          ></PreferenceCard>
          <PreferenceCard
            toggleSearch={toggleSearch}
            userPreferences={userPreferences}
            emotion={"angry"}
            removePreference={removePreference}
            accordionOption={accordionOption}
            setAccordionOption={setAccordionOption}
          ></PreferenceCard>
          <PreferenceCard
            toggleSearch={toggleSearch}
            userPreferences={userPreferences}
            emotion={"neutral"}
            removePreference={removePreference}
            accordionOption={accordionOption}
            setAccordionOption={setAccordionOption}
          ></PreferenceCard>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
