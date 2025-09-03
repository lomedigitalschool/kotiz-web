import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Donnees mocks
    console.log("Envoi email de réinitialisation pour :", email);
    setMessage("✅ Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.");

    //  appel API réelle
    /*
    api.post("/auth/forgot-password", { email })
      .then(res => setMessage(res.data.message))
      .catch(err => setMessage(err.response?.data?.error || "Erreur"));
    */
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Mot de passe oublié</h2>
        <p className="mb-6 text-gray-600 text-center">
          Entrez votre email ou numéro pour recevoir un lien de réinitialisation.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#4CA260] text-white py-3 rounded-lg font-bold hover:bg-[#3B8E49] transition"
          >
            Envoyer le lien
          </button>
        </form>

        {message && <p className="mt-4 text-[#4CA260]">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;


