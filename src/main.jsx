import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx"; 
import "./index.css";

// Simuler un utilisateur connecté
if (!localStorage.getItem("token")) {
  localStorage.setItem("token", "mock-token");
  localStorage.setItem(
    "user",
    JSON.stringify({ id: 1, name: "Sylvie", email: "sylvie@example.com" })
  );
}


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

