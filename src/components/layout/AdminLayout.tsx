import React, { ReactNode, useState } from 'react';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme as useMuiTheme,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  Person,
  Schema,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  DarkMode,
  LightMode,
  People,
  Logout,
  GitHub,
  Message,
  Settings,
  Apps,
  VpnKey,
  Token,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/providers/ThemeProvider';
import { useUser, useLogout } from '@/features/auth/hooks/useAuth';
import { UserRole } from '@/features/auth';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

const drawerWidth = 240;

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const pathname = usePathname();
  const { theme: currentTheme, toggleTheme } = useTheme();
  const user = useUser();
  const logout = useLogout();
  const router = useRouter();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    {
      text: 'Identities',
      icon: <People />,
      path: '/identities',
      adminOnly: true,
    },
    { text: 'Schemas', icon: <Schema />, path: '/schemas' },
    { text: 'Sessions', icon: <Person />, path: '/sessions', adminOnly: true },
    { text: 'Messages', icon: <Message />, path: '/messages', adminOnly: true },
    { text: 'OAuth2 Clients', icon: <Apps />, path: '/oauth2-clients', adminOnly: true },
    { text: 'OAuth2 Tokens', icon: <Token />, path: '/oauth2-tokens', adminOnly: true },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    router.push('/login');
  };

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => !item.adminOnly || (user && user.role === UserRole.ADMIN));

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: open ? { sm: `calc(100% - ${drawerWidth}px)` } : '100%',
            ml: open ? { sm: `${drawerWidth}px` } : 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                color="inherit" 
                aria-label="toggle drawer" 
                onClick={handleDrawerToggle} 
                edge="start" 
                sx={{ 
                  mr: 2,
                  background: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography 
                variant="h6" 
                noWrap 
                component="div" 
                sx={{ 
                  display: { xs: 'none', sm: 'block' },
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                Ory Admin
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="GitHub Repository">
                <IconButton
                  color="inherit"
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => window.open('https://github.com/dhia-gharsallaoui/kratos-admin-ui', '_blank')}
                >
                  <GitHub />
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton 
                  color="inherit" 
                  component={Link} 
                  href="/settings"
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Settings />
                </IconButton>
              </Tooltip>
              <Tooltip title="Toggle theme">
                <IconButton 
                  color="inherit" 
                  onClick={toggleTheme}
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {currentTheme === 'dark' ? <LightMode /> : <DarkMode />}
                </IconButton>
              </Tooltip>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{ 
                  background: 'rgba(255,255,255,0.15)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.25)',
                  },
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36, 
                    bgcolor: 'rgba(255,255,255,0.9)',
                    color: '#667eea',
                    fontWeight: 700,
                    border: '2px solid rgba(255,255,255,0.5)',
                  }}
                >
                  {user?.displayName?.charAt(0) || <Person />}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    borderRadius: 2,
                    minWidth: 180,
                  },
                }}
              >
                <MenuItem 
                  onClick={handleClose} 
                  component={Link} 
                  href="/profile" 
                  disabled={pathname === '/profile'}
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    },
                  }}
                >
                  <Person fontSize="small" sx={{ mr: 1.5, color: '#667eea' }} />
                  Profile
                </MenuItem>
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(245, 87, 108, 0.1) 0%, rgba(240, 147, 251, 0.1) 100%)',
                    },
                  }}
                >
                  <Logout fontSize="small" sx={{ mr: 1.5, color: '#f5576c' }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          open={open}
          onClose={handleDrawerToggle}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)',
              borderRight: '1px solid rgba(102, 126, 234, 0.1)',
            },
          }}
        >
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            }}
          >
            <Typography 
              variant="h6" 
              noWrap 
              component="div"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Ory Admin
            </Typography>
            <IconButton 
              onClick={handleDrawerToggle}
              sx={{
                background: 'rgba(102, 126, 234, 0.1)',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.2)',
                },
              }}
            >
              {open ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>
          </Toolbar>
          <Divider sx={{ borderColor: 'rgba(102, 126, 234, 0.1)' }} />
          <List sx={{ px: 1.5, py: 2 }}>
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton 
                    component={Link} 
                    href={item.path} 
                    selected={isActive}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      transition: 'all 0.3s ease',
                      '&.Mui-selected': {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                        },
                      },
                      '&:hover': {
                        background: isActive 
                          ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
                          : 'rgba(102, 126, 234, 0.08)',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: 40,
                      color: isActive ? 'white' : '#667eea',
                      transition: 'all 0.3s ease',
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
          <Box sx={{ flexGrow: 1 }} />
          <Divider sx={{ borderColor: 'rgba(102, 126, 234, 0.1)' }} />
          <List sx={{ px: 1.5, py: 2 }}>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(245, 87, 108, 0.1) 0%, rgba(240, 147, 251, 0.1) 100%)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: '#f5576c' }}>
                  <Logout />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout"
                  primaryTypographyProps={{
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: open ? { sm: `calc(100% - ${drawerWidth}px)` } : '100%',
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #f5f7fa 0%, #e9ecef 100%)',
            transition: 'all 0.3s ease',
          }}
        >
          <Toolbar />
          <Box sx={{ flexGrow: 1, p: 3 }}>{children}</Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
};

export default AdminLayout;
