"use client";

import { Close, Email, ExpandMore, Refresh } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { AdminLayout, PageHeader } from "@/components/layout";
import {
	Box,
	Button,
	Card,
	CardContent,
	ErrorState,
	FormControl,
	IconButton,
	InputLabel,
	LoadingState,
	MenuItem,
	SearchBar,
	Select,
	Spinner,
	Tooltip,
	Typography,
} from "@/components/ui";
import { UserRole } from "@/features/auth";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { MessageDetailDialog, MessagesTable } from "@/features/messages/components";
import { useMessagesPaginated, useMessagesWithSearch } from "@/features/messages/hooks";
import type { CourierMessageStatus } from "@/services/kratos/endpoints/courier";

export default function MessagesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<CourierMessageStatus | "">("");
	const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery.trim());
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	const trimmedSearchQuery = debouncedSearchQuery;

	// Use infinite pagination when not searching
	const paginatedQuery = useMessagesPaginated({
		pageSize: 250,
		status: statusFilter || undefined,
	});

	// Use search query when there's a search term
	const searchQuery_ = useMessagesWithSearch(trimmedSearchQuery, statusFilter || undefined);

	// Choose which query to use based on search state
	const isSearching = !!trimmedSearchQuery;
	const activeQuery = isSearching ? searchQuery_ : paginatedQuery;

	// Get messages from the appropriate source
	const messages = useMemo(() => {
		const allMessages = isSearching
			? searchQuery_.data?.pages.flatMap((page) => page.messages) || []
			: paginatedQuery.data?.pages.flatMap((page) => page.messages) || [];

		// Apply client-side search filtering when searching
		if (!trimmedSearchQuery) {
			return allMessages;
		}

		const searchLower = trimmedSearchQuery.toLowerCase();
		return allMessages.filter((message: any) => {
			return (
				message.recipient?.toLowerCase().includes(searchLower) ||
				message.subject?.toLowerCase().includes(searchLower) ||
				message.id?.toLowerCase().includes(searchLower) ||
				message.template_type?.toLowerCase().includes(searchLower) ||
				message.type?.toLowerCase().includes(searchLower)
			);
		});
	}, [isSearching, searchQuery_.data, paginatedQuery.data, trimmedSearchQuery]);

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

	const handleMessageClick = (messageId: string) => {
		setSelectedMessageId(messageId);
	};

	const handleClearFilters = () => {
		setSearchQuery("");
		setStatusFilter("");
	};

	return (
		<ProtectedRoute requiredRole={UserRole.ADMIN}>
			<AdminLayout>
				<Box sx={{ p: 3 }}>
					<PageHeader
						title="Messages"
						subtitle="Monitor email and SMS messages sent through Kratos"
						icon={<Email sx={{ fontSize: 32, color: "white" }} />}
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
							{/* Filters */}
							<Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
								<Box sx={{ minWidth: "300px" }}>
									<SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search messages (recipient, subject, ID, template...)..." />
								</Box>

								<FormControl size="small" sx={{ minWidth: "150px" }}>
									<InputLabel>Status</InputLabel>
									<Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as CourierMessageStatus | "")}>
										<MenuItem value="">All Statuses</MenuItem>
										<MenuItem value="queued">Queued</MenuItem>
										<MenuItem value="processing">Processing</MenuItem>
										<MenuItem value="sent">Sent</MenuItem>
										<MenuItem value="abandoned">Abandoned</MenuItem>
									</Select>
								</FormControl>

								{(searchQuery || statusFilter) && (
									<Button variant="outlined" onClick={handleClearFilters} startIcon={<Close />}>
										Clear Filters
									</Button>
								)}
							</Box>

							{/* Messages Table */}
							{isError ? (
								<ErrorState
									message={error?.message || "Unable to fetch messages. Please check your connection and try again."}
									action={{ label: "Retry", onClick: refetch }}
								/>
							) : isLoading ? (
								<LoadingState variant="section" message="Loading messages..." />
							) : (
								<>
									<MessagesTable messages={messages} isLoading={isLoading} onMessageClick={handleMessageClick} />

									{/* Loading/pagination controls for search mode */}
									{isSearching && hasNextPage && (
										<Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
											{searchQuery_.isAutoSearching ? (
												<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
													<Spinner variant="inline" />
													<Typography variant="subheading">Searching for more messages...</Typography>
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
										<Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
											<Button
												onClick={() => fetchNextPage()}
												disabled={isFetchingNextPage}
												variant="outlined"
												startIcon={isFetchingNextPage ? <Spinner variant="button" /> : <ExpandMore />}
											>
												{isFetchingNextPage ? "Loading..." : "Load More Messages"}
											</Button>
										</Box>
									)}

									{/* Messages count */}
									<Box sx={{ mt: 2, textAlign: "center" }}>
										<Typography variant="subheading">
											{isSearching ? (
												<>
													Found {messages.length} message(s) matching &ldquo;
													{trimmedSearchQuery}&rdquo;
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
													Showing {messages.length} message(s)
													{hasNextPage && " (more available)"}
												</>
											)}
										</Typography>
									</Box>
								</>
							)}
						</CardContent>
					</Card>

					{/* Message Detail Dialog */}
					{selectedMessageId && <MessageDetailDialog open={true} onClose={() => setSelectedMessageId(null)} messageId={selectedMessageId} />}
				</Box>
			</AdminLayout>
		</ProtectedRoute>
	);
}
