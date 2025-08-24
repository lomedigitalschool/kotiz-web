// Page de connexion
import React, { useState } from "react";
import vector0 from "../assets/logo.png";
import { FaArrowLeft } from "react-icons/fa";

export const Login = () => {
  const [form, setForm] = useState({
    identifier: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulaire de connexion :", form);
    // ⚡ Ici tu pourras appeler ton backend (API Kotiz)
  };

  return (
    <div className="flex flex-col min-h-screen items-center bg-[#f7f9fc]">

       <nav className="flex gap-1 text-sm text-[#3B5BAB] font-medium justify-center w-full max-w-6xl px-5 mt-6">

        <FaArrowLeft className="w-5 h-4" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}/>
          <a href="/"> Retour à l'accueil</a>
                 
       </nav>
      {/* Formulaire */}
      <main className="w-full max-w-md bg-white rounded-xl shadow-md p-8 mt-16">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome back</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email or Phone */}
          <div>
            <label className="block font-medium text-gray-700">Email ou Numéro de téléphone</label>
            <input
              type="text"
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none"
              placeholder="Entrez votre email ou numéro de téléphone"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none"
              placeholder="Entrez votre mot de passe"
            />
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="w-4 h-4 border-gray-300 rounded"
              />
              Se souvenir de moi
            </label>
            <a href="/forgot-password" className="text-[#0a38c1]">
              Mot de passe oublié ?
            </a>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            className="bg-[#4ca260] text-white font-bold py-3 rounded-lg hover:bg-[#082e11] transition"
          >
            Se connecter
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Pas encore de compte ?{" "}
          <a href="/register" className="text-[#4ca260] font-medium">
            Créer un compte
          </a>
        </p>
      </main>
    </div>
  );
};
// Export the component
