import App from "./components/App";
import React from "react";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { TokenProvider } from "./components/TokenContext";
import { SpotifyPlayerProvider } from "./components/SpotifyPlayerContext";

const AppWrapper = () => {
  const appDiv = document.getElementById("app");
  const root = createRoot(appDiv);
  root.render(
    <TokenProvider>
      <SpotifyPlayerProvider>
        <App />
      </SpotifyPlayerProvider>
    </TokenProvider>
  );
};

AppWrapper();
