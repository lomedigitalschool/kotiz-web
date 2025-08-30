
# 🔧 Guide d'Intégration API Paiement & OTP SMS

Ce guide détaille tous les points d'intégration préparés pour l'API de paiement externe et l'OTP SMS dans l'application Kotiz.

## 📋 Table des matières

1. [Configuration des variables d'environnement](#configuration)
2. [Intégration API de Paiement](#paiement)
3. [Intégration OTP SMS](#otp-sms)
4. [Points d'intégration Backend](#backend)
5. [Points d'intégration Frontend](#frontend)
6. [Tests et validation](#tests)
7. [Déploiement](#deploiement)

---

## 🔧 Configuration des variables d'environnement {#configuration}

### Backend (.env)

Ajoutez ces variables dans `../kotiz-back-init/.env` :

```env
# ===== API DE PAIEMENT EXTERNE =====
PAYMENT_API_BASE_URL=https://api.votre-fournisseur-paiement.com
PAYMENT_API_KEY=your-api-key
PAYMENT_MERCHANT_ID=your-merchant-id
PAYMENT_SECRET_KEY=your-secret-key
PAYMENT_WEBHOOK_URL=https://votre-domaine.com/api/v1/webhooks/payment

# ===== SERVICE SMS/OTP =====
SMS_PROVIDER=orange
SMS_API_KEY=your-sms-api-key
SMS_API_SECRET=your-sms-api-secret
SMS_SENDER_ID=KOTIZ
SMS_USERNAME=your-username
DEFAULT_COUNTRY_CODE=+221

# Twilio (si utilisé)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token

# ===== URLS DE BASE =====
BASE_URL=https://votre-domaine.com
FRONTEND_URL=https://votre-frontend.com
WEBHOOK_SECRET=your-webhook-secret-key
```

### Frontend (.env)

Ajoutez ces variables dans `src/.env` :

```env
# API Backend
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Configuration paiement
VITE_DEFAULT_COUNTRY_CODE=+221
VITE_SUPPORTED_CURRENCIES=XOF,GNF,EUR,USD
VITE_DEFAULT_CURRENCY=XOF

# Configuration OTP
VITE_OTP_LENGTH=6
VITE_OTP_EXPIRY_MINUTES=5
```

---

## 💳 Intégration API de Paiement {#paiement}

### 🔧 Points d'intégration Backend

#### 1. Service de Paiement
**Fichier :** `../kotiz-back-init/src/services/paymentService.js`

**À adapter :**
- `getProviderBaseURL()` : URL de votre fournisseur
- `buildSMSPayload()` : Structure des données selon votre API
- `extractMessageId()` : Extraction de l'ID de transaction
- `validateWebhookSignature()` : Validation selon votre fournisseur

**Exemple d'adaptation pour Orange Money :**
```javascript
// Dans paymentService.js
getProviderBaseURL() {
  return 'https://api.orange.com/orange-money-webpay/dev/v1';
}

buildSMSPayload(phoneNumber, message) {
  return {
    merchant_key: this.merchantId,
    currency: 'OUV',
    order_id: this.generateOrderId(),
    amount: amount,
    return_url: this.returnUrl,
    cancel_url: this.cancelUrl,
    notif_url: this.webhookUrl,
    lang: 'fr',
    reference: reference
  };
}
```

#### 2. Contrôleur de Contribution
**Fichier :** `../kotiz-back-init/src/controllers/contributionController.js`

**Points d'intégration actifs :**
- `exports.create()` : Initiation de paiement lors de contribution
- `exports.handlePaymentWebhook()` : Traitement des notifications de paiement
- `exports.checkContributionStatus()` : Vérification du statut

#### 3. Routes Webhook
**Fichier :** `../kotiz-back-init/src/routes/webhookRoutes.js`

**URL à configurer dans votre fournisseur :**
```
POST https://votre-domaine.com/api/v1/webhooks/payment
```

### 🔧 Points d'intégration Frontend

#### 1. Service de Paiement
**Fichier :** `src/services/paymentService.js`

**Méthodes principales :**
- `initiateContribution()` : Initier une contribution avec paiement
- `checkContributionStatus()` : Vérifier le statut d'une contribution
- `getPaymentMethods()` : Obtenir les méthodes de paiement disponibles

#### 2. Page de Contribution
**Fichier :** `src/pages/ContributePage.jsx`

**À modifier dans la méthode `submitContribution()` :**
```javascript
// Remplacer la simulation par l'appel réel
import paymentService from '../services/paymentService';

const submitContribution = async (data) => {
  setSubmitting(true);
  setSubmitError("");
  
  try {
    // 🔧 POINT D'INTÉGRATION PRINCIPAL
    const result = await paymentService.initiateContribution({
      pullId: cagnotte.id,
      amount: data.amount,
      phoneNumber: data.phoneNumber, // À ajouter au formulaire
      paymentMethod: data.paymentMethod, // À ajouter au formulaire
      message: data.message,
      isAnonymous: data.anonymous
    });

    if (result.success) {
      // Afficher les instructions de paiement
      setPaymentInstructions(result.payment.instructions);
      setPaymentReference(result.payment.reference);
      
      // Démarrer la vérification du statut
      startStatusPolling(result.contribution.id);
    } else {
      setSubmitError(result.error);
    }
  } catch (error) {
    setSubmitError("Erreur lors de l'initiation du paiement");
  } finally {
    setSubmitting(false);
  }
};
```

---

## 📱 Intégration OTP SMS {#otp-sms}

### 🔧 Points d'intégration Backend

#### 1. Service SMS
**Fichier :** `../kotiz-back-init/src/services/smsService.js`

**À adapter selon votre fournisseur :**
- `getProviderBaseURL()` : URL de votre fournisseur SMS
- `getProviderHeaders()` : Headers d'authentification
- `buildSMSPayload()` : Structure des données
- `getSMSEndpoint()` : Endpoint d'envoi

**Exemple d'adaptation pour Orange SMS API :**
```javascript
// Dans smsService.js
getProviderBaseURL() {
  return 'https://api.orange.com/smsmessaging/v1';
}

buildSMSPayload(phoneNumber, message) {
  return {
    outboundSMSMessageRequest: {
      address: [`tel:${phoneNumber}`],
      senderAddress: `tel:${this.senderId}`,
      outboundSMSTextMessage: {
        message: message
      }
    }
  };
}
```

#### 2. Contrôleur d'Authentification
**Fichier :** `../kotiz-back-init/src/controllers/authController.js`

**Nouvelles méthodes avec OTP :**
- `sendRegistrationOTP()` : Envoyer OTP d'inscription
- `register()` : Inscription avec vérification OTP
- `initiateLogin()` : Initier connexion avec OTP
- `login()` : Connexion avec vérification OTP
- `resendOTP()` : Renvoyer un code OTP
- `requestPasswordReset()` : Demander réinitialisation avec OTP
- `resetPassword()` : Réinitialiser avec OTP

### 🔧 Points d'intégration Frontend

#### 1. Service OTP
**Fichier :** `src/services/otpService.js`

**Méthodes principales :**
- `sendRegistrationOTP()` : Envoyer OTP d'inscription
- `verifyRegistrationOTP()` : Vérifier OTP et finaliser inscription
- `initiateLogin()` : Initier connexion avec OTP
- `verifyLoginOTP()` : Vérifier OTP et finaliser connexion

#### 2. Page d'Inscription
**Fichier :** `src/pages/Register.jsx`

**À modifier pour intégrer l'OTP :**
```javascript
// Ajouter un état pour l'OTP
const [otpStep, setOtpStep] = useState(false);
const [otpCode, setOtpCode] = useState('');
const [otpSent, setOtpSent] = useState(false);

// Modifier la soumission du formulaire
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (step === 3 && !otpSent) {
    // Étape 3 : Envoyer OTP
    const otpResult = await otpService.sendRegistrationOTP(form.phone);
    
    if (otpResult.success) {
      setOtpSent(true);
      setOtpStep(true);
    } else {
      alert(otpResult.error);
    }
  } else if (otpStep) {
    // Vérifier OTP et finaliser inscription
    const result = await otpService.verifyRegistrationOTP({
      name: `${form.nom} ${form.prenom}`,
      email: form.email,
      phone: form.phone,
      password: form.password,
      otpCode: otpCode
    });
    
    if (result.success) {
      localStorage.setItem('token', result.token);
      navigate('/dashboard');
    } else {
      alert(result.error);
    }
  }
};
```

#### 3. Page de Connexion
**Fichier :** `src/pages/Login.jsx`

**À modifier pour intégrer l'OTP :**
```javascript
// Ajouter des états pour l'OTP
const [otpStep, setOtpStep] = useState(false);
const [otpCode, setOtpCode] = useState('');
const [userId, setUserId] = useState(null);

// Modifier la soumission
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!otpStep) {
    // Étape 1 : Initier connexion
    const result = await otpService.initiateLogin(form.identifier, form.password);
    
    if (result.success) {
      if (result.requiresOTP) {
        setOtpStep(true);
        setUserId(result.userId);
      } else {
        // Connexion directe
        localStorage.setItem('token', result.token);
        navigate('/dashboard');
      }
    } else {
      alert(result.error);
    }
  } else {
    // Étape 2 : Vérifier OTP
    const result = await otpService.verifyLoginOTP(userId, otpCode);
    
    if (result.success) {
      localStorage.setItem('token', result.token);
      navigate('/dashboard');
    } else {
      alert(result.error);
    }
  }
};
```

---

## 🔧 Points d'intégration Backend {#backend}

### Fichiers créés/modifiés :

1. **Services :**
   - `src/services/paymentService.js` ✅ Créé
   - `src/services/smsService.js` ✅ Créé

2. **Contrôleurs :**
   - `src/controllers/contributionController.js` ✅ Modifié
   - `src/controllers/authController.js` ✅ Modifié

3. **Routes :**
   - `src/routes/webhookRoutes.js` ✅ Créé
   - `src/routes/authRoutes.js` ✅ Modifié
   - `src/routes/contributionRoutes.js` ✅ Modifié
   - `src/server.js` ✅ Modifié

### Nouveaux endpoints disponibles :

#### Authentification avec OTP :
```
POST /api/v1/auth/send-registration-otp
POST /api/v1/auth/register (avec OTP)
POST /api/v1/auth/initiate-login
POST /api/v1/auth/login (avec OTP)
POST /api/v1/auth/resend-otp
POST /api/v1/auth/request-password-reset
POST /api/v1/auth/reset-password
```

#### Contributions avec paiement :
```
POST /api/v1/contributions (avec paiement)
GET /api/v1/contributions/:id/status
```

#### Webhooks :
```
POST /api/v1/webhooks/payment
POST /api/v1/webhooks/sms
```

---

## 🔧 Points d'intégration Frontend {#frontend}

### Fichiers créés :

1. **Services :**
   - `src/services/paymentService.js` ✅ Créé
   - `src/services/otpService.js` ✅ Créé

### Fichiers à modifier :

1. **Pages d'authentification :**
   - `src/pages/Register.jsx` 🔧 À modifier
   - `src/pages/Login.jsx` 🔧 À modifier

2. **Pages de contribution :**
   - `src/pages/ContributePage.jsx` 🔧 À modifier

### Composants à créer (optionnel) :

1. **Composant OTP :**
```javascript
// src/components/OTPInput.jsx
import React, { useState, useRef } from 'react';

const OTPInput = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputRefs = useRef([]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }

    // Call onComplete when all fields are filled
    if (index === length - 1 && element.value) {
      const otpValue = [...otp.slice(0, index), element.value].join('');
      if (otpValue.length === length) {
        onComplete(otpValue);
      }
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          maxLength="1"
          className="w-12 h-12 text-center text-xl border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          value={data}
          onChange={e => handleChange(e.target, index)}
          onFocus={e => e.target.select()}
          ref={el => inputRefs.current[index] = el}
        />
      ))}
    </div>
  );
};

export default OTPInput;
```

2. **Composant Sélecteur de Paiement :**
```javascript
// src/components/PaymentMethodSelector.jsx
import React, { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';

const PaymentMethodSelector = ({ onSelect, selectedMethod }) => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMethods = async () => {
      const result = await paymentService.getPaymentMethods();
      setMethods(result.methods);
      setLoading(false);
    };
    
    loadMethods();
  }, []);

  if (loading) return <div>Chargement des méthodes de paiement...</div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      {methods.map(method => (
        <div
          key={method.id}
          className={`p-4 border-2 rounded-lg cursor-pointer transition ${
            selectedMethod === method.id 
              ? 'border-primary bg-primary/10' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onSelect(method.id)}
        >
          <img src={method.icon} alt={method.name} className="w-8 h-8 mb-2" />
          <h3 className="font-semibold">{method.name}</h3>
          <p className="text-sm text-gray-600">{method.description}</p>
        </div>
      ))}
    </div>
  );
};

export default PaymentMethodSelector;
```

---

## 🧪 Tests et validation {#tests}

### Tests Backend :

1. **Tester l'envoi d'OTP :**
```bash
curl -X POST http://localhost:3000/api/v1/auth/send-registration-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+221701234567"}'
```

2. **Tester l'initiation de paiement :**
```bash
curl -X POST http://localhost:3000/api/v1/contributions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pullId": "cagnotte-id",
    "amount": 5000,
    "phoneNumber": "+221701234567",
    "paymentMethod": "orange_money",
    "message": "Test contribution"
  }'
```

### Tests Frontend :

1. **Tester l'inscription avec OTP :**
   - Aller sur `/register`
   - Remplir le formulaire
   - Vérifier l'envoi d'OTP
   - Saisir le code OTP
   - Vérifier la création du compte

2. **Tester la contribution avec paiement :**
   - Aller sur une page de cagnotte
   - Cliquer sur "Contribuer"
   - Remplir le formulaire avec numéro de téléphone
   - Sélectionner une méthode de paiement
   - Vérifier l'initiation du paiement

---

## 🚀 Déploiement {#deploiement}

### Étapes de déploiement :

1. **Configuration des variables d'environnement en production**
2. **Configuration des webhooks chez vos fournisseurs**
3. **Tests en environnement de staging**
4. **Déploiement en production**
5. **Monitoring des transactions et SMS**

### URLs à configurer chez vos fournisseurs :

- **Webhook paiement :** `https://votre-domaine.com/api/v1/webhooks/payment`
- **Webhook SMS :** `https://votre-domaine.com/api/v1/webhooks/sms`

---

## 📞 Support et maintenance

### Logs à surveiller :

- Erreurs d'envoi SMS
- Échecs de paiement
- Webhooks non traités
- Codes OTP expirés

### Métriques importantes :

- Taux de succès des paiements
- Taux de livraison des SMS
- Temps de réponse des APIs externes
- Nombre de tentatives OTP

---

## ✅ Checklist d'intégration

### Backend :
- [ ] Variables d'environnement configurées
- [ ] Service de paiement adapté à votre fournisseur
- [ ] Service SMS adapté à votre fournisseur
- [ ] Webhooks testés
- [ ] Endpoints OTP testés

### Frontend :
- [ ] Services de paiement et OTP intégrés
- [ ] Pages d'authentification modifiées
- [ ] Page de contribution modifiée
- [ ] Compos