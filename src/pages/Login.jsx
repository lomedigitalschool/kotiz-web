import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier
} from "firebase/auth";
import { auth } from "../config/firebase";
import { FaArrowLeft } from "react-icons/fa";
import { useCagnotteStore } from "../stores/cagnotteStore";

export const Login = () => {
  const navigate = useNavigate();
  const { fetchAllCagnottes } = useCagnotteStore();

  // États du formulaire
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [remember, setRemember] = useState(false);

  // États d'interface
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: identifiant, 2: OTP (pour téléphone)
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);

  // Initialiser reCAPTCHA au montage du composant
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: (response) => {
            console.log('reCAPTCHA réussi');
          },
          'expired-callback': () => {
            console.warn('reCAPTCHA expiré');
            setError('reCAPTCHA expiré. Veuillez réessayer.');
          }
        });
      } catch (error) {
        console.error('Erreur initialisation reCAPTCHA:', error);
      }
    }

    return () => {
      // Nettoyer reCAPTCHA à la destruction du composant
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.warn('Erreur nettoyage reCAPTCHA:', e);
        }
      }
    };
  }, []);

  // Détecter si l'identifiant est un email ou un numéro de téléphone
  const detectLoginType = (value) => {
    return value.includes('@') ? 'email' : 'phone';
  };

  // Formater le numéro de téléphone au format E.164
  const formatPhoneNumber = (phone) => {
    // Supprimer tous les espaces et caractères non numériques sauf +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Si ça commence par un chiffre sans +, ajouter +
    if (cleaned.match(/^\d/)) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  };

  // Gestionnaire de soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (step === 1) {
        // Étape 1: Traitement de l'identifiant
        await handleIdentifierSubmit();
      } else {
        // Étape 2: Vérification de l'OTP
        await handleOTPSubmit();
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      console.error('Code erreur:', error.code);
      console.error('Message erreur:', error.message);
      console.error('Stack trace:', error.stack);
      setError(getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Étape 1: Traitement de l'identifiant (email ou téléphone)
  const handleIdentifierSubmit = async () => {
    if (!identifier.trim()) {
      setError("Veuillez saisir votre email ou numéro de téléphone");
      return;
    }

    const loginType = detectLoginType(identifier);

    if (loginType === 'email') {
      // Connexion par email
      if (!password) {
        setError("Le mot de passe est requis pour la connexion par email");
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
      await handleSuccessfulLogin(userCredential.user);

    } else {
      // Connexion par téléphone - envoyer OTP
      const formattedPhone = formatPhoneNumber(identifier);

      // Validation basique du numéro
      if (!formattedPhone.match(/^\+[1-9]\d{1,14}$/)) {
        setError("Format de numéro de téléphone invalide. Utilisez le format international (+225...)");
        return;
      }

      setIsPhoneLogin(true);

      // Envoyer l'OTP
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep(2); // Passer à l'étape 2
    }
  };

  // Étape 2: Vérification de l'OTP
  const handleOTPSubmit = async () => {
    if (!otpCode.trim()) {
      setError("Veuillez saisir le code OTP");
      return;
    }

    if (!confirmationResult) {
      setError("Session OTP expirée. Veuillez recommencer.");
      setStep(1);
      return;
    }

    const userCredential = await confirmationResult.confirm(otpCode);
    await handleSuccessfulLogin(userCredential.user);
  };

  // Gestion d'une connexion réussie
  const handleSuccessfulLogin = async (user) => {
    try {
      console.log('🎉 Connexion réussie, utilisateur:', user.uid);

      // Attendre un peu pour s'assurer que Firebase a bien mis à jour la session
      await new Promise(resolve => setTimeout(resolve, 500));

      // Obtenir le token Firebase (forcer un refresh pour s'assurer qu'il est frais)
      console.log('🔑 Récupération du token Firebase...');
      const idToken = await user.getIdToken(true);
      console.log('✅ Token Firebase obtenu, longueur:', idToken.length);

      // Stocker le token de manière fiable
      localStorage.setItem('token', idToken);
      console.log('💾 Token stocké dans localStorage');

      // Vérifier que le token est bien stocké
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        console.log('✅ Vérification: Token bien stocké');
      } else {
        console.error('❌ Erreur: Token non stocké');
      }

      // Stocker la préférence "se souvenir de moi"
      if (remember) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Attendre encore un peu pour la synchronisation
      await new Promise(resolve => setTimeout(resolve, 300));

      // Recharger les données utilisateur
      console.log('🔄 Chargement des données utilisateur...');
      await fetchAllCagnottes();

      // Rediriger vers le dashboard
      console.log('🚀 Redirection vers le dashboard...');
      navigate('/dashboard');

    } catch (error) {
      console.error('❌ Erreur après connexion:', error);
      setError("Erreur lors de la finalisation de la connexion");
    }
  };

  // Convertir les erreurs Firebase en messages utilisateur
  const getFirebaseErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'Aucun compte trouvé avec ces identifiants';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/invalid-email':
        return 'Format d\'email invalide';
      case 'auth/user-disabled':
        return 'Ce compte a été désactivé';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Veuillez réessayer plus tard';
      case 'auth/invalid-verification-code':
        return 'Code OTP invalide';
      case 'auth/code-expired':
        return 'Code OTP expiré. Veuillez recommencer';
      case 'auth/invalid-phone-number':
        return 'Numéro de téléphone invalide';
      case 'auth/missing-recaptcha-token':
        return 'Erreur de vérification reCAPTCHA';
      default:
        return error.message || 'Erreur de connexion inattendue';
    }
  };

  // Recommencer depuis le début
  const handleRestart = () => {
    setStep(1);
    setOtpCode("");
    setConfirmationResult(null);
    setIsPhoneLogin(false);
    setError("");
  };

  return (
    <div className="flex flex-col min-h-screen items-center bg-[#f7f9fc]">

      {/* Navigation */}
      <nav className="flex gap-1 text-sm text-[#3B5BAB] font-medium justify-center w-full max-w-6xl px-5 mt-6">
        <FaArrowLeft className="w-5 h-4" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}/>
        <a href="/"> Retour à l'accueil</a>
      </nav>

      {/* Formulaire */}
      <main className="w-full max-w-md bg-white rounded-xl shadow-md p-8 mt-16">
        <h2 className="text-2xl font-bold text-center mb-6">
          {step === 1 ? 'Welcome back' : 'Vérification OTP'}
        </h2>

        {/* Affichage des erreurs */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {step === 1 ? (
            <>
              {/* Étape 1: Email/Téléphone */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Email ou Numéro de téléphone
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4ca260]"
                  placeholder="votre@email.com ou +22501020304"
                  disabled={loading}
                />
              </div>

              {/* Mot de passe (uniquement pour email) */}
              {detectLoginType(identifier) === 'email' && (
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Mot de passe</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4ca260]"
                    placeholder="Votre mot de passe"
                    disabled={loading}
                  />
                </div>
              )}

              {/* Options */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 border-gray-300 rounded"
                    disabled={loading}
                  />
                  Se souvenir de moi
                </label>
                <a href="/forgot-password" className="text-[#0a38c1]">
                  Mot de passe oublié ?
                </a>
              </div>
            </>
          ) : (
            <>
              {/* Étape 2: Code OTP */}
              <div className="text-center mb-4">
                <p className="text-gray-600 mb-2">
                  Un code de vérification a été envoyé à
                </p>
                <p className="font-semibold text-gray-800">{identifier}</p>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Code de vérification (6 chiffres)
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4ca260] text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                  maxLength="6"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="flex-1 bg-gray-500 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition"
                  disabled={loading}
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#4ca260] text-white font-bold py-3 rounded-lg hover:bg-[#082e11] transition"
                  disabled={loading || otpCode.length !== 6}
                >
                  {loading ? 'Vérification...' : 'Vérifier'}
                </button>
              </div>
            </>
          )}

          {/* Bouton principal (étape 1 uniquement) */}
          {step === 1 && (
            <button
              type="submit"
              className="bg-[#4ca260] text-white font-bold py-3 rounded-lg hover:bg-[#082e11] transition disabled:opacity-50"
              disabled={loading || !identifier.trim()}
            >
              {loading ? 'Connexion...' : detectLoginType(identifier) === 'email' ? 'Se connecter' : 'Envoyer le code'}
            </button>
          )}
        </form>

        {/* Informations supplémentaires */}
        {step === 1 && (
          <div className="text-center text-sm text-gray-500 mt-4">
            <p className="mb-2">
              {detectLoginType(identifier) === 'email'
                ? 'Connexion par email et mot de passe'
                : 'Connexion par numéro de téléphone avec code OTP'
              }
            </p>
            <p>
              Pas encore de compte ?{" "}
              <a href="/register" className="text-[#4ca260] font-medium">
                Créer un compte
              </a>
            </p>
          </div>
        )}

        {/* Conteneur reCAPTCHA (invisible) */}
        <div id="recaptcha-container"></div>
      </main>
    </div>
  );
};
