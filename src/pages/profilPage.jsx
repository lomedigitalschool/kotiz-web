import React, { useState } from "react";
import { FiSettings, FiBell, FiShield, FiHelpCircle, FiHome, FiGrid, FiLogOut, FiEdit, FiLock, FiPhone } from "react-icons/fi";
import { useNavigate } from "react-router-dom"; // Importation du hook pour la navigation

// Composant principal pour la page de profil utilisateur
const ProfilePage = () => {
  const navigate = useNavigate(); // Hook pour naviguer entre les pages

  // Gestion des états locaux pour les onglets actifs et les données utilisateur
  const [activeTab, setActiveTab] = useState("soutenues"); // Onglet actif (projets soutenus ou créés)
  const [userData, setUserData] = useState({
    name: "Joshua Adebayo", // Nom de l'utilisateur
    email: "joshua.adebayo@email.com", // Email de l'utilisateur
    phone: "+234 803 456 7890", // Numéro de téléphone
    notifications: true, // État des notifications
    memberSince: "2021", // Année d'inscription
    location: "Lagos, Nigeria" // Localisation
  });
  
  const [isEditing, setIsEditing] = useState(false); // État d'édition
  const [editField, setEditField] = useState(""); // Champ en cours d'édition
  const [editValue, setEditValue] = useState(""); // Nouvelle valeur pour le champ édité

  // Données mockées pour les projets soutenus
  const projetsSoutenus = [
    {
      id: 1,
      category: "Technologie",
      title: "Système de sécurité intelligent",
      description: "Un système révolutionnaire pour protéger les foyers modernes.",
    },
    {
      id: 2,
      category: "Arts & Crafts",
      title: "Journaux en cuir faits main",
      description: "Des carnets élégants pour écrire, dessiner ou capturer vos pensées.",
    },
  ];

  const projetsCrees = []; // Liste des projets créés par l'utilisateur (vide par défaut)

  // Fonction pour obtenir l'initiale du nom de l'utilisateur
  const getInitial = () => {
    return userData.name.charAt(0).toUpperCase();
  };

  // Fonction pour gérer l'édition des informations utilisateur
  const handleEdit = (field, value) => {
    if (field !== "email") { // Empêche l'édition de l'email
      setEditField(field);
      setEditValue(value);
      setIsEditing(true);
    }
  };

  // Fonction pour sauvegarder les modifications apportées aux informations utilisateur
  const handleSave = () => {
    setUserData({
      ...userData,
      [editField]: editValue
    });
    setIsEditing(false);
    setEditField("");
    setEditValue("");
  };

  // Fonction pour annuler l'édition
  const handleCancel = () => {
    setIsEditing(false);
    setEditField("");
    setEditValue("");
  };

  // Fonction pour activer/désactiver les notifications
  const toggleNotifications = () => {
    setUserData({
      ...userData,
      notifications: !userData.notifications
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête de la page */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Mon Profil</h1>
          <div className="flex space-x-4">
            {/* Boutons de navigation */}
            <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => navigate("/landing")}>
              <FiHome variant="primary" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <FiGrid className="text-gray-600 text-xl" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Barre latérale de navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            {/* Affichage de la photo de profil avec initiale */}
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                {getInitial()}
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-center text-gray-800 mb-1">{userData.name}</h2>
            <p className="text-gray-600 text-center text-sm mb-4">
              Membre depuis {userData.memberSince} - {userData.location}
            </p>
            
            <div className="space-y-2">
              {/* Liens de navigation */}
              <button className="w-full flex items-center space-x-2 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                <FiSettings className="text-gray-500" />
                <span>Compte</span>
              </button>
              
              <button className="w-full flex items-center space-x-2 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                <FiBell className="text-gray-500" />
                <span>Notifications</span>
              </button>
              
              <button className="w-full flex items-center space-x-2 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                <FiShield className="text-gray-500" />
                <span>Sécurité</span>
              </button>
              
              <button className="w-full flex items-center space-x-2 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                <FiHelpCircle className="text-gray-500" />
                <span>Aide</span>
              </button>
              
              <button className="w-full flex items-center space-x-2 p-3 rounded-lg text-red-600 hover:bg-red-50 transition mt-4">
                <FiLogOut className="text-red-500" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-2">
          {/* Section des informations utilisateur */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Informations du compte</h2>
            
            {/* Section pour modifier le nom */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-600">Nom complet</label>
                <button 
                  onClick={() => handleEdit('name', userData.name)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                >
                  <FiEdit className="mr-1" /> Modifier
                </button>
              </div>
              
              {isEditing && editField === 'name' ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 p-2 border rounded-md"
                  />
                  <button 
                    onClick={handleSave}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Sauvegarder
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <p className="text-gray-800">{userData.name}</p>
              )}
            </div>
            
            {/* Email (non modifiable) */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-600">Email</label>
              </div>
              <p className="text-gray-800">{userData.email}</p>
            </div>
            
            {/* Téléphone */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-600">Téléphone</label>
                <button 
                  onClick={() => handleEdit('phone', userData.phone)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                >
                  <FiEdit className="mr-1" /> Modifier
                </button>
              </div>
              
              {isEditing && editField === 'phone' ? (
                <div className="flex space-x-2">
                  <input
                    type="tel"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 p-2 border rounded-md"
                  />
                  <button 
                    onClick={handleSave}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Sauvegarder
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <p className="text-gray-800">{userData.phone}</p>
              )}
            </div>
            
            {/* Modifier le mot de passe */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-600">Mot de passe</label>
                <button 
                  onClick={() => handleEdit('password', '')}
                  className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                >
                  <FiLock className="mr-1" /> Modifier
                </button>
              </div>
              {isEditing && editField === 'password' ? (
                <div className="flex space-x-2">
                  <input
                    type="password"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 p-2 border rounded-md"
                    placeholder="Nouveau mot de passe"
                  />
                  <button 
                    onClick={handleSave}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Sauvegarder
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <p className="text-gray-800">•••••••••••</p>
              )}
            </div>
            
            {/* Notifications */}
            <div className="flex justify-between items-center">
              <div>
                <label className="text-sm font-medium text-gray-600">Notifications</label>
                <p className="text-gray-800">{userData.notifications ? "Activé" : "Désactivé"}</p>
              </div>
              <button 
                onClick={toggleNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${userData.notifications ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${userData.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* Section des projets */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Mes projets</h2>
            
            {/* Onglets pour basculer entre projets soutenus et créés */}
            <div className="flex space-x-6 border-b border-gray-200 mb-6">
              <button
                className={`pb-2 font-semibold ${
                  activeTab === "soutenues"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("soutenues")}
              >
                Soutenues
              </button>
              <button
                className={`pb-2 font-semibold ${
                  activeTab === "creees"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("creees")}
              >
                Créées
              </button>
            </div>

            {/* Contenu dynamique des projets */}
            <div>
              {activeTab === "soutenues" && (
                <div className="space-y-4">
                  {projetsSoutenus.map((projet) => (
                    <div
                      key={projet.id}
                      className="p-4 border rounded-lg shadow-sm hover:shadow-md transition"
                    >
                      <p className="text-sm text-indigo-600 font-medium">{projet.category}</p>
                      <h3 className="text-lg font-bold text-gray-800">{projet.title}</h3>
                      <p className="text-gray-600">{projet.description}</p>
                      <button className="mt-2 text-indigo-600 font-semibold hover:underline">
                        Voir le projet
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "creees" && (
                <div className="text-center text-gray-600 py-8">
                  {projetsCrees.length === 0 ? (
                    <div>
                      <p>Aucun projet créé pour l'instant.</p>
                      <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                        Créer un projet
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projetsCrees.map((projet) => (
                        <div key={projet.id}>{/* Carte projet similaire */}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;