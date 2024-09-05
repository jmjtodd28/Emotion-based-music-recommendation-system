import React, { useEffect, useState } from "react";
import DisplayChoices from "./DisplayChoices";
import { PlusIcon } from "@heroicons/react/24/outline";

const PreferenceCard = ({
  toggleSearch,
  userPreferences,
  emotion,
  removePreference,
  accordionOption,
  setAccordionOption,
}) => {
  const emotionPreferences = userPreferences[emotion];

  //Cant use props to dynamically build classes, need to map props to static class names, just a tailwind annoyance
  const buttonColourVarients = {
    happy: "border-yellow-400 hover:bg-yellow-400",
    sad: "border-blue-400 hover:bg-blue-400",
    neutral: "border-gray-500 hover:bg-gray-500",
    angry: "border-red-500 hover:bg-red-500",
  };
  const bgColourVarients = {
    happy: "bg-yellow-400",
    sad: "bg-blue-400",
    neutral: "bg-gray-500",
    angry: "bg-red-500",
  };
  const borderColourVarients = {
    happy: "border-yellow-400",
    sad: "border-blue-400",
    neutral: "border-gray-500",
    angry: "border-red-500",
  };

  return (
    <div
      className={` bg-white rounded-xl w-full text-black shadow-xl border-2 ${borderColourVarients[emotion]} `}
    >
      <h2
        className={`text-white ${bgColourVarients[emotion]} text-center rounded-lg text-xl capitalize p-4 cursor-pointer`}
        onClick={() => setAccordionOption(emotion)}
      >
        {emotion}
      </h2>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          accordionOption !== emotion
            ? "grid-rows-[0fr] opacity-0"
            : "grid-rows-[1fr] opacity-100"
        }`}
      >
        <div className={`flex flex-col px-2 overflow-hidden `}>
          <div className="p-2">
            {emotionPreferences.artist.length +
              emotionPreferences.genres.length +
              emotionPreferences.track.length}{" "}
            / 5 seeds selected
          </div>
          <div className="flex">
            <div className="w-5/12 p-2">
              <p className="mb-4">Artists:</p>
              <DisplayChoices
                choices={emotionPreferences.artist}
                removePreference={removePreference}
                emotion={emotion}
                field={"artist"}
              ></DisplayChoices>
              {emotionPreferences.artist.length +
                emotionPreferences.genres.length +
                emotionPreferences.track.length !==
                5 && (
                <div className="relative flex items-center hover:text-white">
                  <PlusIcon className=" absolute ml-2 h-5 w-5"></PlusIcon>
                  <button
                    className={`bg-main rounded-lg text-center w-full p-2 pl-8 border ${buttonColourVarients[emotion]} hover:text-white`}
                    onClick={() => toggleSearch(true, emotion, "artist")}
                  >
                    Add Artist
                  </button>
                </div>
              )}
            </div>
            <div className="w-5/12 p-2">
              <p className="mb-4">Songs:</p>
              <DisplayChoices
                choices={emotionPreferences.track}
                removePreference={removePreference}
                emotion={emotion}
                field={"track"}
              ></DisplayChoices>
              {emotionPreferences.artist.length +
                emotionPreferences.genres.length +
                emotionPreferences.track.length !==
                5 && (
                <div className="relative flex items-center hover:text-white">
                  <PlusIcon className=" absolute ml-2 h-5 w-5"></PlusIcon>
                  <button
                    className={`bg-main rounded-lg text-center w-full p-2 pl-8 border ${buttonColourVarients[emotion]} hover:text-white`}
                    onClick={() => toggleSearch(true, emotion, "track")}
                  >
                    Add Song
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col p-2 w-2/12">
              <p className="mb-4">Genres:</p>
              <div className="flex flex-col">
                <DisplayChoices
                  choices={emotionPreferences.genres}
                  removePreference={removePreference}
                  emotion={emotion}
                  field={"genres"}
                ></DisplayChoices>
                {emotionPreferences.artist.length +
                  emotionPreferences.genres.length +
                  emotionPreferences.track.length !==
                  5 && (
                  <div className="relative flex items-center hover:text-white w-full">
                    <PlusIcon className=" absolute ml-2 h-5 w-5"></PlusIcon>
                    <button
                      className={`bg-white w-full rounded-lg text-center p-2 pl-8 border ${buttonColourVarients[emotion]} hover:text-white`}
                      onClick={() => toggleSearch(true, emotion, "genres")}
                    >
                      Add Genre
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferenceCard;
