import React, { useState } from "react";

const EmotionSelection = ({
  setSelectedEmotion,
  selectedOption,
  setSelectedOption,
}) => {
  const handleOnClick = (emotion) => {
    setSelectedEmotion(emotion);
    setSelectedOption(emotion);
  };
  return (
    <div className="flex flex-col">
      <h1 className="text-xl font-bold mb-4">Select Emotion</h1>
      <div className="mb-4">
        Don't want to you use your camera? Select and emotion below and start
        playing!
      </div>
      <button
        onClick={() => handleOnClick("happy")}
        className="cursor-pointer items-center group flex mb-2"
      >
        <div
          className={`border-third border-2 h-6 w-6 rounded-full group-hover:bg-third ${
            selectedOption === "happy" ? "bg-third" : "bg-white"
          }`}
        ></div>
        <div className="ml-4 text-lg">Happy</div>
      </button>
      <button
        onClick={() => handleOnClick("neutral")}
        className="cursor-pointer items-center group flex mb-2"
      >
        <div
          className={`border-third border-2 h-6 w-6 rounded-full group-hover:bg-third ${
            selectedOption === "neutral" ? "bg-third" : "bg-white"
          }`}
        ></div>
        <div className="ml-4 text-lg">Neutral</div>
      </button>
      <button
        onClick={() => handleOnClick("sad")}
        className="cursor-pointer items-center group flex mb-2"
      >
        <div
          className={`border-third border-2 h-6 w-6 rounded-full group-hover:bg-third ${
            selectedOption === "sad" ? "bg-third" : "bg-white"
          }`}
        ></div>
        <div className="ml-4 text-lg">Sad</div>
      </button>
      <button
        onClick={() => handleOnClick("angry")}
        className="cursor-pointer items-center group flex mb-2"
      >
        <div
          className={`border-third border-2 h-6 w-6 rounded-full group-hover:bg-third ${
            selectedOption === "angry" ? "bg-third" : "bg-white"
          }`}
        ></div>
        <div className="ml-4 text-lg">Angry</div>
      </button>
    </div>
  );
};

export default EmotionSelection;
