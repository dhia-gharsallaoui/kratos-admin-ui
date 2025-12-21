import { AdminPanelSettings, Logout as LogoutIcon, Menu as MenuIcon, Person as PersonIcon, RemoveRedEye } from "@mui/icons-material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AppBar, Avatar, Box, Chip, Divider, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography } from "@/components/ui";
import { UserRole, useLogout, useUser } from "@/features/auth";

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
				boxShadow: "none",
				backgroundColor: "white",
				color: "text.primary",
				borderBottom: "1px solid #e6e8f0",
				zIndex: (theme) => theme.zIndex.drawer + 1,
			}}
		>
			<Toolbar>
				<IconButton
					variant="action"
					aria-label="open drawer"
					onClick={onSidebarToggle}
					sx={{
						mr: 2,
						display: { sm: "none" },
						color: "inherit",
					}}
				>
					<MenuIcon />
				</IconButton>
				<Typography variant="heading" size="lg" sx={{ display: { xs: "none", sm: "block" } }}>
					Ory Admin
				</Typography>
				<Box sx={{ flexGrow: 1 }} />
				<Box sx={{ display: "flex", alignItems: "center" }}>
					{user && (
						<Chip
							variant={user.role === UserRole.ADMIN ? "role" : "tag"}
							label={user.displayName}
							icon={user.role === UserRole.ADMIN ? <AdminPanelSettings fontSize="small" /> : <RemoveRedEye fontSize="small" />}
							sx={{ mr: 2, display: { xs: "none", sm: "flex" } }}
						/>
					)}
					<Tooltip content="Account">
						<IconButton
							variant="action"
							onClick={handleOpenUserMenu}
							aria-label="account of current user"
							aria-haspopup="true"
							sx={{ color: "inherit" }}
						>
							<Avatar
								sx={{
									width: 32,
									height: 32,
									bgcolor: user?.role === UserRole.ADMIN ? "primary.main" : "secondary.main",
								}}
							>
								{user?.displayName.charAt(0) || <PersonIcon />}
							</Avatar>
						</IconButton>
					</Tooltip>
					<Menu
						sx={{ mt: "45px" }}
						id="menu-appbar"
						anchorEl={anchorElUser}
						anchorOrigin={{
							vertical: "top",
							horizontal: "right",
						}}
						keepMounted
						transformOrigin={{
							vertical: "top",
							horizontal: "right",
						}}
						open={Boolean(anchorElUser)}
						onClose={handleCloseUserMenu}
					>
						{user && (
							<Box sx={{ px: 2, py: 1 }}>
								<Typography variant="label" sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}>
									{user.displayName}
								</Typography>
								<Typography variant="body" size="sm" sx={{ display: "block", color: "text.secondary" }}>
									{user.email}
								</Typography>
								<Chip variant={user.role === UserRole.ADMIN ? "role" : "tag"} label={user.role} sx={{ mt: 1 }} />
							</Box>
						)}
						<Divider />
						<MenuItem onClick={handleCloseUserMenu} component={Link} href="/profile" disabled={pathname === "/profile"}>
							<PersonIcon fontSize="small" sx={{ mr: 1 }} />
							<Typography variant="body">Profile</Typography>
						</MenuItem>
						<MenuItem onClick={handleLogout}>
							<LogoutIcon fontSize="small" sx={{ mr: 1 }} />
							<Typography variant="body">Logout</Typography>
						</MenuItem>
					</Menu>
				</Box>
			</Toolbar>
		</AppBar>
	);
}

export default Header;
