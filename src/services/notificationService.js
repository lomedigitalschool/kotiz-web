export const sendNotification = ({ userId, type, data, channels = ["console"] }) => {
  // Message de base
  let message = "";

  // Gestion des types de notification
  switch (type) {

    // la Notif pour le créateur pour   nouvelle contribution
    case "newContribution":
      message = ` Nouvelle contribution de ${data.amount} sur "${data.cagnotteTitle}" par ${data.user || "Anonyme"} !`;
      break;

    case "cagnotteClosed":
      message = `La cagnotte "${data.cagnotteTitle}" a été clôturée !`;
      break;

    // la Notif pour le contributeur résultat paiement
    case "paymentResult":
      if (data.status === "success") {
        message = `✅ Votre paiement de ${data.amount} pour "${data.cagnotteTitle}" a été effectué avec succès !` +
          (data.receiptLink ? ` Reçu disponible ici : ${data.receiptLink}` : "");
      } else {
        message = `❌ Votre paiement de ${data.amount} pour "${data.cagnotteTitle}" a échoué.` +
          (data.retryLink ? ` Réessayez ici : ${data.retryLink}` : "");
      }
      break;


    // Par défaut
    default:
      message = `🔔 Notification [${type}] pour l'utilisateur ${userId}`;
  }

  // Simulation d'envoi selon les canaux
  channels.forEach(channel => {
    switch (channel) {
      case "console":
        console.log(`[NOTIF MOCK][${channel}] pour user ${userId}: ${message}`);
        break;
      case "email":
        console.log(`[EMAIL MOCK] à ${data.userEmail || "user@example.com"}: ${message}`);
        break;
      case "push":
        console.log(`[PUSH MOCK] à user ${userId}: ${message}`);
        break;
      case "sms":
        console.log(`[SMS MOCK] à ${data.userPhone || "+000000000"}: ${message}`);
        break;

      default:
        console.log(`[MOCK UNKNOWN CHANNEL] ${channel}: ${message}`);
    }

  }
  );

};
