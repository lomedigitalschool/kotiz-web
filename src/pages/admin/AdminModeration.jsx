import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip, Card, CardContent, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';
import { Flag, CheckCircle, Cancel, Visibility, Warning } from '@mui/icons-material';
import { api } from '../../services/api';

const AdminModeration = () => {
  const [pulls, setPulls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flagDialog, setFlagDialog] = useState({ open: false, pullId: null, reason: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPulls();
  }, []);

  const fetchPulls = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/pulls');
      setPulls(response.data || []);
    } catch (error) {
      console.error('Erreur chargement cagnottes:', error);
      setError('Erreur lors du chargement des cagnottes');
    } finally {
      setLoading(false);
    }
  };

  const handleFlag = async (pullId, reason) => {
    try {
      await api.put(`/admin/pulls/${pullId}/flag`, { reason });
      setFlagDialog({ open: false, pullId: null, reason: '' });
      fetchPulls(); // Recharger les données
      alert('Cagnotte signalée avec succès');
    } catch (error) {
      console.error('Erreur signalement:', error);
      alert('Erreur lors du signalement');
    }
  };

  const handleUnflag = async (pullId) => {
    try {
      await api.put(`/admin/pulls/${pullId}/unflag`);
      fetchPulls(); // Recharger les données
      alert('Signalement retiré avec succès');
    } catch (error) {
      console.error('Erreur retrait signalement:', error);
      alert('Erreur lors du retrait du signalement');
    }
  };

  const handleValidate = async (pullId) => {
    try {
      await api.put(`/admin/pulls/${pullId}/validate`);
      fetchPulls(); // Recharger les données
      alert('Cagnotte validée avec succès');
    } catch (error) {
      console.error('Erreur validation:', error);
      alert('Erreur lors de la validation');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'closed': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'En attente';
      case 'closed': return 'Clôturée';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Chargement des cagnottes...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#4CA260', fontWeight: 'bold' }}>
        Modération des Cagnottes
      </Typography>

      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Gérez la validation, les signalements et la modération des cagnottes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {/* Statistiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#4CA260' }}>Total Cagnottes</Typography>
              <Typography variant="h4">{pulls.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#3B5BAB' }}>Actives</Typography>
              <Typography variant="h4">
                {pulls.filter(p => p.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#FF9800' }}>En attente</Typography>
              <Typography variant="h4">
                {pulls.filter(p => p.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#F44336' }}>Signalées</Typography>
              <Typography variant="h4">
                {pulls.filter(p => p.isFlagged).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table des cagnottes */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Titre</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Propriétaire</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Signalement</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Montant</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pulls.map((pull) => (
              <TableRow key={pull.id} hover>
                <TableCell>{pull.id}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{pull.title}</TableCell>
                <TableCell>
                  {pull.owner?.name || 'N/A'}
                  {pull.owner?.email && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {pull.owner.email}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(pull.status)}
                    color={getStatusColor(pull.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {pull.isFlagged ? (
                    <Box>
                      <Chip
                        label="Signalée"
                        color="error"
                        size="small"
                        icon={<Flag />}
                      />
                      {pull.flagReason && (
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                          {pull.flagReason}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Chip label="OK" color="success" size="small" />
                  )}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#4CA260' }}>
                  {formatCurrency(pull.currentAmount)} / {formatCurrency(pull.goalAmount)}
                </TableCell>
                <TableCell>
                  {new Date(pull.createdAt).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => window.open(`/cagnottes/${pull.id}`, '_blank')}
                    >
                      Voir
                    </Button>

                    {pull.status === 'pending' && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() => handleValidate(pull.id)}
                        sx={{ backgroundColor: '#4CAF50' }}
                      >
                        Valider
                      </Button>
                    )}

                    {!pull.isFlagged ? (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Flag />}
                        color="error"
                        onClick={() => setFlagDialog({ open: true, pullId: pull.id, reason: '' })}
                      >
                        Signaler
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Cancel />}
                        onClick={() => handleUnflag(pull.id)}
                        sx={{ backgroundColor: '#FF9800' }}
                      >
                        Retirer signalement
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog pour signaler une cagnotte */}
      <Dialog open={flagDialog.open} onClose={() => setFlagDialog({ open: false, pullId: null, reason: '' })}>
        <DialogTitle>Signaler une cagnotte</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Raison du signalement"
            fullWidth
            multiline
            rows={3}
            value={flagDialog.reason}
            onChange={(e) => setFlagDialog(prev => ({ ...prev, reason: e.target.value }))}
            placeholder="Expliquez pourquoi cette cagnotte doit être signalée..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFlagDialog({ open: false, pullId: null, reason: '' })}>
            Annuler
          </Button>
          <Button
            onClick={() => handleFlag(flagDialog.pullId, flagDialog.reason)}
            variant="contained"
            color="error"
            disabled={!flagDialog.reason.trim()}
          >
            Signaler
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminModeration;