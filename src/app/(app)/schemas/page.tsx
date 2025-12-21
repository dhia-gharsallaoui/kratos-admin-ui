"use client";

import { Code, Description, MoreVert, Refresh, Schema } from "@mui/icons-material";
import { TablePagination } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { github, vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { AdminLayout, PageHeader } from "@/components/layout";
import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	EmptyState,
	ErrorState,
	IconButton,
	LoadingState,
	Paper,
	SearchBar,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
} from "@/components/ui";
import { UserRole } from "@/features/auth";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { useSchemas } from "@/features/schemas/hooks";
import { getIdentitySchema } from "@/services/kratos";

// Define the schema interface based on the provided example
interface SchemaItem {
	id: string;
	schema: {
		$id?: string;
		title?: string;
		type?: string;
		properties?: any;
		// Add other properties as needed
	};
}

export default function SchemasPage() {
	const theme = useTheme();
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [selectedSchemaId, setSelectedSchemaId] = useState<string | null>(null);
	const [schemaDialogOpen, setSchemaDialogOpen] = useState(false);
	const [schemaContent, setSchemaContent] = useState<any>(null);
	const [schemaLoading, setSchemaLoading] = useState(false);
	const [parsedSchemas, setParsedSchemas] = useState<SchemaItem[]>([]);
	const [searchQuery, setSearchQuery] = useState("");

	const { data: schemasResponse, isLoading, error, refetch } = useSchemas();

	// Use useEffect to parse the schemas when the response changes
	useEffect(() => {
		if (schemasResponse) {
			// Check if the response has a json property
			if ((schemasResponse as any).json && Array.isArray((schemasResponse as any).json)) {
				setParsedSchemas((schemasResponse as any).json);
			} else {
				// If not, try to use the response directly if it's an array
				const mapped = Array.isArray(schemasResponse)
					? schemasResponse.map((schema) => ({
							id: schema.id || "",
							schema: schema.schema || {},
						}))
					: [];
				setParsedSchemas(mapped);
			}
		}
	}, [schemasResponse]);

	// Use inert attribute to properly hide background content when dialog is open
	useEffect(() => {
		// Target the main layout container, not the dialog
		const layoutContainer = document.querySelector("main");
		const appBar = document.querySelector("header");
		const drawer = document.querySelector(".MuiDrawer-root");

		if (schemaDialogOpen) {
			if (layoutContainer) layoutContainer.setAttribute("inert", "");
			if (appBar) appBar.setAttribute("inert", "");
			if (drawer) drawer.setAttribute("inert", "");
		} else {
			if (layoutContainer) layoutContainer.removeAttribute("inert");
			if (appBar) appBar.removeAttribute("inert");
			if (drawer) drawer.removeAttribute("inert");
		}

		return () => {
			if (layoutContainer) layoutContainer.removeAttribute("inert");
			if (appBar) appBar.removeAttribute("inert");
			if (drawer) drawer.removeAttribute("inert");
		};
	}, [schemaDialogOpen]);

	const handleChangePage = (_: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleViewSchema = async (id: string) => {
		setSelectedSchemaId(id);
		setSchemaLoading(true);
		setSchemaDialogOpen(true);

		try {
			// First try to find the schema in the already loaded data
			const existingSchema = parsedSchemas.find((schema) => schema.id === id);

			if (existingSchema) {
				setSchemaContent(existingSchema.schema);
				setSchemaLoading(false);
				return;
			}

			// If not found, fetch it from the API
			const response = await getIdentitySchema({ id });
			setSchemaContent(response.data);
		} catch (err) {
			console.error("Error fetching schema:", err);
			setSchemaContent(null);
		} finally {
			setSchemaLoading(false);
		}
	};

	const handleCloseSchemaDialog = () => {
		setSchemaDialogOpen(false);
		setSelectedSchemaId(null);
		setSchemaContent(null);
	};

	// Extract schema title or use ID if title is not available
	const getSchemaTitle = (schema: SchemaItem) => {
		return schema.schema.title || "Unnamed Schema";
	};

	// Get schema properties count
	const getPropertiesCount = (schema: SchemaItem) => {
		const traits = schema.schema.properties?.traits?.properties;
		return traits ? Object.keys(traits).length : 0;
	};

	// Filter schemas based on search query
	const filteredSchemas = parsedSchemas.filter((schema) => {
		const title = getSchemaTitle(schema).toLowerCase();
		const id = schema.id.toLowerCase();
		const query = searchQuery.toLowerCase();
		return title.includes(query) || id.includes(query);
	});

	return (
		<ProtectedRoute requiredRole={UserRole.VIEWER}>
			<AdminLayout>
				<Box sx={{ p: 3 }}>
					<PageHeader
						title="Identity Schemas"
						subtitle="View and inspect your identity schemas and their properties"
						icon={<Schema sx={{ fontSize: 32, color: "white" }} />}
						actions={
							<Tooltip title="Refresh">
								<IconButton variant="action" onClick={() => refetch()}>
									<Refresh />
								</IconButton>
							</Tooltip>
						}
					/>

					<Card variant="bordered" sx={{ mb: 4 }}>
						<CardContent>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									mb: 2,
								}}
							>
								<Typography variant="heading" size="lg">
									All Schemas
								</Typography>
								<Box sx={{ width: { xs: "100%", sm: "300px" } }}>
									<SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search schemas..." />
								</Box>
							</Box>

							{isLoading ? (
								<LoadingState variant="section" message="Loading schemas..." />
							) : error ? (
								<ErrorState
									message="Unable to fetch identity schemas. Please check your connection and try again."
									action={{ label: "Retry", onClick: refetch }}
								/>
							) : (
								<>
									<TableContainer
										component={Paper}
										sx={{
											boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
											borderRadius: "8px",
											overflow: "hidden",
											border: "1px solid var(--border)",
										}}
									>
										<Table sx={{ minWidth: 650 }} aria-label="schemas table">
											<TableHead sx={{ backgroundColor: "var(--table-header)" }}>
												<TableRow>
													<TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
													<TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
													<TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
													<TableCell sx={{ fontWeight: 600 }}>Properties</TableCell>
													<TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{filteredSchemas.length === 0 ? (
													<TableRow>
														<TableCell colSpan={5} align="center" sx={{ py: 4 }}>
															<EmptyState
																icon={Description}
																title="No schemas found"
																description={searchQuery ? "Try a different search term" : "No schemas are currently configured"}
															/>
														</TableCell>
													</TableRow>
												) : (
													filteredSchemas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((schema) => (
														<TableRow
															key={schema.id}
															sx={{
																"&:hover": {
																	backgroundColor: "var(--table-row-hover)",
																},
																borderBottom: "1px solid var(--table-border)",
															}}
														>
															<TableCell
																component="th"
																scope="row"
																sx={{
																	maxWidth: 200,
																	overflow: "hidden",
																	textOverflow: "ellipsis",
																	whiteSpace: "nowrap",
																}}
															>
																<Typography variant="code">{schema.id}</Typography>
															</TableCell>
															<TableCell sx={{ fontWeight: 500 }}>{getSchemaTitle(schema)}</TableCell>
															<TableCell>
																<Chip variant="gradient" label={schema.schema.type || "unknown"} />
															</TableCell>
															<TableCell>
																<Chip variant="tag" label={`${getPropertiesCount(schema)} trait(s)`} />
															</TableCell>
															<TableCell>
																<Button
																	variant="outlined"
																	size="small"
																	startIcon={<Code />}
																	onClick={() => handleViewSchema(schema.id)}
																	sx={{ mr: 1 }}
																>
																	View Schema
																</Button>
																<IconButton size="small">
																	<MoreVert fontSize="small" />
																</IconButton>
															</TableCell>
														</TableRow>
													))
												)}
											</TableBody>
										</Table>
									</TableContainer>
									<TablePagination
										rowsPerPageOptions={[5, 10, 25]}
										component="div"
										count={filteredSchemas.length}
										rowsPerPage={rowsPerPage}
										page={page}
										onPageChange={handleChangePage}
										onRowsPerPageChange={handleChangeRowsPerPage}
										sx={{
											".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
												margin: 0,
											},
										}}
									/>
								</>
							)}
						</CardContent>
					</Card>

					<Card variant="bordered">
						<CardContent>
							<Typography variant="heading" size="lg" sx={{ mb: 2 }}>
								About Identity Schemas
							</Typography>
							<Typography variant="subheading">
								Identity schemas define the structure of identity data in Ory Kratos. They determine what fields are available for registration,
								login, and profile management. Use schemas to customize the user experience and data collection for your application.
							</Typography>
						</CardContent>
					</Card>

					{/* Schema Dialog */}
					<Dialog
						open={schemaDialogOpen}
						onClose={handleCloseSchemaDialog}
						title={
							<>
								Schema Details{" "}
								{selectedSchemaId && (
									<Typography variant="code" component="span" sx={{ ml: 1 }}>
										(ID: {selectedSchemaId})
									</Typography>
								)}
							</>
						}
						maxWidth="md"
						fullWidth
					>
						<DialogContent dividers sx={{ p: 0 }}>
							{schemaLoading ? (
								<LoadingState variant="section" message="Loading schema details..." />
							) : schemaContent ? (
								<Box
									sx={{
										borderRadius: 1,
										overflow: "auto",
										maxHeight: "60vh",
										background: theme.palette.background.default,
									}}
								>
									<SyntaxHighlighter
										language="json"
										style={theme.palette.mode === "dark" ? vs2015 : github}
										customStyle={{
											margin: 0,
											padding: "1.5rem",
											fontSize: "0.875rem",
											background: theme.palette.mode === "dark" ? "#1e1e1e" : "#f8f9fa",
											borderRadius: "var(--radius)",
											lineHeight: 1.5,
											border: `1px solid ${theme.palette.divider}`,
										}}
										showLineNumbers={true}
										lineNumberStyle={{
											color: theme.palette.text.secondary,
											paddingRight: "1rem",
											minWidth: "2rem",
											userSelect: "none",
										}}
										wrapLongLines={true}
									>
										{JSON.stringify(schemaContent, null, 2)}
									</SyntaxHighlighter>
								</Box>
							) : (
								<Typography variant="body" color="error" sx={{ p: 3 }}>
									Failed to load schema content. Please try again.
								</Typography>
							)}
						</DialogContent>
						<DialogActions>
							<Button onClick={handleCloseSchemaDialog} variant="outlined">
								Close
							</Button>
						</DialogActions>
					</Dialog>
				</Box>
			</AdminLayout>
		</ProtectedRoute>
	);
}
