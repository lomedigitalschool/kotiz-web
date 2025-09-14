import React, { useState, useEffect } from "react";
import vector0 from "../assets/logo.png";
import illustration from "../assets/illustrations/2_Interaction Fintech Sécurisée_simple_compose.png";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useAuthStore } from "../stores/authStore";
import { useCagnotteStore } from "../stores/cagnotteStore";
import PhoneInput from "../components/PhoneInput";
import PasswordInput from "../components/PasswordInput";

export const Register = () => {
  const navigate = useNavigate();
  const { fetchAllCagnottes } = useCagnotteStore();
  const {
    registerWithEmail,
    registerWithPhone,
    confirmPhoneRegistration,
    isLoading,
    error,
    otpStep,
    clearError
  } = useAuthStore();

  const [step, setStep] = useState(1);
  const [registrationType, setRegistrationType] = useState('email'); // 'email' ou 'phone'
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

  // Initialiser reCAPTCHA pour l'inscription téléphone
  useEffect(() => {
    if (registrationType === 'phone' && !window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
          size: 'invisible',
          callback: () => console.log('✅ reCAPTCHA réussi'),
          'expired-callback': () => console.warn('⚠️ reCAPTCHA expiré')
        });
      } catch (error) {
        console.error('❌ Erreur initialisation reCAPTCHA:', error);
      }
    }
  }, [registrationType]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error for the field being changed
    setErrors({ ...errors, [e.target.name]: "" });
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

      let result;

      // ✅ Vérifier le type d'inscription et appeler la bonne méthode
      if (form.email && form.email.trim()) {
        // Inscription avec email et mot de passe
        if (!form.password) {
          alert("Le mot de passe est requis pour l'inscription par email");
          return;
        }

        if (form.password !== form.confirmPassword) {
          alert("Les mots de passe ne correspondent pas");
          return;
        }

        console.log('📧 Inscription avec email:', form.email);
        result = await registerWithEmail(form.email, form.password, displayName, form.phone);

      } else if (form.phone && form.phone.trim()) {
        // Inscription avec téléphone OTP
        console.log('📱 Inscription avec téléphone:', form.phone);
        result = await registerWithPhone(form.phone, displayName);
        // Pour le téléphone, on passe à l'étape OTP
        setStep(3);
        return;
      } else {
        throw new Error("Veuillez renseigner au moins un email ou un numéro de téléphone");
      }

      // Traitement après inscription réussie (pour email uniquement)
      const { user } = result;

      // Obtenir le token Firebase mis à jour
      const idToken = await user.getIdToken();

      // Stocker le token Firebase dans localStorage
      localStorage.setItem('token', idToken);
      localStorage.setItem('isNewUser', 'true'); // Marquer comme nouvel utilisateur

      // ✅ Sauvegarder le numéro de téléphone en base de données si fourni
      if (form.phone && form.phone.trim()) {
        try {
          await updateUserPhone(form.phone.trim());
          console.log('Numéro de téléphone sauvegardé:', form.phone);
        } catch (phoneError) {
          console.warn('Erreur lors de la sauvegarde du numéro de téléphone:', phoneError);
          // Ne pas bloquer l'inscription si la sauvegarde du téléphone échoue
        }
      }

      // ✅ Nettoyer complètement le store avant de charger les nouvelles données
      useCagnotteStore.getState().reset();

      // ✅ Forcer le rechargement des données du nouvel utilisateur
      await fetchAllCagnottes();

      // Afficher message de succès
      alert("🎉 Inscription réussie ! Bienvenue sur KOTIZ !");
      // Rediriger vers le tableau de bord
      navigate('/dashboard');

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
