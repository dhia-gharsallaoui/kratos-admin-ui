import React, { ReactNode, useState } from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, useMediaQuery, useTheme as useMuiTheme, Avatar, Menu, MenuItem, Tooltip } from '@mui/material';
import { Dashboard, Person, Schema, Menu as MenuIcon, ChevronLeft, ChevronRight, DarkMode, LightMode, People, Logout } from '@mui/icons-material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/providers/ThemeProvider';
import { useUser, useLogout } from '@/features/auth/hooks/useAuth';
import { UserRole } from '@/features/auth';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import Footer from './Footer';

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
    { text: 'Identities', icon: <People />, path: '/identities', adminOnly: true },
    { text: 'Schemas', icon: <Schema />, path: '/schemas' },
    { text: 'Sessions', icon: <Person />, path: '/sessions', adminOnly: true },
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
  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || (user && user.role === UserRole.ADMIN)
  );

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: open ? { sm: `calc(100% - ${drawerWidth}px)` } : '100%',
            ml: open ? { sm: `${drawerWidth}px` } : 0,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Kratos Admin
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Toggle theme">
                <IconButton color="inherit" sx={{ mr: 2 }} onClick={toggleTheme}>
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
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
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
              >
                <MenuItem 
                  onClick={handleClose} 
                  component={Link} 
                  href="/profile"
                  disabled={pathname === '/profile'}
                >
                  <Person fontSize="small" sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout fontSize="small" sx={{ mr: 1 }} />
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
            },
          }}
        >
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: [1],
            }}
          >
            <Typography variant="h6" noWrap component="div">
              Kratos Admin
            </Typography>
            <IconButton onClick={handleDrawerToggle}>
              {open ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>
          </Toolbar>
          <Divider />
          <List>
            {filteredMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.path}
                  selected={pathname === item.path}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary="Logout" />
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
            backgroundColor: 'background.default',
            transition: 'all 0.3s ease',
          }}
        >
          <Toolbar />
          <Box sx={{ flexGrow: 1, p: 3 }}>
            {children}
          </Box>
          <Footer />
        </Box>
      </Box>
    </ProtectedRoute>
  );
};

export default AdminLayout;
