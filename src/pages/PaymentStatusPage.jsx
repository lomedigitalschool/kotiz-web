import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const PaymentStatusPage = () => {
  const { contributionId } = useParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('checking');
  const [contribution, setContribution] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(300); // 5 minutes

  // Vérifier le statut du paiement
  const checkPaymentStatus = async () => {
    try {
      const response = await api.get(`/contributions/${contributionId}/status`);
      
      if (response.data.success) {
        const contributionData = response.data.contribution;
        setContribution(contributionData);
        
        if (contributionData.status === 'completed') {
          setStatus('success');
          // Rediriger vers le dashboard après 3 secondes
          setTimeout(() => {
            navigate('/dashboard', { 
              state: { 
                message: 'Contribution réalisée avec succès !',
                type: 'success'
              }
            });
          }, 3000);
        } else if (contributionData.status === 'failed') {
          setStatus('failed');
        } else {
          setStatus('pending');
        }
      }
    } catch (err) {
      console.error('Erreur lors de la vérification du statut:', err);
      setError('Erreur lors de la vérification du statut');
    }
  };

  // Polling pour vérifier le statut
  useEffect(() => {
    if (!contributionId) return;

    // Vérification initiale
    checkPaymentStatus();

    // Polling toutes les 5 secondes si le paiement est en attente
    const interval = setInterval(() => {
      if (status === 'pending' || status === 'checking') {
        checkPaymentStatus();
      }
    }, 5000);

    // Countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Timeout atteint, rediriger vers le dashboard
          navigate('/dashboard', {
            state: {
              message: 'Délai d\'attente dépassé. Vérifiez vos transactions.',
              type: 'warning'
            }
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, [contributionId, status, navigate]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
      case 'pending':
        return (
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
        );
      case 'success':
        return (
          <div className="rounded-full h-16 w-16 bg-green-100 flex items-center justify-center mx-auto">
            <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        );
      case 'failed':
        return (
          <div className="rounded-full h-16 w-16 bg-red-100 flex items-center justify-center mx-auto">
            <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'checking':
        return {
          title: 'Vérification en cours...',
          message: 'Nous vérifions le statut de votre paiement.',
          color: 'text-blue-600'
        };
      case 'pending':
        return {
          title: 'Paiement en attente',
          message: 'Veuillez finaliser le paiement sur votre téléphone. Un SMS de confirmation vous a été envoyé.',
          color: 'text-orange-600'
        };
      case 'success':
        return {
          title: 'Paiement réussi !',
          message: 'Votre contribution a été enregistrée avec succès. Redirection en cours...',
          color: 'text-green-600'
        };
      case 'failed':
        return {
          title: 'Paiement échoué',
          message: 'Le paiement n\'a pas pu être traité. Veuillez réessayer.',
          color: 'text-red-600'
        };
      default:
        return {
          title: 'Statut inconnu',
          message: 'Impossible de déterminer le statut du paiement.',
          color: 'text-gray-600'
        };
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="rounded-full h-16 w-16 bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        {/* Icône de statut */}
        <div className="mb-6">
          {getStatusIcon()}
        </div>

        {/* Titre et message */}
        <h2 className={`text-xl font-semibold mb-2 ${statusInfo.color}`}>
          {statusInfo.title}
        </h2>
        <p className="text-gray-600 mb-6">
          {statusInfo.message}
        </p>

        {/* Informations de la contribution */}
        {contribution && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 mb-2">Détails de la contribution</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Montant:</span>
                <span className="font-medium">{contribution.amount} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Référence:</span>
                <span className="font-mono text-xs">{contribution.reference}</span>
              </div>
              <div className="flex justify-between">
                <span>Statut:</span>
                <span className={`font-medium ${
                  contribution.status === 'completed' ? 'text-green-600' :
                  contribution.status === 'pending' ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {contribution.status === 'completed' ? 'Complété' :
                   contribution.status === 'pending' ? 'En attente' :
                   'Échoué'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Countdown et actions */}
        {(status === 'pending' || status === 'checking') && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">
              Vérification automatique dans {formatTime(countdown)}
            </p>
            <button
              onClick={checkPaymentStatus}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              Vérifier maintenant
            </button>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="space-y-2">
          {status === 'failed' && (
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
            >
              Réessayer le paiement
            </button>
          )}
          
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full py-2 px-4 rounded-md transition ${
              status === 'failed' 
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {status === 'success' ? 'Aller au tableau de bord' : 'Retour au tableau de bord'}
          </button>
        </div>

        {/* Instructions pour le paiement mobile */}
        {status === 'pending' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
            <h4 className="font-medium text-blue-900 mb-2">Instructions de paiement</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Vérifiez votre téléphone pour le SMS de confirmation</li>
              <li>• Suivez les instructions de votre opérateur mobile</li>
              <li>• Saisissez votre code PIN pour confirmer</li>
              <li>• Le paiement sera automatiquement détecté</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusPage;