import { useState } from "react";

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const notify = (message, type = "info", duration = 5000) => {
    const id = Date.now();
    const newNotification = { id, message, type };
    setNotifications(prev => [...prev, newNotification]);

    // Supprimer la notification après 'duration' millisecondes
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  };

  return { notifications, notify };
};
