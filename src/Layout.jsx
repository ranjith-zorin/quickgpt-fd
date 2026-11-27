import React from "react";
import { Context } from "./context/AppContext";
import { Toaster } from "react-hot-toast";
import App from "./App";

function Layout() {
  return (
    <Context>
      <Toaster position="top-center" reverseOrder={false} />
      <App />
    </Context>
  );
}

export default Layout;
