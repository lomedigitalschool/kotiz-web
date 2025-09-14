import React, { useState, useEffect } from 'react';
import { isEmailVerified, resendEmailVerification, reloadCurrentUser } from '../services/auth';
import { FaExclamationTriangle, FaCheckCircle, FaEnvelope } from 'react-icons/fa';

const EmailVerificationBanner = () => {
  const [isVerified, setIsVerified] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    checkEmailVerification();
  }, []);

  const checkEmailVerification = async () => {
    try {
      const verified = isEmailVerified();
      setIsVerified(verified);
      setShowBanner(!verified);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      await resendEmailVerification();
      setMessage('Email de vérification renvoyé avec succès ! Vérifiez votre boîte de réception.');
    } catch (error) {
      setMessage(error.message || 'Erreur lors de l\'envoi de l\'email de vérification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsLoading(true);
    try {
      await reloadCurrentUser();
      const verified = isEmailVerified();
      setIsVerified(verified);
      setShowBanner(!verified);

      if (verified) {
        setMessage('Votre email a été vérifié avec succès !');
        setTimeout(() => setShowBanner(false), 3000);
      } else {
        setMessage('Votre email n\'est pas encore vérifié. Vérifiez votre boîte de réception.');
      }
    } catch (error) {
      setMessage('Erreur lors de la vérification. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700">
            <strong>Vérification d'email requise</strong>
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            Pour accéder à toutes les fonctionnalités de KOTIZ, vous devez vérifier votre adresse email.
            Un email de vérification vous a été envoyé lors de votre inscription.
          </p>

          {message && (
            <p className={`text-sm mt-2 ${message.includes('succès') ? 'text-green-700' : 'text-red-700'}`}>
              {message}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex space-x-2">
          <button
            onClick={handleResendVerification}
            disabled={isLoading}
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded-md text-sm font-medium flex items-center disabled:opacity-50"
          >
            <FaEnvelope className="mr-2" />
            {isLoading ? 'Envoi...' : 'Renvoyer'}
          </button>
          <button
            onClick={handleCheckVerification}
            disabled={isLoading}
            className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded-md text-sm font-medium flex items-center disabled:opacity-50"
          >
            <FaCheckCircle className="mr-2" />
            {isLoading ? 'Vérification...' : 'Vérifier'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;