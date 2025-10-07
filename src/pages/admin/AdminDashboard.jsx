import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Alert } from '@mui/material';
import { People, AccountBalance, TrendingUp, Flag, AccessTime, Today } from '@mui/icons-material';
import { api } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Erreur chargement stats dashboard:', error);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Chargement du tableau de bord...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#4CA260', fontWeight: 'bold' }}>
        Tableau de Bord Administrateur
      </Typography>

      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Vue d'ensemble des statistiques et activités de la plateforme
      </Typography>

      {/* Statistiques principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #4CA260' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <People sx={{ color: '#4CA260', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#4CA260' }}>
                  Utilisateurs
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats?.userStats?.totalUsers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats?.userStats?.verifiedUsers || 0} vérifiés
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #3B5BAB' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AccountBalance sx={{ color: '#3B5BAB', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#3B5BAB' }}>
                  Cagnottes
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats?.pullStats?.totalPulls || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats?.pullStats?.activePulls || 0} actives
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #FF9800' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUp sx={{ color: '#FF9800', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#FF9800' }}>
                  Montant Collecté
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(stats?.contributionStats?.totalAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats?.contributionStats?.totalContributions || 0} contributions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #F44336' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Flag sx={{ color: '#F44336', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#F44336' }}>
                  Signalements
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats?.pullStats?.flaggedPulls || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cagnottes signalées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Activité récente */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#4CA260' }}>
                <Today sx={{ mr: 1, verticalAlign: 'middle' }} />
                Activité Aujourd'hui
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Nouveaux utilisateurs</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4CA260' }}>
                    {stats?.recentActivity?.todayUsers || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Transactions</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3B5BAB' }}>
                    {stats?.transactionStats?.totalTransactions || 0}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#4CA260' }}>
                <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                Activité de la Semaine
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Nouveaux utilisateurs</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4CA260' }}>
                    {stats?.recentActivity?.weekUsers || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Nouvelles cagnottes</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3B5BAB' }}>
                    {stats?.recentActivity?.weekPulls || 0}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Informations supplémentaires */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#4CA260' }}>
                Statistiques Détaillées
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Utilisateurs ce mois</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stats?.userStats?.newUsersThisMonth || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Cagnottes clôturées</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stats?.pullStats?.closedPulls || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Montant moyen/transaction</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(stats?.transactionStats?.averageAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Contributions cette semaine</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stats?.recentActivity?.weekContributions || 0}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;