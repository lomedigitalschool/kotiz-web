import React, { useState } from "react";
import vector0 from "../assets/logo.png";
import illustration from "../assets/illustrations/2_Interaction Fintech Sécurisée_simple_compose.png";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    notificationType: "email",
    defaultCurrency: "XOF",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!form.email && !form.phone) {
      alert("Veuillez fournir un email ou un numéro de téléphone.");
      return;
    }
    const userData = {
      name: `${form.nom} ${form.prenom}`,
      email: form.email,
      phone: form.phone,
      password: form.password,
      preferences: {
        notificationType: form.notificationType,
        defaultCurrency: form.defaultCurrency,
      },
    };
    console.log("Données envoyées au backend :", userData);
    // ⚡ Ici tu pourras appeler ton backend (API Kotiz) avec userData
  };

  return (
    <div className="flex flex-col min-h-screen items-center bg-[#f7f9fc]">

       <nav className="flex gap-5 text-sm text-[#00000] font-medium justify-end w-full max-w-6xl px-10 mt-6">

           <FaArrowLeft className="w-5 h-4" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}/>
          <a href="/"> Retour à l'accueil</a>
          
        </nav>
      <main className="flex w-full max-w-6xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Illustration gauche */}
        <div className="hidden md:flex flex-1 bg-[#f7f9fc] items-center justify-center p-8">
          <img src={illustration} alt="Inscription" className="w-3/4" />
        </div>
         
        {/* Formulaire droite */}
        
        <div className="flex-1 p-10">
          <h2 className="text-3xl font-bold text-[#4ca260] mb-4">Créer un compte</h2>
          <p className="text-gray-600 mb-6">
            Rejoignez <span className="font-semibold">KOTIZ</span> et commencez à collecter en toute simplicité
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div className="bg-[#4ca260] h-2.5 rounded-full" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {step === 1 && (
              <>
                <h3 className="text-xl font-semibold mb-2">Étape 1: Informations personnelles</h3>
                <div>
                  <label className="block font-medium text-gray-700">Nom <span className="text-red-500">*</span></label>
                  <input type="text" name="nom" required value={form.nom} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none" placeholder="Votre nom" />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Prénom <span className="text-red-500">*</span></label>
                  <input type="text" name="prenom" required value={form.prenom} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none" placeholder="Votre prénom" />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none" placeholder="Votre email" />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Numéro de téléphone</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none" placeholder="Votre numéro de téléphone" />
                </div>
                <button type="button" onClick={nextStep} className="bg-[#4ca260] text-white font-bold py-3 rounded-lg hover:bg-[#082e11] transition">Suivant</button>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="text-xl font-semibold mb-2">Étape 2: Sécurité</h3>
                <div>
                  <label className="block font-medium text-gray-700">Mot de passe <span className="text-red-500">*</span></label>
                  <input type="password" name="password" required value={form.password} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none" placeholder="Votre mot de passe" />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Confirmer le mot de passe <span className="text-red-500">*</span></label>
                  <input type="password" name="confirmPassword" required value={form.confirmPassword} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none" placeholder="Confirmez votre mot de passe" />
                </div>
                <div className="flex justify-between">
                  <button type="button" onClick={prevStep} className="bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition">Précédent</button>
                  <button type="button" onClick={nextStep} className="bg-[#4ca260] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#082e11] transition">Suivant</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h3 className="text-xl font-semibold mb-2">Étape 3: Préférences</h3>
                <div>
                  <label className="block font-medium text-gray-700">Notifications par</label>
                  <select name="notificationType" value={form.notificationType} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none">
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Devise par défaut</label>
                  <select name="defaultCurrency" value={form.defaultCurrency} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none">
                    <option value="XOF">FCFA (Franc CFA)</option>
                    <option value="GNF">GNF (Franc Guinéen)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <div className="flex justify-between">
                  <button type="button" onClick={prevStep} className="bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition">Précédent</button>
                  <button type="submit" className="bg-[#4ca260] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#082e11] transition">S’inscrire</button>
                </div>
              </>
            )}
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Vous avez déjà un compte ?{" "}
            <a href="/login" className="text-[#3B5BAB] font-medium">
              Se connecter
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
