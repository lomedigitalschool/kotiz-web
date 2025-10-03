import React, { useEffect, useState } from "react";
import { useCagnotteStore } from "../stores/cagnotteStore";
import { colors } from "../theme/colors";
import { FaBell, FaCheck, FaFilter } from "react-icons/fa";
import { useSilentRefresh } from "../hooks/useSilentRefresh";

export default function NotificationsPage() {
  const { notifications, markAsRead, fetchNotifications, loading, error } = useCagnotteStore();
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  // Utiliser le hook de rafraîchissement silencieux
  const { forceRefresh } = useSilentRefresh(true, 30000); // Rafraîchissement toutes les 30 secondes

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        await fetchNotifications();
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      }
    };

    loadNotifications();
  }, [fetchNotifications]);


  const filteredNotifications = notifications?.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  }) || [];

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications?.filter(notif => !notif.isRead) || [];
    for (const notif of unreadNotifications) {
      try {
        await markAsRead(notif.id);
      } catch (error) {
        console.error('Erreur lors du marquage comme lu:', error);
      }
    }
  };

  if (loading && (!notifications || notifications.length === 0)) {
    return (
      <div className="pt-[calc(4rem+1rem)] p-6 mx-auto font-roboto" style={{ maxWidth: "1400px" }}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: colors.primary }}></div>
            <p className="text-gray-500">Chargement des notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-[calc(4rem+1rem)] p-6 mx-auto font-roboto" style={{ maxWidth: "1400px" }}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">Erreur lors du chargement des notifications</p>
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[calc(4rem+1rem)] p-6 mx-auto font-roboto" style={{ maxWidth: "1400px" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaBell className="text-2xl" style={{ color: colors.primary }} />
          <h1 className="text-3xl font-bold text-gray-800">Mes notifications</h1>
        </div>

        {notifications && notifications.some(notif => !notif.isRead) && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:opacity-90 transition"
            style={{ backgroundColor: colors.primary }}
          >
            <FaCheck className="text-sm" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-4 mb-6">
        <FaFilter className="text-gray-500" />
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all' ? 'text-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
            style={filter === 'all' ? { backgroundColor: colors.primary } : {}}
          >
            Toutes ({notifications?.length || 0})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'unread' ? 'text-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
            style={filter === 'unread' ? { backgroundColor: colors.primary } : {}}
          >
            Non lues ({notifications?.filter(n => !n.isRead).length || 0})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'read' ? 'text-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
            style={filter === 'read' ? { backgroundColor: colors.primary } : {}}
          >
            Lues ({notifications?.filter(n => n.isRead).length || 0})
          </button>
        </div>
      </div>

      {/* Liste des notifications */}
      {!filteredNotifications || filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <FaBell className="text-4xl mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">
            {filter === 'all' ? 'Aucune notification pour le moment.' :
             filter === 'unread' ? 'Aucune notification non lue.' :
             'Aucune notification lue.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white rounded-xl shadow p-6 transition-all duration-200 hover:shadow-lg ${
                !notif.isRead ? 'border-l-4' : ''
              }`}
              style={!notif.isRead ? { borderLeftColor: colors.primary } : {}}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className={`text-gray-800 mb-2 ${!notif.isRead ? 'font-semibold' : ''}`}>
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{new Date(notif.createdAt).toLocaleString('fr-FR')}</span>
                    {notif.type && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                        {notif.type}
                      </span>
                    )}
                  </div>
                </div>
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="ml-4 px-3 py-1 rounded-lg text-white hover:opacity-90 transition text-sm flex items-center gap-1"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <FaCheck className="text-xs" />
                    Marquer lu
                  </button>
                )}
                {notif.isRead && (
                  <div className="ml-4 flex items-center gap-1 text-green-600">
                    <FaCheck className="text-sm" />
                    <span className="text-sm font-medium">Lu</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
