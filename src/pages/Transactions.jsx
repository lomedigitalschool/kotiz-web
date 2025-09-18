import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCagnotteStore } from "../stores/cagnotteStore";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { CSVLink } from "react-csv";
import { FaArrowLeft, FaDownload, FaFilter } from "react-icons/fa";

const Transactions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { contributions, fetchUserContributions } = useCagnotteStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState("all"); 
  const [filterStatus, setFilterStatus] = useState("all"); 
  const [filterStartDate, setFilterStartDate] = useState(""); 
  const [filterEndDate, setFilterEndDate] = useState("");
  
  // Charger les transactions au montage du composant
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        
        // Charger les contributions depuis le store
        await fetchUserContributions();
        
        // Convertir les contributions en format transaction
        const contributionTransactions = contributions.map(contrib => ({
          id: contrib.id || `contrib-${Date.now()}-${Math.random()}`,
          type: "contribution",
          status: "completed", // Les contributions sont toujours complétées
          amount: parseFloat(contrib.amount) || 0,
          method: contrib.paymentMethod || "card",
          reference: contrib.reference || `CONTRIB-${contrib.id}`,
          date: contrib.createdAt ? new Date(contrib.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          cagnotteTitle: contrib.cagnotteTitle || "Cagnotte inconnue",
          currency: contrib.currency || 'XOF',
          user: contrib.user || "Anonyme"
        }));
        
        setTransactions(contributionTransactions);
        console.log('✅ Transactions chargées:', contributionTransactions.length);
        
      } catch (error) {
        console.error('❌ Erreur lors du chargement des transactions:', error);
        // Fallback avec des données mockées en cas d'erreur
        setTransactions([
          { id: 1, type: "contribution", status: "completed", amount: 5000, method: "card", reference: "PAY-123", date: "2024-12-09", cagnotteTitle: "Exemple", currency: "XOF" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadTransactions();
  }, [fetchUserContributions, contributions]);
  
  // Rafraîchir quand on revient sur la page
  useEffect(() => {
    const handleFocus = () => {
      fetchUserContributions();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchUserContributions]); 

  const filteredTransactions = transactions.filter(tx => {
    if (filterType !== "all" && tx.type !== filterType) return false;
    if (filterStatus !== "all" && tx.status !== filterStatus) return false;
    if (filterStartDate) {
      const start = new Date(filterStartDate);
      const txDate = new Date(tx.date);
      if (txDate < start) return false;
    }
    if (filterEndDate) {
      const end = new Date(filterEndDate);
      const txDate = new Date(tx.date);
      if (txDate > end) return false;
    }
    return true;
  });

  //  Export CSV avec plus de détails
  const csvData = filteredTransactions.map(tx => ({
    Type: tx.type,
    Cagnotte: tx.cagnotteTitle || 'N/A',
    Statut: tx.status,
    Montant: tx.amount,
    Devise: tx.currency || 'FCFA',
    Méthode: tx.method,
    Référence: tx.reference,
    Date: tx.date,
    Utilisateur: tx.user || 'N/A'
  }));

  if (loading) {
    return (
      <div className="p-6 mx-auto" style={{ maxWidth: "900px", fontFamily: "Roboto, sans-serif" }}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto" style={{ maxWidth: "1200px", fontFamily: "Roboto, sans-serif" }}>
      {/* Header avec navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FaArrowLeft /> Retour au Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Historique des transactions</h1>
        </div>
        
        {user && (
          <div className="text-sm text-gray-600">
            Utilisateur: <span className="font-semibold">{user.name || user.email}</span>
          </div>
        )}
      </div>

      {/* --- Section Filtres --- */}
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="font-semibold mb-2">Filtres</h2>

        <div className="flex flex-wrap gap-4">
          {/* Filtre Type */}
          <div className="flex flex-col">
            <label style={{ color: "#374151", marginBottom: "0.25rem" }}>Type de transaction</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border rounded px-2 py-1">
              <option value="all">Tous les types</option>
              <option value="contribution">Contribution</option>
              <option value="retrait">Retrait</option>
            </select>
          </div>

          {/* Filtre Statut */}
          <div className="flex flex-col">
            <label style={{ color: "#374151", marginBottom: "0.25rem" }}>Statut</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border rounded px-2 py-1">
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="completed">Terminé</option>
              <option value="failed">Échoué</option>
            </select>
          </div>

          {/* Filtre Date de début */}
          <div className="flex flex-col">
            <label style={{ color: "#374151", marginBottom: "0.25rem" }}>Date de début</label>
            <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="border rounded px-2 py-1" />
          </div>

          {/* Filtre Date de fin */}
          <div className="flex flex-col">
            <label style={{ color: "#374151", marginBottom: "0.25rem" }}>Date de fin</label>
            <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="border rounded px-2 py-1" />
          </div>
        </div>

        {/* Bouton Export CSV */}
        <div className="mt-4 flex items-center gap-4">
          <CSVLink 
            data={csvData} 
            filename={`transactions-${new Date().toISOString().split('T')[0]}.csv`} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaDownload /> Exporter CSV ({filteredTransactions.length} transactions)
          </CSVLink>
          
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">
              {filteredTransactions.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0).toLocaleString()} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* --- Liste des transactions --- */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">💳</div>
            <p className="text-gray-600 text-lg mb-2">Aucune transaction trouvée</p>
            <p className="text-gray-500 text-sm">
              {transactions.length === 0 
                ? "Vous n'avez pas encore effectué de transactions." 
                : "Aucune transaction ne correspond aux filtres sélectionnés."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Cagnotte</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Statut</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Montant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Méthode</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Référence</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((tx, index) => (
                  <tr key={tx.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        tx.type === 'contribution' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {tx.type === 'contribution' ? '💰 Contribution' : '📤 Retrait'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={tx.cagnotteTitle}>
                      {tx.cagnotteTitle || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.status === 'completed' ? '✅ Terminé' :
                         tx.status === 'pending' ? '⏳ En attente' :
                         '❌ Échoué'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-gray-900">
                        {(parseFloat(tx.amount) || 0).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">{tx.currency || 'FCFA'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{tx.method}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{tx.reference}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(tx.date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;


