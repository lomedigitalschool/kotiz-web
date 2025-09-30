import React from "react";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import { Login } from "./pages/Login";
import CreerCagnotte from "./pages/createCagnotte";
import ProfilPage from "./pages/profilPage";
import ExplorePage from "./pages/explorePage";
import CagnotteDetails from "./pages/CagnotteDetails";
import ContributorsPage from "./pages/ContributorsPage";
import { Routes, Route, Navigate } from "react-router-dom";
import ContributePage from "./pages/ContributePage";
import Dashboard from "./pages/Dashboard";
import EditCagnotte from "./pages/EditCagnotte";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PaymentResult from "./pages/PaymentResult";
import NotificationsPage from "./pages/Notifications";
import KycForm from "./pages/KycForm";
import Transactions from "./pages/Transactions";
import ReceiptPage from "./pages/ReceiptPage";
import PaymentStatusPage from "./pages/PaymentStatusPage";
import TestPaymentPage from "./pages/TestPaymentPage";
import { useAuth } from "./contexts/AuthContext";
import AuthGuard from "./components/AuthGuard";
import Breadcrumb from "./components/Breadcrumb";

// Importer les utilitaires de debug en développement
//if (process.env.NODE_ENV === 'development') {
  //import('./utils/authDebug');
//}





/**
 * Point d'entrée de l'application React
 * 
 * Cette fonctionnalité gère les routes de l'application avec React Router.
 * 
 * Les routes sont:
 * - "/" : redirection vers "/landing"
 * - "/home" : page d'accueil
 * - "/landing" : page de démarrage
 * - "/login" : page de connexion
 * - "/register" : page d'inscription
 * - "/create-cagnotte" : page de création de cagnotte
 * - "/profil" : page de profil
 * - "/explorePage" : page d'exploration
 * - "/cagnotte/:id" : détails d'une cagnotte
 * - "/contributors" : page des contributeurs
 */

export default function App() {
  const { user, loading, isAuthenticated } = useAuth();

  // Afficher un écran de chargement pendant la vérification Firebase
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
          <p className="text-sm text-gray-500 mt-2">Ne fermez pas cette page</p>
        </div>
      </div>
    );
  }

  console.log('🔄 État d\'authentification déterminé:', isAuthenticated ? 'Connecté' : 'Non connecté');

  return (
    <>
      <Breadcrumb />
      <Routes>
      <Route path="/" element={<Navigate to="/landing" />} />
      <Route path="/landing" element={<LandingPage />} />

      {/* Routes publiques - redirigent vers dashboard si déjà connecté */}
      <Route path="/login" element={
        <AuthGuard requireAuth={false}>
          <Login />
        </AuthGuard>
      } />
      <Route path="/register" element={
        <AuthGuard requireAuth={false}>
          <Register />
        </AuthGuard>
      } />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Routes publiques accessibles sans connexion */}
      <Route path="/explorePage" element={<ExplorePage />} />
      <Route path="/cagnottes/:id" element={<CagnotteDetails />} />

      {/* Routes protégées nécessitant une authentification */}
      <Route path="/create-cagnotte" element={
        <AuthGuard requireAuth={true}>
          <CreerCagnotte />
        </AuthGuard>
      } />
      <Route path="/profil" element={
        <AuthGuard requireAuth={true}>
          <ProfilPage />
        </AuthGuard>
      } />
      <Route path="/contribute/:id" element={
        <AuthGuard requireAuth={true}>
          <ContributePage />
        </AuthGuard>
      } />
      <Route path="/contributors/:id" element={
        <AuthGuard requireAuth={true}>
          <ContributorsPage />
        </AuthGuard>
      } />
      <Route path="/dashboard" element={
        <AuthGuard requireAuth={true}>
          <Dashboard />
        </AuthGuard>
      } />
      <Route path="/edit-cagnotte/:id" element={
        <AuthGuard requireAuth={true}>
          <EditCagnotte />
        </AuthGuard>
      } />
      <Route path="/kyc" element={
        <AuthGuard requireAuth={true}>
          <KycForm />
        </AuthGuard>
      } />
      <Route path="/payment-result" element={
        <AuthGuard requireAuth={true}>
          <PaymentResult />
        </AuthGuard>
      } />
      <Route path="/notifications" element={
        <AuthGuard requireAuth={true}>
          <NotificationsPage />
        </AuthGuard>
      } />
      <Route path="/transactions" element={
        <AuthGuard requireAuth={true}>
          <Transactions />
        </AuthGuard>
      } />
      <Route path="/receipt" element={
        <AuthGuard requireAuth={true}>
          <ReceiptPage />
        </AuthGuard>
      } />
      <Route path="/payment-status/:contributionId" element={
        <AuthGuard requireAuth={true}>
          <PaymentStatusPage />
        </AuthGuard>
      } />
      <Route path="/test-payments" element={
        <AuthGuard requireAuth={true}>
          <TestPaymentPage />
        </AuthGuard>
      } />

    </Routes>
   </>
  );
}