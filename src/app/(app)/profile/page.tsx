'use client';

import { useState } from 'react';
import { Box, Container, Typography, Paper, Avatar, Grid, Card, CardContent, Divider, Button, TextField, Chip, Alert, Snackbar } from '@mui/material';
import { Edit, Save, Cancel, Person, Email, Badge, Lock } from '@mui/icons-material';
import { useUser } from '@/features/auth/hooks/useAuth';
import { UserRole } from '@/features/auth';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function ProfilePage() {
  const user = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [showSnackbar, setShowSnackbar] = useState(false);

  if (!user) {
    return null; // Protected by AdminLayout
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDisplayName(user.displayName);
    setEmail(user.email);
    setIsEditing(false);
  };

  const handleSave = () => {
    // In a real application, this would update the user profile
    // For now, we'll just show a success message
    setIsEditing(false);
    setShowSnackbar(true);
  };

  return (
    <AdminLayout>
      <Container maxWidth="md">
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              mb: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{
                color: 'text.primary',
                fontWeight: 700,
              }}
            >
              User Profile
            </Typography>
            {!isEditing ? (
              <Button 
                variant="contained" 
                startIcon={<Edit />} 
                onClick={handleEdit}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <Box>
                <Button 
                  variant="outlined" 
                  startIcon={<Cancel />} 
                  onClick={handleCancel} 
                  sx={{ 
                    mr: 1,
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#764ba2',
                      background: 'rgba(102, 126, 234, 0.1)',
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<Save />} 
                  onClick={handleSave}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                    },
                  }}
                >
                  Save
                </Button>
              </Box>
            )}
          </Box>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                    bgcolor: user.role === UserRole.ADMIN ? 'primary.main' : 'secondary.main',
                    mb: 2,
                  }}
                >
                  {user.displayName.charAt(0)}
                </Avatar>

                <Chip label={user.role} color={user.role === UserRole.ADMIN ? 'primary' : 'secondary'} sx={{ mb: 1 }} />

                <Typography variant="body2" color="text.secondary">
                  Account created: March 1, 2025
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1 }} /> Personal Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Badge sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Display Name
                        </Typography>
                      </Box>
                      {isEditing ? (
                        <TextField fullWidth value={displayName} onChange={(e) => setDisplayName(e.target.value)} size="small" />
                      ) : (
                        <Typography variant="body1">{user.displayName}</Typography>
                      )}
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Email sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Email Address
                        </Typography>
                      </Box>
                      {isEditing ? (
                        <TextField fullWidth value={email} onChange={(e) => setEmail(e.target.value)} size="small" />
                      ) : (
                        <Typography variant="body1">{user.email}</Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Lock sx={{ mr: 1 }} /> Account Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Person sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Username
                        </Typography>
                      </Box>
                      <Typography variant="body1">{user.username}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Badge sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Role
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {user.role}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
}
