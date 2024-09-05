import React from "react";
import spotifyLogo from "../../static/images/Spotify_Logo_RGB_Green.png";

const SpotifyLogin = () => {
  const loginClick = () => {
    fetch("/spotify/get-auth-url")
      .then((response) => response.json())
      .then((data) => {
        //redirect user to spotify address obtained from the endpoint
        window.location.replace(data.url);
      });
  };
  return (
    <div>
      <div className="flex justify-center items-center h-screen w-screen bg-second">
        <div className="flex flex-col items-center border border-fourth bg-white shadow-2xl rounded-xl p-4">
          <h1 className="font-bold text-xl mb-4">Welcome back!</h1>
          <p className="mb-4">
            Please login or create a Spotify account to continue
          </p>
          <button
            className="p-3 bg-fourth rounded-full text-white hover:brightness-90 "
            onClick={loginClick}
          >
            Spotify Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpotifyLogin;
