import React from "react";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import {Login} from "./pages/Login";
import CreerCagnotte from "./pages/createCagnotte"; 
import ProfilPage  from "./pages/profilPage";
import ExplorePage from "./pages/explorePage";
import CagnotteDetails from "./pages/CagnotteDetails";
import ContributorsPage from "./pages/ContributorsPage";
import { Routes, Route, Navigate } from "react-router-dom";
import ContributePage from "./pages/ContributePage";
import Dashboard from "./pages/Dashboard";
import EditCagnotte from "./pages/EditCagnotte";





/**
 * Point d'entrée de l'application React
 * 
 * Cette fonctionnalité gère les routes de l'application avec React Router.
 * 
 * Les routes sont:
 * - "/" : redirection vers "/landing"
 * - "/home" : page d'accueil
 * - "/landing" : page de démarrage
 * - "/login" : page de connexion
 * - "/register" : page d'inscription
 * - "/create-cagnotte" : page de création de cagnotte
 * - "/profil" : page de profil
 * - "/explorePage" : page d'exploration
 * - "/cagnotte/:id" : détails d'une cagnotte
 * - "/contributors" : page des contributeurs
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
      <Route path="/cagnottes/:id" element={<CagnotteDetails />} />
      <Route path="/contribute/:id" element={<ContributePage />} /> {/* <-- AJOUT */}
      <Route path="/contributors/:id" element={<ContributorsPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/edit-cagnotte/:id" element={<EditCagnotte />} />

    </Routes>
  );
}
