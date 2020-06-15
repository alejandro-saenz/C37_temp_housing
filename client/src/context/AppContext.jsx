import React, { useState, useEffect, createContext } from 'react';
import axios from 'axios';

const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);

  const token = localStorage.getItem('toekn');

  useEffect(() => {
    if (token) {
      axios
        .get('/users/me', { headers: { Authorizatoin: `Bearer ${token}` } })
        .then(({ data }) => {
          console.log(data);
          setUser(data);
          setLoggedIn(true);
        })
        .catch((e) => console.log(e.message.toString()));
    }
  }, [token]);

  return (
    <AppContext.Provider value={{ user, setUser, loggedIn, setLoggedIn }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };
