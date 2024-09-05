import React, { useState } from "react";
import { MusicalNoteIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useToken } from "../TokenContext";
import PlaylistGenerator from "./PlaylistGenerator";

const ChoosePlaylist = ({
  playlists,
  showPlaylist,
  updateKey,
  setUpdateKey,
}) => {
  const { username, checkExpire } = useToken();
  const [createPlaylistView, setCreatePlaylistView] = useState(false);
  const [addPlaylistdata, setAddPlaylistData] = useState({
    name: "",
    description: "",
  });

  const [generateView, setGenerateView] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddPlaylistData({
      ...addPlaylistdata,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    const token = await checkExpire();
    fetch(`https://api.spotify.com/v1/users/${username}/playlists`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: addPlaylistdata.name,
        description: addPlaylistdata.description,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setUpdateKey(updateKey + 1);
      })
      .catch((error) => console.log(error));

    setCreatePlaylistView(false);

    setAddPlaylistData({ name: "", description: "" });
  };

  const handleCreatePlaylistClick = () => {
    setCreatePlaylistView(true);
  };

  const handlePopUpClose = () => {
    setAddPlaylistData({ name: "", description: "" });
    setCreatePlaylistView(false);
  };

  return (
    <div className="w-full relative bg-second h-full overflow-y-auto">
      <div
        className={`${
          (createPlaylistView || generateView) && "blur pointer-events-none"
        }`}
      >
        <div className="px-8 w-full sticky top-0 bg-second ">
          <div className=" py-8 px-4 flex">
            <span className="text-3xl font-bold">Playlists</span>
            <button
              onClick={() => handleCreatePlaylistClick()}
              className="rounded-xl p-2 text-white font-normal bg-fourth ml-auto hover:brightness-75 text-sm"
            >
              Create Playlist
            </button>
            <button
              onClick={() => setGenerateView(true)}
              className="rounded-xl p-2 text-white ml-4 font-normal bg-third hover:brightness-75 text-sm flex items-center"
            >
              Generate playlist
              <SparklesIcon className="h-6 w-6 ml-2"></SparklesIcon>
            </button>
          </div>
        </div>

        <div className="">
          <div className="flex flex-wrap pr-8 pl-8 pb-8 gap-8 justify-around w-full">
            {playlists?.map((playlist) => (
              <button
                key={playlist.id}
                className="flex flex-col group items-center w-1/5 p-6 bg-white rounded-xl shadow-2xl hover:bg-fourth hover:text-white transition-all duration-300 ease-in-out"
                onClick={() => showPlaylist(playlist.id)}
              >
                {playlist.images && playlist.images.length > 0 ? (
                  <img
                    src={playlist.images[0].url}
                    className="h-40 w-40 rounded-xl"
                  ></img>
                ) : (
                  <MusicalNoteIcon className="h-40 w-40"></MusicalNoteIcon>
                )}
                <div className="font-bold w-full overflow-hidden text-ellipsis whitespace-nowrap mt-2 text-left">
                  {playlist.name}
                </div>
                <div className="w-full text-left">
                  {playlist.tracks.total} Tracks
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      {createPlaylistView === true && (
        <div className="bg-blend-normal absolute flex flex-col w-1/3 top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-third rounded-xl p-4">
          <div className="text-center text-xl mb-4">Create Playlist</div>
          <div className="w-full">
            <div className="mb-4 flex flex-col">
              <label className="mb-2 text-xl">Playlist Name</label>
              <input
                className="appearance-none w-full bg-second rounded-lg border p-4 text-md hover:border-third focus:border-third focus:border-2 outline-none"
                type="text"
                name="name"
                value={addPlaylistdata.name}
                placeholder="Required"
                onChange={handleInputChange}
                required
              ></input>
            </div>
            <div className="mb-4 flex flex-col">
              <label className="mb-2 text-xl">Description</label>
              <textarea
                className="appearance-none w-full bg-second rounded-lg border p-4 text-md hover:border-third focus:border-third focus:border-2 outline-none"
                type="text"
                name="description"
                value={addPlaylistdata.description}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <div className="flex w-full justify-center">
              <button
                onClick={() => handleSubmit()}
                className={`mr-4 rounded-lg bg-fourth text-white p-2 hover:brightness-75 ${
                  addPlaylistdata.name === "" &&
                  "pointer-events-none brightness-75"
                }`}
              >
                Submit
              </button>
              <button
                className="rounded-lg bg-third text-white hover:brightness-75 p-2"
                onClick={handlePopUpClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {generateView === true && (
        <PlaylistGenerator
          setGenerateView={setGenerateView}
          updateKey={updateKey}
          setUpdateKey={setUpdateKey}
        ></PlaylistGenerator>
      )}
    </div>
  );
};

export default ChoosePlaylist;
