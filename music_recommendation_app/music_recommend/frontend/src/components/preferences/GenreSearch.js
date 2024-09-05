import React, { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const GenreSearch = ({
  genres,
  addPreference,
  emotion,
  field,
  toggleSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredGenres, setFilteredGeners] = useState(genres);

  const handleSearch = (event) => {
    const newSearchTerm = event.target.value.toLowerCase();
    setSearchTerm(newSearchTerm);

    const filtered = genres.filter((genre) =>
      genre.toLowerCase().includes(newSearchTerm)
    );

    setFilteredGeners(filtered);
  };

  const handleGenreClick = (selectedGenre) => {
    const genreInfo = {
      type: "genre",
      genre: selectedGenre,
    };
    addPreference(emotion, field, genreInfo);
  };

  return (
    <div className="flex flex-col p-2 ">
      <div className="sticky top-0 z-10 bg-white w-full ">
        <div className="relative flex items-center">
          <MagnifyingGlassIcon className="w-5 h-5 absolute ml-3 pointer-events-none"></MagnifyingGlassIcon>
          <input
            type="text"
            placeholder="Search Genres..."
            value={searchTerm}
            onChange={handleSearch}
            className="appearance-none w-full  p-4 pl-10 text-md  outline-none"
          ></input>
        </div>
      </div>
      <div className="flex flex-col overflow-hidden px-8 pb-2">
        {filteredGenres.map((genre, index) => (
          <button
            className="text-black  py-2 hover:bg-fourth hover:text-white rounded-xl"
            key={index}
            onClick={() => handleGenreClick(genre)}
          >
            {genre}
          </button>
        ))}
      </div>
      <div className="flex p-2 sticky bottom-0 bg-white w-full justify-center">
        <button
          className=" w-14 p-2 bg-third hover:brightness-75 text-white rounded-lg"
          onClick={() => toggleSearch(false, "", "")}
        >
          Exit
        </button>
      </div>
    </div>
  );
};

export default GenreSearch;
