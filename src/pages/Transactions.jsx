import React, { useState, useEffect } from "react";
import api from "../services/api";
import { CSVLink } from "react-csv";

const Transactions = () => {
  const [transactions, setTransactions] = useState([
  
    { id: 1, type: "contribution", status: "completed", amount: 5000, method: "card", reference: "PAY-123", date: "2025-09-09" },
    { id: 2, type: "retrait", status: "pending", amount: 2000, method: "tmoney", reference: "PAY-124", date: "2025-09-08" },
  ]);

  
  const [filterType, setFilterType] = useState("all"); 
  const [filterStatus, setFilterStatus] = useState("all"); 
  const [filterStartDate, setFilterStartDate] = useState(""); 
  const [filterEndDate, setFilterEndDate] = useState(""); 

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

  //  Export Csv
  const csvData = filteredTransactions.map(tx => ({
    Type: tx.type,
    Statut: tx.status,
    Montant: tx.amount,
    Méthode: tx.method,
    Référence: tx.reference,
    Date: tx.date,
  }));

  return (
    <div className="p-6 mx-auto" style={{ maxWidth: "900px", fontFamily: "Roboto, sans-serif" }}>
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Historique des transactions</h1>

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
        <div className="mt-3">
          <CSVLink data={csvData} filename={"transactions.csv"} className="px-4 py-2 bg-primary text-white rounded hover:opacity-90 transition">
            Exporter CSV
          </CSVLink>
        </div>
      </div>

      {/* --- Liste des transactions --- */}
      <div className="bg-white rounded shadow p-4">
        {filteredTransactions.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Aucune transaction trouvée pour les filtres sélectionnés.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-left">Type</th>
                <th className="border px-3 py-2 text-left">Statut</th>
                <th className="border px-3 py-2 text-left">Montant</th>
                <th className="border px-3 py-2 text-left">Méthode</th>
                <th className="border px-3 py-2 text-left">Référence</th>
                <th className="border px-3 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(tx => (
                <tr key={tx.id}>
                  <td className="border px-3 py-2">{tx.type}</td>
                  <td className="border px-3 py-2">{tx.status}</td>
                  <td className="border px-3 py-2">{tx.amount}</td>
                  <td className="border px-3 py-2">{tx.method}</td>
                  <td className="border px-3 py-2">{tx.reference}</td>
                  <td className="border px-3 py-2">{tx.date}</td>
                </tr>
              )
            )
              }
            </tbody>
          </table>
        )
        }
      </div>
    </div>
  );
};

export default Transactions;


