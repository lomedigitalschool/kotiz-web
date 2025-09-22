import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { Download, Description, TableChart, PictureAsPdf, Info, History } from '@mui/icons-material';
import { api } from '../../services/api';

const AdminExports = () => {
  const [exporting, setExporting] = useState({});

  const exportData = async (endpoint, format) => {
    const key = `${endpoint}_${format}`;
    setExporting(prev => ({ ...prev, [key]: true }));

    try {
      const response = await api.get(`/admin/export/${endpoint}/${format}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${endpoint}_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur export:', error);
      alert(`Erreur lors de l'export ${format.toUpperCase()}`);
    } finally {
      setExporting(prev => ({ ...prev, [key]: false }));
    }
  };

  const exportSections = [
    {
      title: '📊 Contributions',
      description: 'Exporter les données des contributions (montants, statuts, contributeurs)',
      endpoint: 'contributions',
      filename: 'contributions',
      color: '#4CA260'
    },
    {
      title: '💰 Retraits',
      description: 'Exporter les données des retraits (cagnottes clôturées, montants à payer)',
      endpoint: 'retraits',
      filename: 'retraits',
      color: '#3B5BAB'
    },
    {
      title: '👥 Utilisateurs',
      description: 'Exporter la liste complète des utilisateurs (profils, statuts)',
      endpoint: 'users',
      filename: 'utilisateurs',
      color: '#FF9800'
    }
  ];

  const formatOptions = [
    {
      key: 'csv',
      label: 'CSV',
      icon: <TableChart />,
      description: 'Format tableur simple',
      color: '#4CAF50'
    },
    {
      key: 'excel',
      label: 'Excel',
      icon: <Description />,
      description: 'Format Microsoft Excel',
      color: '#2196F3'
    },
    {
      key: 'pdf',
      label: 'PDF',
      icon: <PictureAsPdf />,
      description: 'Document formaté et imprimable',
      color: '#FF9800'
    }
  ];

  // Données d'exemple pour l'historique
  const recentExports = [
    {
      type: 'Contributions',
      format: 'Excel',
      date: new Date().toLocaleDateString('fr-FR'),
      status: 'success'
    },
    {
      type: 'Utilisateurs',
      format: 'PDF',
      date: new Date(Date.now() - 86400000).toLocaleDateString('fr-FR'),
      status: 'success'
    },
    {
      type: 'Retraits',
      format: 'CSV',
      date: new Date(Date.now() - 172800000).toLocaleDateString('fr-FR'),
      status: 'success'
    }
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#4CA260', fontWeight: 'bold' }}>
        Exports de Données
      </Typography>

      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Exportez vos données dans différents formats pour analyse et archivage
      </Typography>

      {/* Informations générales */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
          Tous les exports sont générés en temps réel. Les données sensibles sont automatiquement masquées pour respecter la confidentialité.
        </Typography>
      </Alert>

      {/* Sections d'export */}
      <Grid container spacing={3}>
        {exportSections.map((section) => (
          <Grid item xs={12} md={6} lg={4} key={section.endpoint}>
            <Card sx={{ height: '100%', border: `2px solid ${section.color}20` }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom sx={{ color: section.color, fontWeight: 'bold' }}>
                  {section.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, flexGrow: 1 }}>
                  {section.description}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {formatOptions.map((format) => {
                    const key = `${section.endpoint}_${format.key}`;
                    const isExporting = exporting[key];

                    return (
                      <Button
                        key={format.key}
                        variant="contained"
                        startIcon={format.icon}
                        onClick={() => exportData(section.endpoint, format.key)}
                        disabled={isExporting}
                        sx={{
                          backgroundColor: format.color,
                          '&:hover': {
                            backgroundColor: format.color,
                            opacity: 0.8
                          },
                          justifyContent: 'flex-start'
                        }}
                        fullWidth
                      >
                        {isExporting ? '⏳ Export...' : `Télécharger ${format.label}`}
                      </Button>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Informations détaillées */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#4CA260' }}>
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            Informations sur les formats
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#4CAF50' }}>
                📊 CSV (Comma Separated Values)
              </Typography>
              <Typography variant="body2">
                • Format simple pour les tableurs<br/>
                • Compatible avec Excel, Google Sheets<br/>
                • Idéal pour l'analyse de données<br/>
                • Taille maximale: 10 000 lignes
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#2196F3' }}>
                📋 Excel (.xlsx)
              </Typography>
              <Typography variant="body2">
                • Format Microsoft Excel natif<br/>
                • Mise en forme automatique<br/>
                • Graphiques et tableaux croisés<br/>
                • Idéal pour les présentations
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#FF9800' }}>
                📄 PDF (Portable Document Format)
              </Typography>
              <Typography variant="body2">
                • Document formaté et imprimable<br/>
                • Mise en page professionnelle<br/>
                • Idéal pour l'archivage<br/>
                • Universellement lisible
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Historique des exports */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#4CA260' }}>
            <History sx={{ mr: 1, verticalAlign: 'middle' }} />
            Exports récents
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Format</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentExports.map((export_, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{export_.type}</TableCell>
                    <TableCell>{export_.format}</TableCell>
                    <TableCell>{export_.date}</TableCell>
                    <TableCell>
                      <Chip
                        label="Succès"
                        color="success"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Conseils d'utilisation */}
      <Alert severity="warning" sx={{ mt: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          💡 Conseils d'utilisation:
        </Typography>
        <Typography variant="body2">
          • Préférez les exports CSV pour de gros volumes de données<br/>
          • Utilisez Excel pour des analyses complexes avec formules<br/>
          • Choisissez PDF pour l'archivage et le partage officiel<br/>
          • Les exports volumineux peuvent prendre quelques secondes
        </Typography>
      </Alert>
    </Box>
  );
};

export default AdminExports;