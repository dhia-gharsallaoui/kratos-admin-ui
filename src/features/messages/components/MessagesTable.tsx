import { Cancel, CheckCircle, Error as ErrorIcon, Mail, Schedule, Sms } from "@mui/icons-material";
import React, { useMemo } from "react";
import { StatusBadge } from "@/components";
import { Box, DataTable, type DataTableColumn, Typography } from "@/components/ui";
import { formatDate } from "@/lib/date-utils";
import type { CourierMessageStatus } from "@/services/kratos/endpoints/courier";

interface MessagesTableProps {
	messages: any[];
	isLoading: boolean;
	onMessageClick?: (messageId: string) => void;
}

const getStatusIcon = (status: CourierMessageStatus) => {
	switch (status) {
		case "sent":
			return <CheckCircle color="success" fontSize="small" />;
		case "queued":
			return <Schedule color="info" fontSize="small" />;
		case "processing":
			return <Schedule color="warning" fontSize="small" />;
		case "abandoned":
			return <Cancel color="error" fontSize="small" />;
		default:
			return <ErrorIcon color="warning" fontSize="small" />;
	}
};

const _getStatusColor = (status: CourierMessageStatus) => {
	switch (status) {
		case "sent":
			return "success";
		case "queued":
			return "info";
		case "processing":
			return "warning";
		case "abandoned":
			return "error";
		default:
			return "default";
	}
};

const getMessageTypeIcon = (type: string) => {
	switch (type) {
		case "email":
			return <Mail fontSize="small" />;
		case "sms":
			return <Sms fontSize="small" />;
		default:
			return <Mail fontSize="small" />;
	}
};

export const MessagesTable: React.FC<MessagesTableProps> = React.memo(({ messages, isLoading, onMessageClick }) => {
	const columns: DataTableColumn[] = useMemo(
		() => [
			{
				field: "type",
				headerName: "Type",
				minWidth: 120,
				renderCell: (value: string) => (
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						{getMessageTypeIcon(value)}
						<Typography variant="body" sx={{ textTransform: "capitalize" }}>
							{value}
						</Typography>
					</Box>
				),
			},
			{
				field: "recipient",
				headerName: "Recipient",
				minWidth: 200,
				maxWidth: 250,
				renderCell: (value: string) => (
					<Typography
						variant="body"
						sx={{
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{value}
					</Typography>
				),
			},
			{
				field: "subject",
				headerName: "Subject",
				minWidth: 250,
				maxWidth: 300,
				renderCell: (value: string) => (
					<Typography
						variant="body"
						sx={{
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{value || "No subject"}
					</Typography>
				),
			},
			{
				field: "status",
				headerName: "Status",
				minWidth: 150,
				renderCell: (value: CourierMessageStatus) => (
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						{getStatusIcon(value)}
						<StatusBadge status={value === "sent" ? "active" : value === "queued" ? "pending" : "inactive"} label={value} showIcon={false} />
					</Box>
				),
			},
			{
				field: "template_type",
				headerName: "Template",
				minWidth: 160,
				renderCell: (value: string) => <Typography variant="code">{value || "Unknown"}</Typography>,
			},
			{
				field: "created_at",
				headerName: "Created",
				minWidth: 180,
				renderCell: (value: string) => <Typography variant="body">{formatDate(value)}</Typography>,
			},
			{
				field: "send_count",
				headerName: "Send Count",
				minWidth: 120,
				renderCell: (value: number) => <Typography variant="body">{value || 0}</Typography>,
			},
		],
		[],
	);

	const handleRowClick = (message: any) => {
		onMessageClick?.(message.id);
	};

	return (
		<DataTable
			data={messages}
			columns={columns}
			keyField="id"
			loading={isLoading}
			searchable={false}
			onRowClick={handleRowClick}
			emptyMessage="No messages found"
		/>
	);
});

MessagesTable.displayName = "MessagesTable";
