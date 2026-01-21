import {
	Apps,
	ChevronLeft,
	DashboardOutlined,
	DescriptionOutlined,
	LogoutOutlined,
	MailOutlined,
	PeopleOutlined,
	SecurityOutlined,
} from "@mui/icons-material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from "@/components/ui";
import { UserRole, useLogout, useUser } from "@/features/auth";
import { useHydraEnabled } from "@/features/settings/hooks/useSettings";
import { useTheme } from "@/providers/ThemeProvider";
import { alpha, gradientColors, gradients } from "@/theme";

interface NavItem {
	title: string;
	path: string;
	icon: React.ReactNode;
	requiredRole?: UserRole;
}

const mainNavItems: NavItem[] = [
	{
		title: "Dashboard",
		path: "/dashboard",
		icon: <DashboardOutlined />,
		requiredRole: UserRole.VIEWER,
	},
	{
		title: "Identities",
		path: "/identities",
		icon: <PeopleOutlined />,
		requiredRole: UserRole.ADMIN,
	},
	{
		title: "Sessions",
		path: "/sessions",
		icon: <SecurityOutlined />,
		requiredRole: UserRole.ADMIN,
	},
	{
		title: "Messages",
		path: "/messages",
		icon: <MailOutlined />,
		requiredRole: UserRole.ADMIN,
	},
	{
		title: "Schemas",
		path: "/schemas",
		icon: <DescriptionOutlined />,
		requiredRole: UserRole.VIEWER,
	},
];

const hydraNavItems: NavItem[] = [
	{
		title: "OAuth2 Clients",
		path: "/clients",
		icon: <Apps />,
		// requiredRole: UserRole.ADMIN, // Temporarily removed for testing
	},
	// OAuth2 Tokens - Disabled for now, will be implemented later
	// {
	//   title: 'OAuth2 Tokens',
	//   path: '/tokens',
	//   icon: <Token />,
	//   // requiredRole: UserRole.ADMIN,
	// },
];

interface SidebarProps {
	open: boolean;
	onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
	const pathname = usePathname();
	const logout = useLogout();
	const user = useUser();
	const { theme: currentTheme } = useTheme();
	const hydraEnabled = useHydraEnabled();

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
	// Only show Hydra nav items when Hydra is enabled
	const filteredHydraNavItems = hydraEnabled ? hydraNavItems.filter((item) => hasRequiredRole(item.requiredRole)) : [];

	return (
		<Drawer
			variant="persistent"
			open={open}
			onClose={onClose}
			sx={{
				width: open ? 280 : 0,
				flexShrink: 0,
				"& .MuiDrawer-paper": {
					width: 280,
					boxSizing: "border-box",
					transition: "transform 0.3s ease, background 0.3s ease",
					background:
						currentTheme === "dark" ? "linear-gradient(180deg, #1e1e1e 0%, #1a1a1a 100%)" : "linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)",
					borderRight: `1px solid ${currentTheme === "dark" ? alpha.primary[20] : alpha.primary[10]}`,
					overflowX: "hidden",
				},
			}}
		>
			<Toolbar
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					px: 2,
					background: currentTheme === "dark" ? gradients.subtle : gradients.subtle,
				}}
			>
				<Typography
					variant="heading"
					size="lg"
					sx={{
						fontWeight: 800,
						background: gradients.text,
						backgroundClip: "text",
						WebkitBackgroundClip: "text",
						WebkitTextFillColor: "transparent",
					}}
				>
					Ory Admin
				</Typography>
				<IconButton
					variant="action"
					onClick={onClose}
					sx={{
						background: alpha.primary[10],
						"&:hover": {
							background: alpha.primary[20],
						},
					}}
				>
					<ChevronLeft />
				</IconButton>
			</Toolbar>
			<Divider
				sx={{
					borderColor: currentTheme === "dark" ? alpha.primary[30] : alpha.primary[10],
				}}
			/>
			<List sx={{ px: 1.5, py: 2 }}>
				{[...filteredMainNavItems, ...filteredHydraNavItems].map((item) => {
					const active = isActive(item.path);
					return (
						<ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
							<ListItemButton
								component={Link}
								href={item.path}
								selected={active}
								sx={{
									borderRadius: 2,
									py: 1.5,
									transition: "all 0.3s ease",
									"&.Mui-selected": {
										background: gradients.normal,
										color: "white",
										boxShadow: `0 4px 15px ${alpha.primary[30]}`,
										"&:hover": {
											background: gradients.reversed,
										},
										"& .MuiListItemIcon-root": {
											color: "white",
										},
									},
									"&:hover": {
										background: active ? gradients.reversed : currentTheme === "dark" ? alpha.primary[20] : alpha.primary[10],
										transform: "translateX(4px)",
									},
								}}
							>
								<ListItemIcon
									sx={{
										minWidth: 40,
										color: active ? "white" : gradientColors.primary,
										transition: "all 0.3s ease",
									}}
								>
									{item.icon}
								</ListItemIcon>
								<ListItemText
									primary={item.title}
									primaryTypographyProps={{
										fontWeight: active ? 600 : 500,
									}}
								/>
							</ListItemButton>
						</ListItem>
					);
				})}
			</List>
			<Box sx={{ flexGrow: 1 }} />
			<Divider
				sx={{
					borderColor: currentTheme === "dark" ? alpha.primary[30] : alpha.primary[10],
				}}
			/>
			<List sx={{ px: 1.5, py: 2 }}>
				<ListItem disablePadding>
					<ListItemButton
						onClick={logout}
						sx={{
							borderRadius: 2,
							py: 1.5,
							transition: "all 0.3s ease",
							"&:hover": {
								background: "linear-gradient(135deg, rgba(245, 87, 108, 0.1) 0%, rgba(240, 147, 251, 0.1) 100%)",
								transform: "translateX(4px)",
							},
						}}
					>
						<ListItemIcon sx={{ minWidth: 40, color: "#f5576c" }}>
							<LogoutOutlined />
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
	);
}

export default Sidebar;
