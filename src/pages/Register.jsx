import React, { useState, useEffect } from "react";
import vector0 from "../assets/logo.png";
import illustration from "../assets/illustrations/2_Interaction Fintech Sécurisée_simple_compose.png";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useAuthStore } from "../stores/authStore";
import { useCagnotteStore } from "../stores/cagnotteStore";
import PhoneInput from "../components/PhoneInput";
import PasswordInput from "../components/PasswordInput";
import { updateUserPhone } from "../services/api";

export const Register = () => {
  const navigate = useNavigate();
  const { fetchAllCagnottes } = useCagnotteStore();
  const {
    registerWithEmail,
    registerWithPhone,
    verifyCode,
    isLoading,
    error,
    confirmationResult,
    otpStep,
    clearError,
    cleanup
  } = useAuthStore();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    otpCode: "",
    notificationType: "email",
    defaultCurrency: "XOF",
  });
  const [errors, setErrors] = useState({});
  const [showOTPStep, setShowOTPStep] = useState(false);

  // Nettoyer reCAPTCHA quand le composant est démonté
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // Gérer l'affichage de l'étape OTP
  useEffect(() => {
    if (confirmationResult && otpStep === 'register') {
      setShowOTPStep(true);
    }
  }, [confirmationResult, otpStep]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    clearError();
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!form.nom.trim()) newErrors.nom = "Le nom est obligatoire.";
      if (!form.prenom.trim()) newErrors.prenom = "Le prénom est obligatoire.";
      if (!form.email.trim() && !form.phone.trim()) {
        newErrors.email = "Au moins un email ou numéro de téléphone est requis.";
        newErrors.phone = "Au moins un email ou numéro de téléphone est requis.";
      }
      // Validation supplémentaire : si email fourni, mot de passe requis
      if (form.email.trim() && !form.password) {
        newErrors.password = "Un mot de passe est requis pour l'inscription par email.";
      }
    } else if (step === 2) {
      if (!form.password) newErrors.password = "Le mot de passe est obligatoire.";
      if (!form.confirmPassword) newErrors.confirmPassword = "La confirmation du mot de passe est obligatoire.";
      if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };
  
  const prevStep = () => setStep(step - 1);

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.otpCode || form.otpCode.length !== 6) {
      setErrors({ otpCode: "Veuillez saisir un code à 6 chiffres" });
      return;
    }

    try {
      // Vérification spéciale pour le numéro de test
      const formattedPhone = form.phone.replace(/[^\d+]/g, '');
      console.log('📱 Numéro formaté:', formattedPhone);
      console.log('🔢 Code saisi:', form.otpCode);
      
      if ((formattedPhone === '+22899974644' || formattedPhone === '22899974644') && form.otpCode === '974644') {
        console.log('🧪 Vérification code test - création utilisateur temporaire');
        
        // Créer un utilisateur anonyme puis lier le téléphone
        const { signInAnonymously, updateProfile } = await import('firebase/auth');
        const { auth } = await import('../config/firebase');
        
        const displayName = `${form.prenom} ${form.nom}`;
        
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;
        
        // Mettre à jour le profil avec le nom
        await updateProfile(user, { displayName });
        
        // Obtenir le token
        const idToken = await user.getIdToken(true);
        localStorage.setItem('token', idToken);
        localStorage.setItem('isNewUser', 'true');

        // Sauvegarder le numéro de téléphone
        if (form.phone && form.phone.trim()) {
          try {
            await new Promise(resolve => setTimeout(resolve, 500));
            await updateUserPhone(form.phone.trim());
            console.log('Numéro de téléphone sauvegardé:', form.phone);
          } catch (phoneError) {
            console.warn('Erreur sauvegarde téléphone:', phoneError);
          }
        }

        // Nettoyer et recharger
        useCagnotteStore.getState().reset();
        await fetchAllCagnottes();

        alert("🎉 Inscription réussie ! Bienvenue sur KOTIZ !");
        navigate('/dashboard');
        return;
      }
      
      // Pour les autres cas, utiliser la méthode normale
      const user = await verifyCode(form.otpCode);
      
      // Attendre que l'utilisateur soit complètement authentifié
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Obtenir le token Firebase
      const idToken = await user.getIdToken(true); // forcer le refresh
      localStorage.setItem('token', idToken);
      localStorage.setItem('isNewUser', 'true');
      
      console.log('Token sauvegardé:', idToken.substring(0, 20) + '...');

      // Sauvegarder le numéro de téléphone si fourni
      if (form.phone && form.phone.trim()) {
        try {
          // Attendre encore un peu pour que le token soit validé côté serveur
          await new Promise(resolve => setTimeout(resolve, 500));
          await updateUserPhone(form.phone.trim());
          console.log('Numéro de téléphone sauvegardé:', form.phone);
        } catch (phoneError) {
          console.warn('Erreur lors de la sauvegarde du numéro de téléphone:', phoneError);
          // Ne pas bloquer si ça échoue
        }
      }

      // Nettoyer et recharger les données
      useCagnotteStore.getState().reset();
      await fetchAllCagnottes();

      alert("🎉 Inscription réussie ! Bienvenue sur KOTIZ !");
      navigate('/dashboard');

    } catch (error) {
      console.error("Erreur lors de la vérification OTP:", error);
      setErrors({ otpCode: "Code invalide. Veuillez réessayer." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation des champs requis
    if (!form.nom || !form.prenom) {
      alert("Le nom et le prénom sont requis");
      return;
    }

    // Validation email ou téléphone (au moins un des deux)
    if (!form.email && !form.phone) {
      alert("Veuillez fournir un email ou un numéro de téléphone.");
      return;
    }

    try {
      const displayName = `${form.prenom.trim()} ${form.nom.trim()}`;

      // Détecter l'inscription unifiée (email + téléphone + mot de passe)
      const hasEmail = form.email && form.email.trim();
      const hasPhone = form.phone && form.phone.trim();
      const hasPassword = form.password && form.password.trim();

      if (hasEmail && hasPhone && hasPassword) {
        // 🎯 INSCRIPTION UNIFIÉE : Email + Téléphone + Mot de passe
        console.log('🎯 Inscription unifiée: email + téléphone + mot de passe');

        if (form.password !== form.confirmPassword) {
          alert("Les mots de passe ne correspondent pas");
          return;
        }

        // Utiliser une nouvelle méthode d'inscription unifiée
        const result = await registerWithEmailAndPhone(form.email, form.password, displayName, form.phone);

        // Obtenir le token Firebase
        const idToken = await result.user.getIdToken();
        localStorage.setItem('token', idToken);
        localStorage.setItem('isNewUser', 'true');

        // Nettoyer et recharger
        useCagnotteStore.getState().reset();
        await fetchAllCagnottes();

        alert("🎉 Inscription réussie ! Vous pouvez maintenant vous connecter avec votre email ou téléphone.");
        navigate('/dashboard');

      } else if (hasEmail && hasPassword) {
        // Inscription classique avec email
        console.log('📧 Inscription avec email:', form.email);

        if (form.password !== form.confirmPassword) {
          alert("Les mots de passe ne correspondent pas");
          return;
        }

        const result = await registerWithEmail(form.email, form.password, displayName, form.phone);

        const { user } = result;
        const idToken = await user.getIdToken();
        localStorage.setItem('token', idToken);
        localStorage.setItem('isNewUser', 'true');

        // Sauvegarder le numéro de téléphone si fourni
        if (form.phone && form.phone.trim()) {
          try {
            await updateUserPhone(form.phone.trim());
            console.log('Numéro de téléphone sauvegardé:', form.phone);
          } catch (phoneError) {
            console.warn('Erreur lors de la sauvegarde du numéro de téléphone:', phoneError);
          }
        }

        useCagnotteStore.getState().reset();
        await fetchAllCagnottes();

        alert("🎉 Inscription réussie ! Bienvenue sur KOTIZ !");
        navigate('/dashboard');

      } else if (hasPhone) {
        // Inscription avec téléphone OTP
        console.log('📱 Inscription avec téléphone:', form.phone);
        
        // Pour le numéro de test, passer directement à l'OTP
        const formattedPhone = form.phone.replace(/[^\d+]/g, '');
        if (formattedPhone === '+22899974644' || formattedPhone === '22899974644') {
          setShowOTPStep(true);
          return;
        }
        
        await registerWithPhone(form.phone);
        // L'état showOTPStep sera mis à jour par useEffect
        return;
      } else {
        throw new Error("Veuillez renseigner au moins un email ou un numéro de téléphone");
      }

    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      const errorMessage = error.message || "Erreur lors de l'inscription";

      // Messages d'erreur plus clairs
      if (errorMessage.includes("email-already-in-use")) {
        alert("Cet email est déjà associé à un compte existant. Veuillez utiliser un email différent ou vous connecter.");
      } else if (errorMessage.includes("auth/missing-email")) {
        alert("Erreur technique : email manquant. Veuillez réessayer.");
      } else if (errorMessage.includes("auth/invalid-email")) {
        alert("Format d'email invalide. Veuillez vérifier votre email.");
      } else if (errorMessage.includes("auth/weak-password")) {
        alert("Le mot de passe est trop faible. Utilisez au moins 6 caractères.");
      } else {
        alert(errorMessage);
      }
    }
  };

  // Affichage de l'étape OTP
  if (showOTPStep) {
    return (
      <div className="flex flex-col min-h-screen items-center bg-[#f7f9fc]">
        <nav className="flex gap-5 text-sm text-[#00000] font-medium justify-end w-full max-w-6xl px-10 mt-6">
          <FaArrowLeft className="w-5 h-4" onClick={() => setShowOTPStep(false)} style={{ cursor: 'pointer' }}/>
          <a href="/"> Retour à l'accueil</a>
        </nav>

        {/* Container pour reCAPTCHA invisible */}
        <div id="recaptcha-container"></div>

        <main className="flex w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden mt-10">
          <div className="flex-1 p-10">
            <h2 className="text-3xl font-bold text-[#4ca260] mb-4">Vérification OTP</h2>
            <p className="text-gray-600 mb-6">
              Saisissez le code à 6 chiffres envoyé à votre téléphone
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleOTPSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block font-medium text-gray-700">Code OTP <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="otpCode" 
                  required 
                  value={form.otpCode} 
                  onChange={handleChange} 
                  className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none text-center text-2xl tracking-widest" 
                  placeholder="000000"
                  maxLength="6"
                />
                {errors.otpCode && <p className="text-red-500 text-sm mt-1">{errors.otpCode}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#4ca260] text-white font-bold py-3 rounded-lg hover:bg-[#082e11] transition disabled:opacity-50"
              >
                {isLoading ? 'Vérification...' : 'Vérifier le code'}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center bg-[#f7f9fc]">
      <nav className="flex gap-5 text-sm text-[#00000] font-medium justify-end w-full max-w-6xl px-10 mt-6">
        <FaArrowLeft className="w-5 h-4" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}/>
        <a href="/"> Retour à l'accueil</a>
      </nav>

      {/* Container pour reCAPTCHA invisible */}
      <div id="recaptcha-container"></div>
      
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

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {step === 1 && (
              <>
                <h3 className="text-xl font-semibold mb-2">Étape 1: Informations personnelles</h3>
                <div>
                  <label className="block font-medium text-gray-700">Nom <span className="text-red-500">*</span></label>
                  <input type="text" name="nom" required value={form.nom} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none" placeholder="Votre nom" />
                  {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Prénom <span className="text-red-500">*</span></label>
                  <input type="text" name="prenom" required value={form.prenom} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none" placeholder="Votre prénom" />
                  {errors.prenom && <p className="text-red-500 text-sm mt-1">{errors.prenom}</p>}
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#4ac26033] text-gray-700 focus:outline-none" placeholder="Votre email" />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Numéro de téléphone</label>
                  <PhoneInput
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Votre numéro de téléphone"
                    name="phone"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                <button type="button" onClick={nextStep} className="bg-[#4ca260] text-white font-bold py-3 rounded-lg hover:bg-[#082e11] transition">Suivant</button>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="text-xl font-semibold mb-2">Étape 2: Sécurité</h3>
                <div>
                  <label className="block font-medium text-gray-700">Mot de passe <span className="text-red-500">*</span></label>
                  <PasswordInput
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Votre mot de passe"
                    name="password"
                    required
                    showStrength
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Confirmer le mot de passe <span className="text-red-500">*</span></label>
                  <PasswordInput
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirmez votre mot de passe"
                    name="confirmPassword"
                    required
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
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
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-[#4ca260] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#082e11] transition disabled:opacity-50"
                  >
                    {isLoading ? 'Inscription...' : 'S\'inscrire'}
                  </button>
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