import React, { createContext } from "react";
const AppContext = createContext();

function Context({ children }) {
  const BACKEND_URI = import.meta.env.VITE_API_URL;
  return (
    <AppContext.Provider value={BACKEND_URI}>{children}</AppContext.Provider>
  );
}

export { Context, AppContext };
