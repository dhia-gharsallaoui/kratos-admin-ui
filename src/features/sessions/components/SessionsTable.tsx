import { AccessTime, Warning } from "@mui/icons-material";
import React, { useMemo } from "react";
import { StatusBadge } from "@/components";
import { Box, DataTable, type DataTableColumn, Tooltip, Typography } from "@/components/ui";
import { formatDate } from "@/lib/date-utils";

interface SessionsTableProps {
	sessions: any[];
	isLoading: boolean;
	isFetchingNextPage: boolean;
	searchQuery: string;
	onSessionClick?: (sessionId: string) => void;
}

// Helper functions for session data processing
const getIdentityDisplay = (session: any): string => {
	if (!session.identity) return "Unknown";
	const traits = session.identity.traits;
	if (!traits) return session.identity.id;
	return traits.email || traits.username || session.identity.id;
};

const getTimeRemaining = (expiresAt: string): string | null => {
	if (!expiresAt) return null;

	const now = new Date();
	const expiry = new Date(expiresAt);
	const diff = expiry.getTime() - now.getTime();

	if (diff <= 0) return "Expired";

	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

	if (days > 0) return `${days}d ${hours}h remaining`;
	if (hours > 0) return `${hours}h ${minutes}m remaining`;
	return `${minutes}m remaining`;
};

export const SessionsTable: React.FC<SessionsTableProps> = React.memo(
	({ sessions, isLoading, isFetchingNextPage: _isFetchingNextPage, searchQuery, onSessionClick }) => {
		// Define columns for the DataTable
		const columns: DataTableColumn[] = useMemo(
			() => [
				{
					field: "id",
					headerName: "Session ID",
					minWidth: 200,
					maxWidth: 250,
					renderCell: (value: string) => (
						<Tooltip content={value}>
							<Typography
								variant="code"
								sx={{
									overflow: "hidden",
									textOverflow: "ellipsis",
								}}
							>
								{value.substring(0, 8)}...
							</Typography>
						</Tooltip>
					),
				},
				{
					field: "identity",
					headerName: "Identity",
					minWidth: 200,
					maxWidth: 250,
					renderCell: (_: any, session: any) => (
						<Typography
							variant="body"
							sx={{
								fontWeight: 500,
								overflow: "hidden",
								textOverflow: "ellipsis",
							}}
						>
							{getIdentityDisplay(session)}
						</Typography>
					),
				},
				{
					field: "active",
					headerName: "Status",
					minWidth: 120,
					renderCell: (value: boolean) => <StatusBadge status={value ? "active" : "inactive"} label={value ? "Active" : "Inactive"} showIcon />,
				},
				{
					field: "authenticated_at",
					headerName: "Authenticated At",
					minWidth: 180,
					renderCell: (value: string) =>
						value ? (
							<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
								<AccessTime fontSize="small" color="action" />
								<Typography variant="body">{formatDate(value)}</Typography>
							</Box>
						) : (
							"N/A"
						),
				},
				{
					field: "expires_at",
					headerName: "Expires",
					minWidth: 160,
					renderCell: (value: string) => {
						if (!value) return "N/A";

						const timeRemaining = getTimeRemaining(value);
						const isExpiringSoon = timeRemaining?.includes("m remaining");

						return (
							<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
								{isExpiringSoon && <Warning fontSize="small" color="warning" />}
								<Typography variant="body" color={isExpiringSoon ? "warning.main" : "text.primary"} fontWeight={isExpiringSoon ? 500 : 400}>
									{timeRemaining}
								</Typography>
							</Box>
						);
					},
				},
			],
			[],
		);

		const handleRowClick = (session: any) => {
			onSessionClick?.(session.id);
		};

		const emptyStateMessage = searchQuery ? "Try a different search term" : "Sessions will appear here when users log in";

		return (
			<DataTable
				data={sessions}
				columns={columns}
				keyField="id"
				loading={isLoading}
				searchable={false} // Search is handled externally
				onRowClick={handleRowClick}
				emptyMessage={emptyStateMessage}
			/>
		);
	},
);

SessionsTable.displayName = "SessionsTable";
