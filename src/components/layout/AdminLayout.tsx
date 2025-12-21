import { DarkMode, GitHub, LightMode, Logout, Menu as MenuIcon, Person, Settings } from "@mui/icons-material";
import { CssBaseline, useMediaQuery, useTheme as useMuiTheme } from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { type ReactNode, useState } from "react";
import { Sidebar } from "@/components/navigation/Sidebar";
import { AppBar, Avatar, Box, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography } from "@/components/ui";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { useLogout, useUser } from "@/features/auth/hooks/useAuth";
import { useTheme } from "@/providers/ThemeProvider";
import { gradientColors, gradients } from "@/theme";

const drawerWidth = 280;

interface AdminLayoutProps {
	children: ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
	const [open, setOpen] = useState(true);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const muiTheme = useMuiTheme();
	const _isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
	const pathname = usePathname();
	const { theme: currentTheme, toggleTheme } = useTheme();
	const user = useUser();
	const logout = useLogout();
	const router = useRouter();

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
		router.push("/login");
	};

	return (
		<ProtectedRoute>
			<Box sx={{ display: "flex" }}>
				<CssBaseline />
				<AppBar
					position="fixed"
					elevation={0}
					sx={{
						width: {
							xs: "100%",
							sm: open ? `calc(100% - ${drawerWidth}px)` : "100%",
						},
						ml: { xs: 0, sm: open ? `${drawerWidth}px` : 0 },
						background: gradients.normal,
						backdropFilter: "blur(20px)",
						boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
						transition: "width 0.3s ease, margin-left 0.3s ease",
					}}
				>
					<Toolbar sx={{ justifyContent: "space-between" }}>
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<IconButton
								color="inherit"
								aria-label="toggle drawer"
								onClick={handleDrawerToggle}
								edge="start"
								sx={{
									mr: 2,
									background: "rgba(255,255,255,0.1)",
									"&:hover": {
										background: "rgba(255,255,255,0.2)",
									},
								}}
							>
								<MenuIcon />
							</IconButton>
							<Typography
								variant="heading"
								size="lg"
								sx={{
									display: { xs: "none", sm: "block" },
									fontWeight: 700,
									letterSpacing: 0.5,
									color: currentTheme === "dark" ? "#ffffff" : "rgba(255, 255, 255, 0.95)",
								}}
							>
								Ory Admin
							</Typography>
						</Box>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<Tooltip content="GitHub Repository">
								<IconButton
									variant="action"
									sx={{
										color: "inherit",
										background: "rgba(255,255,255,0.1)",
										"&:hover": {
											background: "rgba(255,255,255,0.2)",
											transform: "translateY(-2px)",
										},
										transition: "all 0.2s ease",
									}}
									onClick={() => window.open("https://github.com/dhia-gharsallaoui/kratos-admin-ui", "_blank")}
								>
									<GitHub />
								</IconButton>
							</Tooltip>
							<Tooltip content="Settings">
								<IconButton
									variant="action"
									component={Link}
									href="/settings"
									sx={{
										color: "inherit",
										background: "rgba(255,255,255,0.1)",
										"&:hover": {
											background: "rgba(255,255,255,0.2)",
											transform: "translateY(-2px)",
										},
										transition: "all 0.2s ease",
									}}
								>
									<Settings />
								</IconButton>
							</Tooltip>
							<Tooltip content="Toggle theme">
								<IconButton
									variant="action"
									onClick={toggleTheme}
									sx={{
										color: "inherit",
										background: "rgba(255,255,255,0.1)",
										"&:hover": {
											background: "rgba(255,255,255,0.2)",
											transform: "translateY(-2px)",
										},
										transition: "all 0.2s ease",
									}}
								>
									{currentTheme === "dark" ? <LightMode /> : <DarkMode />}
								</IconButton>
							</Tooltip>
							<IconButton
								variant="action"
								aria-label="account of current user"
								aria-controls="menu-appbar"
								aria-haspopup="true"
								onClick={handleMenu}
								sx={{
									color: "inherit",
									background: "rgba(255,255,255,0.15)",
									"&:hover": {
										background: "rgba(255,255,255,0.25)",
									},
								}}
							>
								<Avatar
									sx={{
										width: 36,
										height: 36,
										bgcolor: "rgba(255,255,255,0.9)",
										color: gradientColors.primary,
										fontWeight: 700,
										border: "2px solid rgba(255,255,255,0.5)",
									}}
								>
									{user?.displayName?.charAt(0) || <Person />}
								</Avatar>
							</IconButton>
							<Menu
								id="menu-appbar"
								anchorEl={anchorEl}
								anchorOrigin={{
									vertical: "top",
									horizontal: "right",
								}}
								keepMounted
								transformOrigin={{
									vertical: "top",
									horizontal: "right",
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
									disabled={pathname === "/profile"}
									sx={{
										py: 1.5,
										"&:hover": {
											background: gradients.subtle,
										},
									}}
								>
									<Person fontSize="small" sx={{ mr: 1.5, color: gradientColors.primary }} />
									Profile
								</MenuItem>
								<MenuItem
									onClick={handleLogout}
									sx={{
										py: 1.5,
										"&:hover": {
											background: "linear-gradient(135deg, rgba(245, 87, 108, 0.1) 0%, rgba(240, 147, 251, 0.1) 100%)",
										},
									}}
								>
									<Logout fontSize="small" sx={{ mr: 1.5, color: "#f5576c" }} />
									Logout
								</MenuItem>
							</Menu>
						</Box>
					</Toolbar>
				</AppBar>
				<Sidebar open={open} onClose={handleDrawerToggle} />
				<Box
					component="main"
					sx={{
						flexGrow: 1,
						display: "flex",
						flexDirection: "column",
						width: "100%",
						minHeight: "100vh",
						background:
							currentTheme === "dark" ? "linear-gradient(180deg, #121212 0%, #0a0a0a 100%)" : "linear-gradient(180deg, #f5f7fa 0%, #e9ecef 100%)",
						transition: "background 0.3s ease",
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
