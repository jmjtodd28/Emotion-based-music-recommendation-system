import React from "react";
import { MusicalNoteIcon } from "@heroicons/react/24/outline";

const PlaylistView = ({ results, changeView }) => {
  return (
    <div className="w-full grid grid-cols-3 gap-8 px-8 pb-10">
      {results.items.map((item, index) => (
        <button
          key={item.id}
          className="flex group items-center mb-3 bg-white rounded-xl hover:bg-fourth hover:cursor-pointer hover:text-white shadow-xl transition-all duration-300 ease-in-out"
          onClick={() => changeView("playlist", item.id)}
        >
          {item.images.length > 0 ? (
            <img
              src={item.images[0].url}
              className="h-28 w-28 mr-2 rounded-xl"
            ></img>
          ) : (
            <MusicalNoteIcon className="h-28 w-28  mr-2"></MusicalNoteIcon>
          )}
          <div className="flex flex-col w-full text-center">
            <div className="font-bold text-2xl text-center line-clamp-2">
              {item.name}
            </div>
            <div className="text-center">{item.owner.display_name} </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default PlaylistView;
