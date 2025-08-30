import React, { useState, useEffect } from "react";
import { FiSettings, FiBell, FiShield, FiHelpCircle, FiHome, FiGrid, FiLogOut, FiEdit, FiLock, FiPhone } from "react-icons/fi";
import { useNavigate } from "react-router-dom"; // Importation du hook pour la navigation
import api from "../services/api";
import { useCagnotteStore } from "../stores/cagnotteStore";

// Composant principal pour la page de profil utilisateur
const ProfilePage = () => {
   const navigate = useNavigate(); // Hook pour naviguer entre les pages
   const { cagnottes, contributions } = useCagnotteStore();

   // Gestion des états locaux pour les onglets actifs et les données utilisateur
   const [activeTab, setActiveTab] = useState("soutenues"); // Onglet actif (projets soutenus ou créés)
   const [userData, setUserData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false); // État d'édition
  const [editField, setEditField] = useState(""); // Champ en cours d'édition
  const [editValue, setEditValue] = useState(""); // Nouvelle valeur pour le champ édité

  // Récupération des données utilisateur depuis l'API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Vérifier si l'utilisateur est connecté
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vous devez être connecté pour accéder à votre profil');
          setLoading(false);
          return;
        }

        const response = await api.get('/v1/auth/me');
        const user = response.data;

        setUserData({
          id: user.id,
          name: user.name || "Utilisateur",
          email: user.email || "",
          phone: user.phone || "",
          notifications: true, // Par défaut activé
          memberSince: user.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear(),
          location: "Non spécifiée" // À implémenter plus tard si nécessaire
        });

        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err);
        if (err.response?.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
        } else {
          setError('Erreur lors du chargement du profil utilisateur');
        }
        // Données par défaut en cas d'erreur
        setUserData({
          name: "Utilisateur",
          email: "",
          phone: "",
          notifications: true,
          memberSince: new Date().getFullYear(),
          location: "Non spécifiée"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Calcul des projets créés et soutenus depuis les données du store
  const projetsCrees = cagnottes.filter(c => c.userId === userData?.id) || [];
  const projetsSoutenus = contributions.map(contrib => {
    const cagnotte = cagnottes.find(c => c.id === contrib.cagnotteId);
    return cagnotte ? {
      id: cagnotte.id,
      category: cagnotte.type === 'public' ? 'Publique' : 'Privée',
      title: cagnotte.title,
      description: cagnotte.description,
      amount: contrib.amount,
      currency: contrib.currency
    } : null;
  }).filter(Boolean);

  // Gestion du chargement et des erreurs
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Aucune donnée utilisateur trouvée</p>
      </div>
    );
  }

  // Fonction pour obtenir l'initiale du nom de l'utilisateur
  const getInitial = () => {
    return userData.name ? userData.name.charAt(0).toUpperCase() : "?";
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
              
              <button
                className="w-full flex items-center space-x-2 p-3 rounded-lg text-red-600 hover:bg-red-50 transition mt-4"
                onClick={() => {
                  if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('cagnottes');
                    localStorage.removeItem('contributions');
                    navigate('/login');
                  }
                }}
              >
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
                  {projetsSoutenus.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Aucun projet soutenu pour l'instant.</p>
                      <button
                        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        onClick={() => navigate("/explorePage")}
                      >
                        Explorer les projets
                      </button>
                    </div>
                  ) : (
                    projetsSoutenus.map((projet) => (
                      <div
                        key={projet.id}
                        className="p-4 border rounded-lg shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-indigo-600 font-medium">{projet.category}</p>
                          <span className="text-sm font-semibold text-green-600">
                            {(projet.amount || 0).toLocaleString()} {projet.currency}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{projet.title}</h3>
                        <p className="text-gray-600 mb-3">{projet.description}</p>
                        <button
                          className="text-indigo-600 font-semibold hover:underline"
                          onClick={() => navigate(`/cagnottes/${projet.id}`)}
                        >
                          Voir le projet
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "creees" && (
                <div className="space-y-4">
                  {projetsCrees.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Aucun projet créé pour l'instant.</p>
                      <button
                        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        onClick={() => navigate("/create-cagnotte")}
                      >
                        Créer un projet
                      </button>
                    </div>
                  ) : (
                    projetsCrees.map((projet) => (
                      <div
                        key={projet.id}
                        className="p-4 border rounded-lg shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-indigo-600 font-medium">
                            {projet.type === 'public' ? 'Publique' : 'Privée'}
                          </p>
                          <span className={`text-sm font-semibold px-2 py-1 rounded ${
                            projet.status === 'active' ? 'bg-green-100 text-green-800' :
                            projet.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {projet.status === 'active' ? 'Actif' :
                             projet.status === 'pending' ? 'En attente' : projet.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{projet.title}</h3>
                        <p className="text-gray-600 mb-2">{projet.description}</p>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>Objectif: {(projet.goalAmount || 0).toLocaleString()} {projet.currency}</span>
                          <span>Collecté: {(projet.currentAmount || 0).toLocaleString()} {projet.currency}</span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            className="text-indigo-600 font-semibold hover:underline"
                            onClick={() => navigate(`/cagnottes/${projet.id}`)}
                          >
                            Voir le projet
                          </button>
                          <button
                            className="text-green-600 font-semibold hover:underline"
                            onClick={() => navigate(`/edit-cagnotte/${projet.id}`)}
                          >
                            Modifier
                          </button>
                        </div>
                      </div>
                    ))
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