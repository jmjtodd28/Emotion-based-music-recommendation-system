import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const DisplayChoices = ({ choices, removePreference, emotion, field }) => {
  //the choices are either an array of genres or artists/track objects

  const handlePreferenceRemove = (selectedItem) => {
    removePreference(emotion, field, selectedItem);
  };

  const borderColourVarients = {
    happy: "hover:border-yellow-400",
    sad: "hover:border-blue-400",
    neutral: "hover:border-gray-500",
    angry: "hover:border-red-500",
  };

  return (
    <div className="flex flex-col">
      {choices.map((choice, index) => (
        <div
          key={index}
          className={`mb-2 border border-white ${borderColourVarients[emotion]} rounded-lg`}
        >
          {typeof choice === "string" ? (
            <div className="flex flex-1 bg-main rounded-lg items-center">
              <div className="text-center w-full">{choice}</div>
              <button
                onClick={() => handlePreferenceRemove(choice)}
                className="ml-auto py-2"
              >
                <XMarkIcon className="text-black h-6 w-6 pr-1 hover:text-third"></XMarkIcon>
              </button>
            </div>
          ) : (
            <div className="flex items-center rounded-lg bg-main">
              <img src={choice.image} className="size-12 rounded-lg"></img>
              <p className="ml-4 break-words">{choice.name}</p>
              <button
                onClick={() => handlePreferenceRemove(choice)}
                className="ml-auto"
              >
                <XMarkIcon className="text-black h-6 w-6 pr-1"></XMarkIcon>
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DisplayChoices;
