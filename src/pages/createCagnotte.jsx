import React, { useState } from "react";
import vector0 from "../assets/logo.png";
import illustration from "../assets/illustrations/_Cagnotte Digitale Amicale_simple_compose.png";

const CreerCagnotte = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    description: "",
    goalAmount: "",
    currency: "XOF",
    deadline: "",
    type: "public",
    participantLimit: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setForm({ ...form, image: null });
    setPreview(null);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      ...form,
      participantLimit: form.participantLimit ? parseInt(form.participantLimit, 10) : null,
    };
    console.log("Données de la cagnotte :", formData);
    // Ici, vous enverriez formData au backend
    alert("🎉 Cagnotte créée avec succès !");
  };

  return (
    <div className="flex flex-col min-h-screen items-center bg-[#f7f9fc]">
      {/* Header */}
      <header className="w-full border-b border-[#e5e8ea] flex items-center justify-between px-10 py-4 bg-white">
        <div className="flex items-center gap-3">
          <img src={vector0} alt="Logo" className="w-6 h-6" />
          <h1 className="font-bold text-lg text-[#4AC260]">KOTIZ</h1>
        </div>
        <nav className="flex gap-6 text-sm text-[#4ac260] font-medium">
          <a href="/">Accueil</a>
          <a href="/explorePage">Explorer</a>
          <a href="/profil">Profil</a>
        </nav>
      </header>

      <main className="flex w-full max-w-6xl bg-white rounded-2xl shadow-lg mt-10 overflow-hidden">
        {/* Illustration gauche */}
        <div className="hidden md:flex flex-1 bg-[#f7f9fc] items-center justify-center p-0">
          <img src={illustration} alt="Créer une cagnotte" className="w-3/4" />
        </div>

        {/* Formulaire droite */}
        <div className="flex-1 p-10">
          <h2 className="text-3xl font-bold text-[#4ca260] mb-4">Créer une cagnotte 💰</h2>
          <p className="text-gray-600 mb-6">
            Lancez votre collecte en quelques étapes simples.
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div className="bg-[#4ca260] h-2.5 rounded-full" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {step === 1 && (
              <>
                <h3 className="text-xl font-semibold mb-2">Étape 1: Informations de base</h3>
                <div>
                  <label className="block font-medium text-gray-700">Nom de la cagnotte <span className="text-red-500">*</span></label>
                  <input type="text" name="title" required value={form.title} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none" placeholder="Ex: Anniversaire de Marie" />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
                  <textarea name="description" required value={form.description} onChange={handleChange} rows={4} className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none" placeholder="Expliquez l'objectif de votre cagnotte..."></textarea>
                </div>
                <button type="button" onClick={nextStep} className="bg-[#4ca260] text-white font-bold py-3 rounded-lg hover:bg-[#082e11] transition">Suivant</button>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="text-xl font-semibold mb-2">Étape 2: Montant et durée</h3>
                <div>
                  <label className="block font-medium text-gray-700">Montant cible <span className="text-red-500">*</span></label>
                  <input type="number" name="goalAmount" required value={form.goalAmount} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none" placeholder="Entrez le montant à collecter" />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Devise</label>
                  <select name="currency" value={form.currency} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none">
                    <option value="XOF">FCFA (Franc CFA)</option>
                    <option value="GNF">GNF (Franc Guinéen)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Date de clôture</label>
                  <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none" />
                </div>
                <div className="flex justify-between">
                  <button type="button" onClick={prevStep} className="bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition">Précédent</button>
                  <button type="button" onClick={nextStep} className="bg-[#4ca260] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#082e11] transition">Suivant</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h3 className="text-xl font-semibold mb-2">Étape 3: Options avancées</h3>
                <div>
                  <label className="block font-medium text-gray-700">Type de cagnotte <span className="text-red-500">*</span></label>
                  <select name="type" value={form.type} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none">
                    <option value="public">Publique</option>
                    <option value="private">Privée</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Limite de participants (optionnel)</label>
                  <input type="number" name="participantLimit" value={form.participantLimit} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none" placeholder="Ex: 50" />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Image de la cagnotte</label>
                  {preview ? (
                    <div className="mt-2 relative">
                      <img src={preview} alt="Aperçu" className="w-full h-40 object-cover rounded-xl" />
                      <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600">X</button>
                    </div>
                  ) : (
                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full p-2 border border-dashed rounded-lg" />
                  )}
                </div>
                <div className="flex justify-between">
                  <button type="button" onClick={prevStep} className="bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition">Précédent</button>
                  <button type="submit" className="bg-[#4ca260] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#082e11] transition">🚀 Lancer la cagnotte</button>
                </div>
              </>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreerCagnotte;
