import React, { useEffect, useState } from "react";
import SpotifyLogin from "./SpotifyLogin";
import Sidebar from "./sidebar/Sidebar";
import Recommend from "./recommend/Recommend";
import MusicController from "./musicController/MusicController";
import Preferences from "./preferences/Preferences";
import Playlists from "./playlists/Playlists";
import Search from "./search/Search";
import "./main.css";
import { useToken } from "./TokenContext";

const App = () => {
  const { hasToken, login } = useToken();
  const [currentView, setCurrentView] = useState("recommend");

  const changeView = (view) => {
    setCurrentView(view);
  };

  useEffect(() => {
    //get token from backend
    const getToken = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/spotify/token");
        const data = await response.json();
        if (data.length > 0) {
          const currentTime = new Date();
          const expires = new Date(Date.parse(data[0].expires_in));

          //check to see whether the token has expired
          if (expires < currentTime) {
            const refreshResponse = await fetch(
              "http://127.0.0.1:8000/spotify/refresh-token"
            );
            const refreshData = await refreshResponse.json();
            login(refreshData.access_token, refreshData.expires_in);
          } else {
            login(data[0].access_token, data[0].expires_in);
          }
        } else {
          console.log("No Token");
        }
      } catch (error) {
        console.log(error);
      }
    };

    getToken();
  }, []);

  return (
    <div className="">
      {hasToken && (
        <div className="flex flex-col h-screen">
          <div
            className="flex overflow-hidden "
            style={{ height: "calc(100vh - 96px)" }}
          >
            <Sidebar changeView={changeView} currentView={currentView} />
            <div className="flex-1 m-4 rounded-3xl overflow-hidden">
              {currentView === "recommend" && (
                <Recommend setCurrentView={setCurrentView} />
              )}
              {currentView === "preferences" && <Preferences />}
              {currentView === "playlists" && <Playlists />}
              {currentView === "search" && <Search />}
            </div>
          </div>
          <div className="rounded-t-3xl">
            <MusicController></MusicController>
          </div>
        </div>
      )}
      <div>{!hasToken && <SpotifyLogin />}</div>
    </div>
  );
};

export default App;
