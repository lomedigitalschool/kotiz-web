import React from 'react';
import { useNotification } from '../hooks/useNotification';

export const NotificationProvider = ({ children }) => {
  const { notifications, notify } = useNotification();

  // Fonction globale pour les notifications (disponible partout)
  React.useEffect(() => {
    window.notify = notify;
  }, [notify]);

  return (
    <>
      {children}

      {/* Conteneur des notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`max-w-sm p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${
              notification.type === 'success'
                ? 'bg-green-500 text-white'
                : notification.type === 'error'
                ? 'bg-red-500 text-white'
                : notification.type === 'warning'
                ? 'bg-yellow-500 text-black'
                : 'bg-blue-500 text-white'
            }`}
          >
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default NotificationProvider;