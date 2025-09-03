import React from "react";
import { useCagnotteStore } from "../stores/cagnotteStore";
import { colors } from "../theme/colors";

export default function NotificationsPage() {
  const { notifications, markAsRead } = useCagnotteStore();

  if (!notifications || notifications.length === 0) {
    return <p className="text-center mt-20 text-gray-500">Aucune notification pour le moment.</p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Mes notifications</h2>

      <ul className="space-y-3">
        {notifications.map((notif) => (
          <li
            key={notif.id}
            className={`p-4 rounded-lg shadow flex justify-between items-center ${
              notif.read ? "bg-gray-100" : "bg-white"
            }`}
          >
            <div>
              <p className="text-gray-700">{notif.message}</p>
              <p className="text-sm text-gray-500 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
            </div>
            {!notif.read && (
              <button
                onClick={() => markAsRead(notif.id)}
                className="px-3 py-1 rounded text-white hover:opacity-90 transition text-sm"
                style={{ backgroundColor: colors.primary }}
              >
                Marquer lu
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
