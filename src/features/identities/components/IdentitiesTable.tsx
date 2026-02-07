import { Block, CheckCircle, Clear, DeleteOutline, ExitToApp } from "@mui/icons-material";
import type { Identity } from "@ory/kratos-client";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorState, LoadingState } from "@/components/feedback";
import { Box, Button, Chip, DataTable, type DataTableColumn, IconButton, Tooltip, Typography } from "@/components/ui";
import { useIdentities, useIdentitiesSearch } from "@/features/identities/hooks";
import { useSchemas } from "@/features/schemas/hooks";
import { formatDate } from "@/lib/date-utils";
import { BulkOperationDialog } from "./BulkOperationDialog";

type BulkOpType = "delete" | "deleteSessions" | "activate" | "deactivate";

const IdentitiesTable: React.FC = React.memo(() => {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [pageSize, _setPageSize] = useState(25);
	const [pageToken, _setPageToken] = useState<string | undefined>(undefined);
	const [_pageHistory, _setPageHistory] = useState<(string | undefined)[]>([undefined]);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [bulkOperation, setBulkOperation] = useState<BulkOpType | null>(null);

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchTerm]);

	const isSearching = debouncedSearchTerm.trim().length > 0;

	const {
		data: regularData,
		isLoading: regularLoading,
		isError: regularError,
		error: regularErrorDetails,
		refetch: regularRefetch,
	} = useIdentities({
		pageSize,
		pageToken,
	});

	const { data: searchData, isLoading: searchLoading } = useIdentitiesSearch({
		pageSize,
		searchTerm: debouncedSearchTerm,
	});

	const { data: schemas } = useSchemas();

	const data = regularData;
	const isLoading = regularLoading;
	const isError = regularError;
	const error = regularErrorDetails;
	const refetch = regularRefetch;

	const baseIdentities = useMemo(() => data?.identities || [], [data?.identities]);
	const hasMore = data?.hasMore || false;
	const _nextPageToken = data?.nextPageToken;
	const searchResults = searchData?.identities || [];
	const searchComplete = !searchLoading && isSearching;

	// Helper functions
	const getSchemaName = React.useCallback(
		(identity: Identity) => {
			const schema = schemas?.find((s) => s.id === identity.schema_id);
			const schemaObj = schema?.schema as any;
			return schemaObj?.title || `Schema ${identity.schema_id?.substring(0, 8)}...` || "Unknown";
		},
		[schemas],
	);

	const getIdentifier = React.useCallback(
		(identity: Identity) => {
			const traits = identity.traits as any;
			const schema = schemas?.find((s) => s.id === identity.schema_id);
			const schemaObj = schema?.schema as any;

			if (!schemaObj?.properties?.traits?.properties) {
				return traits?.email || traits?.username || traits?.phone || "N/A";
			}

			const traitProperties = schemaObj.properties.traits.properties;
			const identifierFields: string[] = [];

			Object.keys(traitProperties).forEach((fieldName) => {
				const field = traitProperties[fieldName];
				const kratosConfig = field?.["ory.sh/kratos"];

				if (kratosConfig?.credentials) {
					const credentialTypes = Object.keys(kratosConfig.credentials);
					const hasIdentifier = credentialTypes.some((credType) => kratosConfig.credentials[credType]?.identifier === true);

					if (hasIdentifier) {
						identifierFields.push(fieldName);
					}
				}
			});

			for (const fieldName of identifierFields) {
				const value = traits?.[fieldName];
				if (value) {
					return String(value);
				}
			}

			return traits?.email || traits?.username || traits?.phone || "N/A";
		},
		[schemas],
	);

	// Apply client-side filtering
	const clientFilteredIdentities = useMemo(() => {
		if (!searchTerm.trim()) return baseIdentities;

		const searchLower = searchTerm.toLowerCase();
		return baseIdentities.filter((identity: Identity) => {
			const traits = identity.traits as any;
			const email = String(traits?.email || "");
			const firstName = String(traits?.first_name || traits?.firstName || "");
			const lastName = String(traits?.last_name || traits?.lastName || "");
			const name = String(traits?.name || "");
			const id = String(identity.id || "");
			const schemaName = getSchemaName(identity);
			const identifier = getIdentifier(identity);

			return (
				id.toLowerCase().includes(searchLower) ||
				email.toLowerCase().includes(searchLower) ||
				firstName.toLowerCase().includes(searchLower) ||
				lastName.toLowerCase().includes(searchLower) ||
				name.toLowerCase().includes(searchLower) ||
				schemaName.toLowerCase().includes(searchLower) ||
				identifier.toLowerCase().includes(searchLower)
			);
		});
	}, [baseIdentities, searchTerm, getSchemaName, getIdentifier]);

	const shouldUseSearchResults = searchComplete && isSearching;
	const displayedIdentities = shouldUseSearchResults ? searchResults : clientFilteredIdentities;

	// Define columns
	const columns: DataTableColumn[] = useMemo(
		() => [
			{
				field: "id",
				headerName: "ID",
				minWidth: 180,
				maxWidth: 200,
				renderCell: (value: string) => (
					<Tooltip title={value}>
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
				field: "identifier",
				headerName: "Identifier",
				minWidth: 220,
				renderCell: (_: any, identity: Identity) => (
					<Typography
						variant="body"
						sx={{
							fontWeight: 500,
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
					>
						{getIdentifier(identity)}
					</Typography>
				),
			},
			{
				field: "schema_id",
				headerName: "Schema",
				minWidth: 140,
				renderCell: (_: any, identity: Identity) => <Chip variant="gradient" label={getSchemaName(identity)} />,
			},
			{
				field: "state",
				headerName: "State",
				minWidth: 100,
				renderCell: (value: string) => (
					<Chip variant="status" status={value === "active" ? "active" : "inactive"} label={value === "active" ? "Active" : "Inactive"} />
				),
			},
			{
				field: "created_at",
				headerName: "Created",
				minWidth: 180,
				renderCell: (value: string) => <Typography variant="body">{formatDate(value)}</Typography>,
			},
			{
				field: "updated_at",
				headerName: "Updated",
				minWidth: 180,
				renderCell: (value: string) => <Typography variant="body">{formatDate(value)}</Typography>,
			},
		],
		[getSchemaName, getIdentifier],
	);

	const handleRowClick = (row: any) => {
		router.push(`/identities/${row.id}`);
	};

	const handleCreateNew = () => {
		router.push("/identities/create");
	};

	const handleRefresh = () => {
		refetch();
	};

	const handleSearchChange = (value: string) => {
		setSearchTerm(value);
	};

	const handleBulkSuccess = useCallback(() => {
		setSelectedIds(new Set());
	}, []);

	if (isLoading && !baseIdentities.length) {
		return <LoadingState variant="page" />;
	}

	if (isError) {
		return (
			<ErrorState
				variant="page"
				message={(error as any)?.message || "Unable to fetch identities. Please check your connection and try again."}
				action={{ label: "Retry", onClick: () => refetch() }}
			/>
		);
	}

	return (
		<Box>
			{/* Bulk action toolbar */}
			{selectedIds.size > 0 && (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1,
						mb: 2,
						p: 1.5,
						bgcolor: "action.selected",
						borderRadius: 2,
						flexWrap: "wrap",
					}}
				>
					<Chip label={`${selectedIds.size} selected`} variant="tag" />
					<Button variant="danger" size="small" startIcon={<DeleteOutline />} onClick={() => setBulkOperation("delete")}>
						Delete
					</Button>
					<Button variant="outlined" size="small" startIcon={<ExitToApp />} onClick={() => setBulkOperation("deleteSessions")}>
						Delete Sessions
					</Button>
					<Button variant="outlined" size="small" startIcon={<CheckCircle />} onClick={() => setBulkOperation("activate")}>
						Activate
					</Button>
					<Button variant="outlined" size="small" startIcon={<Block />} onClick={() => setBulkOperation("deactivate")}>
						Deactivate
					</Button>
					<Tooltip title="Clear selection">
						<IconButton size="small" onClick={() => setSelectedIds(new Set())}>
							<Clear />
						</IconButton>
					</Tooltip>
				</Box>
			)}

			<DataTable
				data={displayedIdentities}
				columns={columns}
				keyField="id"
				loading={isLoading}
				selectable={true}
				selectedKeys={selectedIds}
				onSelectionChange={setSelectedIds}
				searchable={true}
				searchValue={searchTerm}
				onSearchChange={handleSearchChange}
				searchPlaceholder="Search identities (ID, identifier, schema, name)..."
				onRowClick={handleRowClick}
				onRefresh={handleRefresh}
				onAdd={handleCreateNew}
				addButtonText="Create New"
				emptyMessage="No identities found"
				maxHeight={600}
			/>

			{/* Pagination info */}
			<Box sx={{ mt: 2, textAlign: "center" }}>
				<Typography variant="subheading">
					{searchTerm.trim()
						? `Found ${displayedIdentities.length} matches${shouldUseSearchResults ? " (from multi-page search)" : " (from current page)"}`
						: `Showing ${displayedIdentities.length} identities${hasMore ? " (more available)" : ""}`}
				</Typography>
			</Box>

			{/* Bulk operation dialog */}
			{bulkOperation && (
				<BulkOperationDialog
					open={!!bulkOperation}
					onClose={() => setBulkOperation(null)}
					operationType={bulkOperation}
					identityIds={Array.from(selectedIds)}
					identities={displayedIdentities}
					onSuccess={handleBulkSuccess}
				/>
			)}
		</Box>
	);
});

IdentitiesTable.displayName = "IdentitiesTable";

export default IdentitiesTable;
