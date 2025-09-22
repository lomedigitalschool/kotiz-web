import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Select, MenuItem, FormControl, InputLabel, Chip, Card, CardContent, Grid } from '@mui/material';
import { Download, FilterList, Search } from '@mui/icons-material';
import { api } from '../../services/api';

const AdminContributions = () => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    search: '',
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
    fetchContributions();
  }, [filters]);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await api.get(`/admin/contributions?${queryParams}`);
      setContributions(response.data.data || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error('Erreur chargement contributions:', error);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Terminée';
      case 'pending': return 'En attente';
      case 'failed': return 'Échouée';
      default: return status;
    }
  };

  const exportData = async (format) => {
    try {
      const response = await api.get(`/admin/export/contributions/${format}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contributions_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur export:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Chargement des contributions...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#4CA260', fontWeight: 'bold' }}>
        Gestion des Contributions
      </Typography>

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#4CA260' }}>
            <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filtres
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filters.status}
                  label="Statut"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">Tous les statuts</MenuItem>
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="completed">Terminée</MenuItem>
                  <MenuItem value="failed">Échouée</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Date début"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Date fin"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Recherche"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Nom, email..."
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                }}
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
              <Typography variant="h6" sx={{ color: '#4CA260' }}>Total</Typography>
              <Typography variant="h4">{pagination.totalItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#4CAF50' }}>Terminées</Typography>
              <Typography variant="h4">
                {contributions.filter(c => c.status === 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#FF9800' }}>En attente</Typography>
              <Typography variant="h4">
                {contributions.filter(c => c.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#F44336' }}>Échouées</Typography>
              <Typography variant="h4">
                {contributions.filter(c => c.status === 'failed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table des contributions */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Cagnotte</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Contributeur</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Montant</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Méthode</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contributions.map((contribution) => (
              <TableRow key={contribution.id} hover>
                <TableCell>{contribution.id}</TableCell>
                <TableCell>{contribution.Pull?.title || 'N/A'}</TableCell>
                <TableCell>
                  {contribution.contributor?.name || contribution.contributorName || 'Anonyme'}
                  {contribution.contributor?.email && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {contribution.contributor.email}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#4CA260' }}>
                  {formatCurrency(contribution.amount)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(contribution.status)}
                    color={getStatusColor(contribution.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{contribution.paymentMethod || 'N/A'}</TableCell>
                <TableCell>
                  {new Date(contribution.createdAt).toLocaleDateString('fr-FR')}
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
    </Box>
  );
};

export default AdminContributions;