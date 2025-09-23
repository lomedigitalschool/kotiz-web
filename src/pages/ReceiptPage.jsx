import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiDownload, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import QRCode from 'react-qr-code';
import logoHorizontale from '../assets/logos/logo_horizontale.png';

const ReceiptPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Récupérer les données du reçu depuis l'état de navigation
  const receiptData = location.state?.receiptData;

  if (!receiptData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Reçu non trouvé</h2>
          <p className="text-gray-600 mb-6">Les données du reçu ne sont pas disponibles.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#4ca260] text-white px-6 py-3 rounded-lg hover:bg-[#3a8a4a] transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const {
    contribution,
    transaction,
    cagnotteTitle,
    userName,
    contributorEmail,
    contributorPhone
  } = receiptData;

  const handleDownloadPDF = () => {
    // Créer un élément temporaire pour le PDF
    const printContent = document.getElementById('receipt-content');
    const originalDisplay = printContent.style.display;
    printContent.style.display = 'block';

    // Utiliser l'API de navigateur pour imprimer/télécharger
    window.print();

    // Restaurer l'affichage original
    setTimeout(() => {
      printContent.style.display = originalDisplay;
    }, 100);
  };

  const handleDownloadImage = () => {
    try {
      // Créer un canvas temporaire pour capturer le reçu
      const receiptElement = document.getElementById('receipt-content');
      if (!receiptElement) {
        alert('Contenu du reçu non trouvé.');
        return;
      }

      // Utiliser une approche simple : ouvrir dans une nouvelle fenêtre et suggérer la capture d'écran
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Reçu - ${contribution.id}</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                .receipt { max-width: 600px; margin: 0 auto; }
              </style>
            </head>
            <body>
              <div class="receipt">
                ${receiptElement.innerHTML}
              </div>
              <script>
                window.onload = function() {
                  window.print();
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        alert('Veuillez autoriser les popups pour cette fonctionnalité.');
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      alert('Erreur lors du téléchargement. Utilisez le PDF.');
      handleDownloadPDF();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            Retour
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Titre de succès */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <FiCheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Contribution réussie ! 🎉
          </h1>
          <p className="text-gray-600">
            Votre paiement a été traité avec succès. Voici votre reçu.
          </p>
        </div>

        {/* Boutons de téléchargement */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-[#4ca260] text-white px-6 py-3 rounded-lg hover:bg-[#3a8a4a] transition-colors"
          >
            <FiDownload className="w-5 h-5" />
            Télécharger PDF
          </button>
          <button
            onClick={handleDownloadImage}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiDownload className="w-5 h-5" />
            Télécharger Image
          </button>
          <button
            onClick={() => navigate('/transactions')}
            className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Voir mes transactions
          </button>
        </div>

        {/* Contenu du reçu - Visible à l'écran et imprimable */}
        <div id="receipt-content" className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
          {/* En-tête du reçu */}
          <div className="text-center border-b pb-6 mb-6">
            <div className="flex justify-center mb-4">
              <img
                src={logoHorizontale}
                alt="Kotiz Logo"
                className="h-12"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h2 className="text-2xl font-bold text-[#4ca260] mb-2">REÇU DE CONTRIBUTION</h2>
            <p className="text-gray-600">Kotiz - Plateforme de cagnottes digitales</p>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Détails de la contribution</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cagnotte:</span>
                  <span className="font-medium">{cagnotteTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contributeur:</span>
                  <span className="font-medium">{userName}</span>
                </div>
                {contributorEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{contributorEmail}</span>
                  </div>
                )}
                {contributorPhone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Téléphone:</span>
                    <span className="font-medium">{contributorPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(contribution.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Informations de paiement</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant:</span>
                  <span className="font-bold text-lg text-[#4ca260]">
                    {contribution.amount} {contribution.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Méthode:</span>
                  <span className="font-medium">{contribution.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut:</span>
                  <span className="font-medium text-green-600">{contribution.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Référence:</span>
                  <span className="font-medium font-mono text-xs">{contribution.paymentReference}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Message du contributeur */}
          {contribution.message && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Message</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-700 italic">"{contribution.message}"</p>
              </div>
            </div>
          )}

          {/* QR Code et informations supplémentaires */}
          <div className="flex flex-col md:flex-row items-center justify-between border-t pt-6">
            <div className="flex-1">
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>ID Transaction:</strong> {transaction?.id || contribution.id}</p>
                <p><strong>Référence Fournisseur:</strong> {transaction?.providerReference || 'N/A'}</p>
                <p><strong>Statut Transaction:</strong> {transaction?.status || contribution.status}</p>
              </div>
            </div>

            <div className="mt-4 md:mt-0 md:ml-6">
              <div className="bg-white p-2 border rounded-lg inline-block">
                <QRCode
                  value={`${window.location.origin}/cagnotte/${contribution.cagnotteId}`}
                  size={80}
                  level="M"
                />
              </div>
              <p className="text-xs text-center text-gray-500 mt-1">Scanner pour voir la cagnotte</p>
            </div>
          </div>

          {/* Pied de page */}
          <div className="text-center mt-8 pt-6 border-t">
            <p className="text-xs text-gray-500">
              Ce reçu est généré automatiquement par Kotiz.
              Conservez-le pour vos archives.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Reçu généré le {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Message d'aide */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Vous pouvez télécharger ce reçu en PDF ou en image pour vos archives.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            En cas de problème, contactez notre support à support@kotiz.com
          </p>
        </div>
      </div>

      {/* Styles d'impression */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptPage;