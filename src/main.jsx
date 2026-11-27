import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/theme.css";
import App from "./App.jsx";
import { Context } from "./context/AppContext.jsx";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Pricing from "./styles/pages/Pricing.jsx";
import Layout from "./Layout.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}></Route>
      <Route path="/pricing" element={<Pricing />}></Route>
    </Routes>
  </BrowserRouter>,
);
