import React, { useState } from 'react';

// Hook personnalisé pour gérer les notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, title, message, duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      type,
      title,
      message,
      duration
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-suppression après la durée
    setTimeout(() => {
      removeNotification(id);
    }, duration);

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const showSuccess = (title, message, duration) => {
    return addNotification('success', title, message, duration);
  };

  const showError = (title, message, duration) => {
    return addNotification('error', title, message, duration);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError
  };
};

// Composant NotificationManager
const NotificationManager = ({ notifications, onRemove }) => {
  const [exitingNotifications, setExitingNotifications] = useState(new Set());

  const handleClose = (id) => {
    setExitingNotifications(prev => new Set([...prev, id]));

    // Attendre la fin de l'animation avant de supprimer
    setTimeout(() => {
      onRemove(id);
      setExitingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300);
  };

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`
            bg-white border rounded-lg shadow-lg p-4 flex items-start justify-between cursor-pointer
            transition-all duration-300 transform
            ${notification.type === 'success'
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
            }
            ${exitingNotifications.has(notification.id)
              ? 'translate-x-full opacity-0'
              : 'translate-x-0 opacity-100'
            }
            hover:shadow-xl
          `}
          onClick={() => handleClose(notification.id)}
        >
          {/* Icône */}
          <div className={`
            flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3
            ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
          `}>
            {notification.type === 'success' ? '✓' : '✕'}
          </div>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm">
              {notification.title}
            </div>
            <div className="text-gray-600 text-xs mt-1">
              {notification.message}
            </div>
          </div>

          {/* Bouton de fermeture */}
          <button
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              handleClose(notification.id);
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

// Contexte pour les notifications globales
export const NotificationContext = React.createContext();

// Provider de notifications
export const NotificationProvider = ({ children }) => {
  const notificationLogic = useNotifications();

  return (
    <NotificationContext.Provider value={notificationLogic}>
      {children}
      <NotificationManager
        notifications={notificationLogic.notifications}
        onRemove={notificationLogic.removeNotification}
      />
    </NotificationContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useNotificationContext = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext doit être utilisé dans un NotificationProvider');
  }
  return context;
};

export default NotificationManager;