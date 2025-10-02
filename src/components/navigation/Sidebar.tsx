import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardOutlined, PeopleOutlined, SecurityOutlined, DescriptionOutlined, LogoutOutlined, MailOutlined, Apps, VpnKey, Token } from '@mui/icons-material';
import { Divider, Drawer } from '@mui/material';
import { useLogout, useUser } from '@/features/auth';
import { UserRole } from '@/features/auth';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@/components/ui';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  requiredRole?: UserRole;
}

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardOutlined />,
    requiredRole: UserRole.VIEWER,
  },
  {
    title: 'Identities',
    path: '/identities',
    icon: <PeopleOutlined />,
    requiredRole: UserRole.ADMIN,
  },
  {
    title: 'Sessions',
    path: '/sessions',
    icon: <SecurityOutlined />,
    requiredRole: UserRole.ADMIN,
  },
  {
    title: 'Messages',
    path: '/messages',
    icon: <MailOutlined />,
    requiredRole: UserRole.ADMIN,
  },
  {
    title: 'Schemas',
    path: '/schemas',
    icon: <DescriptionOutlined />,
    requiredRole: UserRole.VIEWER,
  },
];

const hydraNavItems: NavItem[] = [
  {
    title: 'OAuth2 Clients',
    path: '/oauth2-clients',
    icon: <Apps />,
    // requiredRole: UserRole.ADMIN, // Temporarily removed for testing
  },
  {
    title: 'OAuth2 Tokens',
    path: '/oauth2-tokens',
    icon: <Token />,
    // requiredRole: UserRole.ADMIN, // Temporarily removed for testing
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const logout = useLogout();
  const user = useUser();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const hasRequiredRole = (requiredRole?: UserRole) => {
    if (!requiredRole) return true;
    if (!user) return false;

    // Admin can access everything
    if (user.role === UserRole.ADMIN) return true;

    // Viewer can only access viewer-level items
    return user.role === requiredRole;
  };

  const filteredMainNavItems = mainNavItems.filter((item) => hasRequiredRole(item.requiredRole));
  const filteredHydraNavItems = hydraNavItems.filter((item) => hasRequiredRole(item.requiredRole));

  return (
    <Drawer
      variant="permanent"
      open={true}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          border: 'none',
          backgroundColor: '#f9fafc',
          borderRight: '1px solid #e6e8f0',
        },
      }}
    >
      <Box sx={{ px: 2, py: 3 }}>
        <Typography variant="heading" size="xl" sx={{ fontWeight: 'bold', ml: 1 }}>
          Ory Admin
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ flexGrow: 1, py: 2 }}>
        {/* Kratos Section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="label" sx={{ px: 2, color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', display: 'block' }}>
            Kratos (Identity)
          </Typography>
          <List>
            {filteredMainNavItems.map((item) => (
              <ListItem key={item.title} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.path}
                  selected={isActive(item.path)}
                  sx={{
                    py: 1.5,
                    borderRadius: 1,
                    mx: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.50',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.100',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.title} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Hydra Section */}
        {filteredHydraNavItems.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="label" sx={{ px: 2, color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', display: 'block' }}>
              Hydra (OAuth2)
            </Typography>
            <List>
              {filteredHydraNavItems.map((item) => (
                <ListItem key={item.title} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={item.path}
                    selected={isActive(item.path)}
                    sx={{
                      py: 1.5,
                      borderRadius: 1,
                      mx: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.50',
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.100',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'primary.main',
                        },
                      },
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.title} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
      <Box sx={{ mb: 2 }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={logout}
              sx={{
                py: 1.5,
                borderRadius: 1,
                mx: 1,
                color: 'grey.700',
              }}
            >
              <ListItemIcon>
                <LogoutOutlined />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}

export default Sidebar;
