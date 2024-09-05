import React from "react";

const StartPlayingButton = ({
  validPreferences,
  getRecommendation,
  selectedOption,
}) => {
  return (
    <div>
      <div className="flex flex-col">
        {validPreferences && selectedOption !== ("" && "detect") ? (
          <button
            onClick={() => getRecommendation()}
            className="w-1/3 self-center bg-fourth rounded-lg text-white p-4 hover:brightness-90"
          >
            Start Playing!
          </button>
        ) : (
          <div className=" flex flex-col cursor-not-allowed">
            <button
              onClick={() => getRecommendation()}
              className="w-1/3 self-center brightness-75 bg-fourth rounded-xl text-white p-4 pointer-events-none"
            >
              Start Playing!
            </button>
          </div>
        )}

        {!validPreferences && (
          <div className="text-pink-600 text-sm self-center">
            Incomplete Preferences
          </div>
        )}

        {selectedOption === "" && (
          <div className="text-pink-600 text-sm self-center">
            Emotion not selected
          </div>
        )}
      </div>
    </div>
  );
};

export default StartPlayingButton;
