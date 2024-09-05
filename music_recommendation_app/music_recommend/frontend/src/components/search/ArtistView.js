import React from "react";
import { MusicalNoteIcon } from "@heroicons/react/24/outline";

const ArtistView = ({ results, changeView }) => {
  return (
    <div className="w-full grid grid-cols-3 gap-8 px-8 pb-10">
      {results.items.map((item, index) => (
        <button
          key={item.id}
          className="flex group items-center rounded-xl mb-3 bg-white hover:bg-fourth hover:text-white shadow-xl transition-all ease-in-out duration-300"
          onClick={() => changeView("artist", item.id)}
        >
          {item.images.length > 0 ? (
            <img
              src={item.images[0].url}
              className="h-28 w-28 mr-2 rounded-xl"
            ></img>
          ) : (
            <MusicalNoteIcon className="h-28 w-28  mr-2"></MusicalNoteIcon>
          )}
          <div className="font-bold text-2xl text-center">{item.name}</div>
        </button>
      ))}
    </div>
  );
};

export default ArtistView;
