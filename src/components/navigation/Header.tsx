import { useState } from 'react';
import { 
  AppBar, 
  Avatar, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Toolbar, 
  Tooltip, 
  Typography,
  Chip,
  Divider
} from '@mui/material';
import { 
  Person as PersonIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  AdminPanelSettings,
  RemoveRedEye
} from '@mui/icons-material';
import { useUser, useLogout } from '@/features/auth';
import { UserRole } from '@/features/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onSidebarToggle: () => void;
}

export function Header({ onSidebarToggle }: HeaderProps) {
  const user = useUser();
  const logout = useLogout();
  const pathname = usePathname();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        boxShadow: 'none',
        backgroundColor: 'white',
        color: 'text.primary',
        borderBottom: '1px solid #e6e8f0',
        zIndex: (theme) => theme.zIndex.drawer + 1 
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onSidebarToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
          Ory Kratos Admin
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {user && (
            <Chip
              icon={user.role === UserRole.ADMIN ? <AdminPanelSettings fontSize="small" /> : <RemoveRedEye fontSize="small" />}
              label={user.displayName}
              variant="outlined"
              color={user.role === UserRole.ADMIN ? "primary" : "secondary"}
              size="small"
              sx={{ mr: 2, display: { xs: 'none', sm: 'flex' } }}
            />
          )}
          <Tooltip title="Account">
            <IconButton
              onClick={handleOpenUserMenu}
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              color="inherit"
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: user?.role === UserRole.ADMIN ? 'primary.main' : 'secondary.main'
                }}
              >
                {user?.displayName.charAt(0) || <PersonIcon />}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {user && (
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {user.displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                <Chip
                  label={user.role}
                  size="small"
                  color={user.role === UserRole.ADMIN ? "primary" : "secondary"}
                  sx={{ mt: 1 }}
                />
              </Box>
            )}
            <Divider />
            <MenuItem 
              onClick={handleCloseUserMenu} 
              component={Link} 
              href="/profile"
              disabled={pathname === '/profile'}
            >
              <PersonIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography textAlign="center">Profile</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography textAlign="center">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
