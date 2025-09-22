import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Select, MenuItem, FormControl, InputLabel, Chip, Card, CardContent, Grid, Alert } from '@mui/material';
import { Download, FilterList, Payment, Info } from '@mui/icons-material';
import { api } from '../../services/api';

const AdminRetraits = () => {
  const [retraits, setRetraits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'closed',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50
  });

  useEffect(() => {
    fetchRetraits();
  }, [filters]);

  const fetchRetraits = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await api.get(`/admin/retraits?${queryParams}`);
      setRetraits(response.data.data || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error('Erreur chargement retraits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(numAmount);
  };

  const exportData = async (format) => {
    try {
      const response = await api.get(`/admin/export/retraits/${format}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `retraits_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur export:', error);
    }
  };

  const processWithdrawal = async (pullId) => {
    if (!confirm('Confirmer le traitement de ce retrait ? Cette action marquera le retrait comme traité.')) return;

    try {
      // Ici, vous pouvez implémenter l'API pour traiter le retrait
      alert('Fonctionnalité de traitement des retraits à implémenter côté backend');
      // const response = await api.post(`/admin/retraits/${pullId}/process`);
      // if (response.data.success) {
      //   fetchRetraits(); // Recharger les données
      // }
    } catch (error) {
      console.error('Erreur traitement retrait:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Chargement des retraits...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#4CA260', fontWeight: 'bold' }}>
        Gestion des Retraits
      </Typography>

      {/* Informations importantes */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
          Les retraits concernent les cagnottes clôturées. Un frais de 5% est appliqué sur le montant total collecté.
        </Typography>
      </Alert>

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#4CA260' }}>
            <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filtres
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filters.status}
                  label="Statut"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="closed">Cagnottes clôturées</MenuItem>
                  <MenuItem value="all">Tous les statuts</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Date début"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Date fin"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Boutons d'export */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={() => exportData('csv')}
          sx={{ backgroundColor: '#4CA260' }}
        >
          Export CSV
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={() => exportData('excel')}
          sx={{ backgroundColor: '#3B5BAB' }}
        >
          Export Excel
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={() => exportData('pdf')}
          sx={{ backgroundColor: '#FF9800' }}
        >
          Export PDF
        </Button>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#4CA260' }}>Total Retraits</Typography>
              <Typography variant="h4">{pagination.totalItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#3B5BAB' }}>Montant Total Collecté</Typography>
              <Typography variant="h4" sx={{ color: '#3B5BAB' }}>
                {formatCurrency(retraits.reduce((sum, r) => sum + (r.totalCollected || 0), 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#FF9800' }}>Frais Totaux (5%)</Typography>
              <Typography variant="h4" sx={{ color: '#FF9800' }}>
                {formatCurrency(retraits.reduce((sum, r) => sum + (r.fees || 0), 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#F44336' }}>À Payer</Typography>
              <Typography variant="h4" sx={{ color: '#F44336' }}>
                {formatCurrency(retraits.reduce((sum, r) => sum + (r.withdrawalAmount || 0), 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table des retraits */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Titre Cagnotte</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Propriétaire</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Montant Collecté</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Frais (5%)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Montant Retrait</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date Clôture</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {retraits.map((retrait) => (
              <TableRow key={retrait.id} hover>
                <TableCell>{retrait.id}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{retrait.title}</TableCell>
                <TableCell>
                  {retrait.owner?.name || 'N/A'}
                  {retrait.owner?.email && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {retrait.owner.email}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#4CA260' }}>
                  {formatCurrency(retrait.totalCollected)}
                </TableCell>
                <TableCell sx={{ color: '#FF9800' }}>
                  {formatCurrency(retrait.fees)}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#3B5BAB' }}>
                  {formatCurrency(retrait.withdrawalAmount)}
                </TableCell>
                <TableCell>
                  {new Date(retrait.updatedAt).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    startIcon={<Payment />}
                    onClick={() => processWithdrawal(retrait.id)}
                    sx={{
                      backgroundColor: '#4CAF50',
                      '&:hover': { backgroundColor: '#45a049' }
                    }}
                    size="small"
                  >
                    Traiter
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, gap: 2 }}>
        <Button
          variant="outlined"
          disabled={pagination.currentPage === 1}
          onClick={() => handlePageChange(pagination.currentPage - 1)}
        >
          Précédent
        </Button>
        <Typography>
          Page {pagination.currentPage} sur {pagination.totalPages} ({pagination.totalItems} éléments)
        </Typography>
        <Button
          variant="outlined"
          disabled={pagination.currentPage === pagination.totalPages}
          onClick={() => handlePageChange(pagination.currentPage + 1)}
        >
          Suivant
        </Button>
      </Box>

      {/* Informations sur les retraits */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#4CA260' }}>
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            Informations sur les retraits
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Processus de retrait:
              </Typography>
              <Typography variant="body2" component="div">
                1. La cagnotte atteint son objectif ou est clôturée<br/>
                2. Calcul automatique des frais (5%)<br/>
                3. Virement sur le compte du propriétaire<br/>
                4. Confirmation et archivage
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Frais de plateforme:
              </Typography>
              <Typography variant="body2" component="div">
                • 5% du montant total collecté<br/>
                • Frais de transaction bancaire inclus<br/>
                • Commission pour sécurisation des paiements
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminRetraits;