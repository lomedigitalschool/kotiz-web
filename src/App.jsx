import React from "react";
import LandingPage from "./pages/LandingPage";

import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import CreerCagnotte from "./pages/createCagnotte"; 
import ProfilPage  from "./pages/profilPage";
import ExplorePage from "./pages/explorePage";
import CagnotteDetails from "./pages/CagnotteDetails";
import ContributorsPage from "./pages/ContributorsPage";
import { Routes, Route, Navigate } from "react-router-dom";



/**
 * Point d'entre de l'application React
 * 
 * Cette fonctionnalit  gère les routes de l'application avec React Router.
 * 
 * Les routes sont:
 * - "/" : redirection vers "/landing"
 * - "/home" : page d'accueil
 * - "/landing" : page de d marrage
 * - "/login" : page de connexion
 * - "/register" : page d'inscription
 * - "/create-cagnotte" : page de cr ation de cagnotte
 * - "/profil" : page de profil
 * - "/e"
 */

export default function App() {
  return (
    
        <Routes>
          <Route path="/" element={<Navigate to="/landing" />} />
        
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-cagnotte" element={<CreerCagnotte />} />
          <Route path="/profil" element={<ProfilPage />} />
          <Route path="/explorePage" element={<ExplorePage />} />
          <Route path="/cagnotte/:id" element={<CagnotteDetails />} />
          <Route path="/contributors" element={<ContributorsPage />} />
        </Routes>
      
  );
}
