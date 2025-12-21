"use client";

import { Cancel, Edit, Lock, Person, Save } from "@mui/icons-material";
import { useState } from "react";
import { FieldDisplay } from "@/components/display";
import { ActionBar, FlexBox, PageHeader, ProtectedPage, SectionCard } from "@/components/layout";
import { Alert, Avatar, Box, Chip, Container, Grid, Paper, Snackbar, TextField, Typography } from "@/components/ui";
import { UserRole } from "@/features/auth";
import { useUser } from "@/features/auth/hooks/useAuth";

export default function ProfilePage() {
	const user = useUser();
	const [isEditing, setIsEditing] = useState(false);
	const [displayName, setDisplayName] = useState(user?.displayName || "");
	const [email, setEmail] = useState(user?.email || "");
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
		<ProtectedPage>
			<Container maxWidth="md">
				<Paper
					elevation={0}
					sx={{
						p: 4,
						borderRadius: 3,
						border: "1px solid",
						borderColor: "divider",
					}}
				>
					<PageHeader
						title="User Profile"
						actions={
							!isEditing ? (
								<ActionBar
									primaryAction={{
										label: "Edit Profile",
										icon: <Edit />,
										onClick: handleEdit,
									}}
								/>
							) : (
								<ActionBar
									primaryAction={{
										label: "Save",
										icon: <Save />,
										onClick: handleSave,
									}}
									secondaryActions={[
										{
											label: "Cancel",
											icon: <Cancel />,
											onClick: handleCancel,
											variant: "outlined",
										},
									]}
								/>
							)
						}
					/>

					<Grid container spacing={4}>
						<Grid size={{ xs: 12, md: 4 }}>
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
								}}
							>
								<Avatar
									sx={{
										width: 120,
										height: 120,
										fontSize: "3rem",
										bgcolor: user.role === UserRole.ADMIN ? "primary.main" : "secondary.main",
										mb: 2,
									}}
								>
									{user.displayName.charAt(0)}
								</Avatar>

								<Chip variant={user.role === UserRole.ADMIN ? "gradient" : "role"} label={user.role} sx={{ mb: 1 }} />

								<Typography variant="label">Account created: March 1, 2025</Typography>
							</Box>
						</Grid>

						<Grid size={{ xs: 12, md: 8 }}>
							<SectionCard
								title={
									<FlexBox align="center" gap={1}>
										<Person />
										<Typography variant="heading" size="lg">
											Personal Information
										</Typography>
									</FlexBox>
								}
								sx={{ mb: 3 }}
							>
								<Grid container spacing={2}>
									<Grid size={{ xs: 12 }}>
										{isEditing ? (
											<>
												<Typography variant="label" sx={{ mb: 1, display: "block" }}>
													Display Name
												</Typography>
												<TextField fullWidth value={displayName} onChange={(e) => setDisplayName(e.target.value)} size="small" />
											</>
										) : (
											<FieldDisplay label="Display Name" value={user.displayName} />
										)}
									</Grid>

									<Grid size={{ xs: 12 }}>
										{isEditing ? (
											<>
												<Typography variant="label" sx={{ mb: 1, display: "block" }}>
													Email Address
												</Typography>
												<TextField fullWidth value={email} onChange={(e) => setEmail(e.target.value)} size="small" />
											</>
										) : (
											<FieldDisplay label="Email Address" value={user.email} />
										)}
									</Grid>
								</Grid>
							</SectionCard>

							<SectionCard
								title={
									<FlexBox align="center" gap={1}>
										<Lock />
										<Typography variant="heading" size="lg">
											Account Information
										</Typography>
									</FlexBox>
								}
							>
								<Grid container spacing={2}>
									<Grid size={{ xs: 12 }}>
										<FieldDisplay label="Username" value={user.username} />
									</Grid>

									<Grid size={{ xs: 12 }}>
										<FieldDisplay label="Role" value={user.role} valueType="chip" chipVariant="role" />
									</Grid>
								</Grid>
							</SectionCard>
						</Grid>
					</Grid>
				</Paper>
			</Container>

			<Snackbar
				open={showSnackbar}
				autoHideDuration={6000}
				onClose={() => setShowSnackbar(false)}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert variant="toast" onClose={() => setShowSnackbar(false)} severity="success" sx={{ width: "100%" }}>
					Profile updated successfully!
				</Alert>
			</Snackbar>
		</ProtectedPage>
	);
}
