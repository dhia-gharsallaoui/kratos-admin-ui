"use client";

import { ExpandMore, Refresh, Security } from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { ErrorState, SearchBar } from "@/components";
import { AdminLayout, PageHeader } from "@/components/layout";
import { Box, Button, Card, CardContent, IconButton, Tooltip, Typography } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";
import { UserRole } from "@/features/auth";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { SessionDetailDialog } from "@/features/sessions/components/SessionDetailDialog";
import { SessionsTable } from "@/features/sessions/components/SessionsTable";
import { useSessionsPaginated, useSessionsWithSearch } from "@/features/sessions/hooks/useSessions";
import { useStableSessions } from "@/features/sessions/hooks/useStableSessions";

export default function SessionsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
	const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

	// Debounce search query to avoid excessive API calls
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery.trim());
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	const trimmedSearchQuery = debouncedSearchQuery;

	// Use infinite pagination when not searching
	const paginatedQuery = useSessionsPaginated({ pageSize: 250 });

	// Use search query when there's a search term
	const searchQuery_ = useSessionsWithSearch(trimmedSearchQuery);

	// Choose which query to use based on search state
	const isSearching = !!trimmedSearchQuery;
	const activeQuery = isSearching ? searchQuery_ : paginatedQuery;

	// Get sessions from the appropriate source (removed useMemo for better reactivity)
	const sessions = isSearching
		? searchQuery_.data?.pages.flatMap((page) => page.sessions) || []
		: paginatedQuery.data?.pages.flatMap((page) => page.sessions) || [];

	// Unified loading and error states
	const isLoading = activeQuery.isLoading;
	const isError = activeQuery.isError;
	const error = activeQuery.error;

	// Pagination-specific states - works for both modes now
	const fetchNextPage = isSearching ? searchQuery_.fetchNextPage : paginatedQuery.fetchNextPage;
	const hasNextPage = isSearching ? searchQuery_.hasNextPage : paginatedQuery.hasNextPage;
	const isFetchingNextPage = isSearching ? searchQuery_.isFetchingNextPage : paginatedQuery.isFetchingNextPage;

	// Refetch function that works for both modes
	const refetch = () => {
		if (isSearching) {
			searchQuery_.refetch();
		} else {
			paginatedQuery.refetch();
		}
	};

	// Helper to get identity display name - memoized for stability
	const getIdentityDisplay = useCallback((session: any) => {
		if (!session.identity) return "Unknown";

		const traits = session.identity.traits;
		if (!traits) return session.identity.id;

		return traits.email || traits.username || session.identity.id;
	}, []);

	// Use the stable sessions hook for truly stable references
	const stableSessionsState = useStableSessions({
		sessions,
		searchQuery: trimmedSearchQuery,
		getIdentityDisplay,
	});

	const stableFilteredSessions = stableSessionsState.sessions;

	const handleSessionClick = (sessionId: string) => {
		setSelectedSessionId(sessionId);
	};

	const handleDialogClose = () => {
		setSelectedSessionId(null);
	};

	return (
		<ProtectedRoute requiredRole={UserRole.ADMIN}>
			<AdminLayout>
				<Box sx={{ p: 3 }}>
					<PageHeader
						title="Active Sessions"
						subtitle="Monitor and manage user sessions across your system"
						icon={<Security sx={{ fontSize: 32, color: "white" }} />}
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
									gap: 2,
								}}
							>
								<Typography variant="heading" size="lg">
									All Sessions
								</Typography>
								<Box sx={{ width: { xs: "100%", sm: "300px" } }}>
									<SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search sessions..." />
								</Box>
							</Box>

							{isError ? (
								<ErrorState
									variant="page"
									message={error?.message || "Unable to fetch sessions. Please check your connection and try again."}
									action={{
										label: "Retry",
										onClick: refetch,
									}}
								/>
							) : (
								<>
									<SessionsTable
										key={`${paginatedQuery.dataUpdatedAt}-${searchQuery_.dataUpdatedAt}`} // Force re-render when data updates
										sessions={stableFilteredSessions}
										isLoading={isLoading}
										isFetchingNextPage={false} // Don't cause re-renders for fetching state
										searchQuery={searchQuery}
										onSessionClick={handleSessionClick}
									/>

									{/* Loading/pagination controls for search mode */}
									{isSearching && hasNextPage && (
										<Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
											{searchQuery_.isAutoSearching ? (
												<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
													<Spinner variant="inline" />
													<Typography variant="subheading">Searching for more sessions...</Typography>
												</Box>
											) : (
												<Button onClick={() => searchQuery_.loadMoreMatches()} variant="outlined" startIcon={<ExpandMore />}>
													Load More Matches
												</Button>
											)}
										</Box>
									)}

									{/* Manual load more for browsing mode */}
									{!isSearching && hasNextPage && (
										<Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
											<Button
												onClick={() => fetchNextPage()}
												disabled={isFetchingNextPage}
												variant="outlined"
												startIcon={isFetchingNextPage ? <Spinner variant="button" /> : <ExpandMore />}
											>
												{isFetchingNextPage ? "Loading..." : "Load More Sessions"}
											</Button>
										</Box>
									)}

									{/* Sessions count info */}
									<Box sx={{ p: 2, textAlign: "center" }}>
										<Typography variant="subheading">
											{isSearching ? (
												<>
													Found {stableFilteredSessions.length} sessions matching &ldquo;{trimmedSearchQuery}&rdquo;
													{(() => {
														// Use the isAutoSearching state from the hook
														if (searchQuery_.isAutoSearching) {
															return " (auto-searching...)";
														}
														// Regular search behavior
														if (searchQuery_.isFetchingNextPage) {
															return " (searching...)";
														}
														if (hasNextPage) {
															return " (more available)";
														}
														return "";
													})()}
												</>
											) : (
												<>
													Showing {stableFilteredSessions.length} sessions
													{hasNextPage && " (more available)"}
												</>
											)}
										</Typography>
									</Box>
								</>
							)}
						</CardContent>
					</Card>

					<Card variant="bordered">
						<CardContent>
							<Typography variant="heading" size="lg" sx={{ mb: 2 }}>
								About Sessions
							</Typography>
							<Typography variant="subheading">
								This page shows all active sessions across all identities in the system. Sessions are automatically created when users authenticate
								and expire based on your Kratos configuration. Use this page to monitor user activity and troubleshoot authentication issues.
							</Typography>
						</CardContent>
					</Card>
				</Box>

				{/* Session Detail Dialog */}
				{selectedSessionId && (
					<SessionDetailDialog
						open={true}
						onClose={handleDialogClose}
						sessionId={selectedSessionId}
						onSessionUpdated={() => {
							// Refetch the active query
							if (isSearching) {
								searchQuery_.refetch();
							} else {
								paginatedQuery.refetch();
							}
						}}
					/>
				)}
			</AdminLayout>
		</ProtectedRoute>
	);
}
