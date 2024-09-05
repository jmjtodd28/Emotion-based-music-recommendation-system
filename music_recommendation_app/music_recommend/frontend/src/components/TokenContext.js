import { createContext, useContext, useState, useEffect } from "react";
import React from "react";

const TokenContext = createContext();

export const TokenProvider = ({ children }) => {
  const [hasToken, setHasToken] = useState(false);
  const [token, setToken] = useState(null);
  const [expireTime, setExpireTime] = useState(new Date());
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (token !== null) {
      fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          setUsername(data.id);
        })
        .catch((error) => console.log(error));
    }
  }, [token]);

  const login = (newToken, newExpire) => {
    setToken(newToken);
    setHasToken(true);
    setExpireTime(newExpire);
  };

  const logout = () => {
    setHasToken(false);
    setToken(null);
    fetch("spotify/logout").catch((error) => console.log(error));
  };

  const checkExpire = async () => {
    try {
      const currentTime = new Date();
      const expires = new Date(Date.parse(expireTime));

      if (expires < currentTime) {
        const response = await fetch(
          "http://127.0.0.1:8000/spotify/refresh-token"
        );
        const data = await response.json();
        login(data.access_token, data.expires_in);
        setToken(data.access_token);
        return data.access_token;
      } else {
        return token;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <TokenContext.Provider
      value={{
        token,
        hasToken,
        expireTime,
        login,
        logout,
        username,
        checkExpire,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => {
  return useContext(TokenContext);
};
