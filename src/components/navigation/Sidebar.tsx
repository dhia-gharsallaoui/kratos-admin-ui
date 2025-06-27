import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardOutlined, PeopleOutlined, SecurityOutlined, DescriptionOutlined, LogoutOutlined } from '@mui/icons-material';
import { Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Box } from '@mui/material';
import { useLogout, useUser } from '@/features/auth';
import { UserRole } from '@/features/auth';

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
    title: 'Schemas',
    path: '/schemas',
    icon: <DescriptionOutlined />,
    requiredRole: UserRole.VIEWER,
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
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', ml: 1 }}>
          Kratos Admin
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ flexGrow: 1, py: 2 }}>
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
