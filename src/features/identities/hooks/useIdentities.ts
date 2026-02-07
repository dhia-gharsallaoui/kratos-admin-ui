import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DeleteIdentityCredentialsTypeEnum } from "@/services/kratos";
import {
	createIdentity,
	createRecoveryLink,
	deleteIdentity,
	deleteIdentityCredentials,
	getIdentity,
	listIdentities,
	patchIdentity,
} from "@/services/kratos";

// Identity list hook with pagination
export const useIdentities = (params?: { pageSize?: number; pageToken?: string }) => {
	const pageSize = params?.pageSize || 25;
	const pageToken = params?.pageToken;

	return useQuery({
		queryKey: ["identities", pageToken, pageSize],
		queryFn: async () => {
			const requestParams: any = { pageSize };
			if (pageToken) {
				requestParams.pageToken = pageToken;
			}

			const response = await listIdentities(requestParams);

			// Extract next page token from Link header if available
			const linkHeader = response.headers?.link;
			let nextPageToken = null;

			if (linkHeader) {
				const nextMatch = linkHeader.match(/<[^>]*[?&]page_token=([^&>]+)[^>]*>;\s*rel="next"/);
				if (nextMatch) {
					nextPageToken = nextMatch[1];
				}
			}

			return {
				identities: response.data,
				nextPageToken,
				hasMore: !!nextPageToken,
				pageSize,
				currentPageToken: pageToken,
			};
		},
	});
};

// Multi-page search hook that fetches across pages until target count is reached
export const useIdentitiesSearch = (params?: { pageSize?: number; searchTerm?: string }) => {
	const pageSize = params?.pageSize || 25;
	const searchTerm = params?.searchTerm?.trim();

	return useQuery({
		queryKey: ["identities-search", pageSize, searchTerm],
		queryFn: async () => {
			// If no search term, use regular pagination
			if (!searchTerm) {
				const requestParams: any = { pageSize };
				const response = await listIdentities(requestParams);

				const linkHeader = response.headers?.link;
				let nextPageToken = null;

				if (linkHeader) {
					const nextMatch = linkHeader.match(/<[^>]*[?&]page_token=([^&>]+)[^>]*>;\s*rel="next"/);
					if (nextMatch) {
						nextPageToken = nextMatch[1];
					}
				}

				return {
					identities: response.data,
					nextPageToken,
					hasMore: !!nextPageToken,
					isSearchResult: false,
					totalFetched: response.data.length,
				};
			}

			// Multi-page search logic
			let allIdentities: any[] = [];
			let matchedIdentities: any[] = [];
			let pageToken: string | undefined;
			let hasMore = true;
			let pageCount = 0;
			const maxPages = 20; // Prevent infinite loops

			console.log(`Starting search for: "${searchTerm}"`);

			while (matchedIdentities.length < pageSize && hasMore && pageCount < maxPages) {
				console.log(`Searching page ${pageCount + 1} (found ${matchedIdentities.length}/${pageSize})`);

				try {
					const requestParams: any = { pageSize: 250 }; // Fetch max per page for efficiency
					if (pageToken) {
						requestParams.pageToken = pageToken;
					}

					const response = await listIdentities(requestParams);
					const pageIdentities = response.data;

					// Filter current page for matches
					const pageMatches = pageIdentities.filter((identity: any) => {
						const traits = identity.traits as any;
						const email = String(traits?.email || "");
						const username = String(traits?.username || "");
						const firstName = String(traits?.first_name || traits?.firstName || "");
						const lastName = String(traits?.last_name || traits?.lastName || "");
						const name = String(traits?.name || "");
						const id = String(identity.id || "");

						const searchLower = searchTerm.toLowerCase();
						return (
							id.toLowerCase().includes(searchLower) ||
							email.toLowerCase().includes(searchLower) ||
							username.toLowerCase().includes(searchLower) ||
							firstName.toLowerCase().includes(searchLower) ||
							lastName.toLowerCase().includes(searchLower) ||
							name.toLowerCase().includes(searchLower)
						);
					});

					matchedIdentities = [...matchedIdentities, ...pageMatches];
					allIdentities = [...allIdentities, ...pageIdentities];

					// Extract next page token
					const linkHeader = response.headers?.link;
					let nextPageToken = null;

					if (linkHeader) {
						const nextMatch = linkHeader.match(/<[^>]*[?&]page_token=([^&>]+)[^>]*>;\s*rel="next"/);
						if (nextMatch) {
							nextPageToken = nextMatch[1];
						}
					}

					hasMore = !!nextPageToken;
					pageToken = nextPageToken;
					pageCount++;

					console.log(`Page ${pageCount}: Found ${pageMatches.length} matches (total: ${matchedIdentities.length})`);

					// Small delay between requests
					if (hasMore && matchedIdentities.length < pageSize) {
						await new Promise((resolve) => setTimeout(resolve, 100));
					}
				} catch (error) {
					console.error(`Error searching page ${pageCount + 1}:`, error);
					hasMore = false;
				}
			}

			// Return up to pageSize results
			const finalResults = matchedIdentities.slice(0, pageSize);

			console.log(`Search complete: ${finalResults.length} results from ${pageCount} pages`);

			return {
				identities: finalResults,
				nextPageToken: matchedIdentities.length > pageSize ? "search-has-more" : null,
				hasMore: matchedIdentities.length > pageSize || (hasMore && matchedIdentities.length === pageSize),
				isSearchResult: true,
				totalFetched: allIdentities.length,
				totalMatched: matchedIdentities.length,
			};
		},
		enabled: true,
		staleTime: 30 * 1000, // Cache search results for 30 seconds
	});
};

// Single identity hook
export const useIdentity = (id: string) => {
	return useQuery({
		queryKey: ["identity", id],
		queryFn: async () => {
			const { data } = await getIdentity({
				id,
				includeCredential: ["oidc", "totp", "lookup_secret", "webauthn", "passkey", "saml", "password"],
			});
			return data;
		},
		enabled: !!id,
	});
};

// Identity creation mutation
export const useCreateIdentity = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ schemaId, traits }: { schemaId: string; traits: any }) => {
			const { data } = await createIdentity({
				createIdentityBody: {
					schema_id: schemaId,
					traits,
				},
			});
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["identities"] });
		},
	});
};

// Identity update mutation
export const useUpdateIdentity = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, traits }: { id: string; schemaId: string; traits: any }) => {
			const jsonPatch = [{ op: "replace", path: "/traits", value: traits }];

			console.log("JSON Patch being sent:", jsonPatch);

			const { data } = await patchIdentity({
				id,
				jsonPatch: jsonPatch,
			});
			return data;
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["identities"] });
			queryClient.invalidateQueries({ queryKey: ["identity", variables.id] });
		},
	});
};

// General identity patch mutation
export const usePatchIdentity = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, jsonPatch }: { id: string; jsonPatch: any[] }) => {
			const { data } = await patchIdentity({ id, jsonPatch: jsonPatch });
			return data;
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["identities"] });
			queryClient.invalidateQueries({ queryKey: ["identity", variables.id] });
		},
	});
};

// Identity deletion mutation
export const useDeleteIdentity = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			await deleteIdentity({ id });
			return id;
		},
		onSuccess: (deletedId) => {
			// Update all identities queries to remove the deleted identity
			queryClient.setQueriesData({ queryKey: ["identities"] }, (oldData: any) => {
				if (!oldData) return oldData;

				return {
					...oldData,
					identities: oldData.identities.filter((identity: any) => identity.id !== deletedId),
				};
			});

			// Also update search queries
			queryClient.setQueriesData({ queryKey: ["identities-search"] }, (oldData: any) => {
				if (!oldData) return oldData;

				return {
					...oldData,
					identities: oldData.identities.filter((identity: any) => identity.id !== deletedId),
				};
			});

			// Invalidate to ensure fresh data on next fetch
			queryClient.invalidateQueries({ queryKey: ["identities"] });
			queryClient.invalidateQueries({ queryKey: ["identities-search"] });
			queryClient.invalidateQueries({ queryKey: ["identities-total-count"] });
		},
	});
};

// Identity credential deletion mutation
export const useDeleteIdentityCredentials = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, type, identifier }: { id: string; type: DeleteIdentityCredentialsTypeEnum; identifier?: string }) => {
			await deleteIdentityCredentials({ id, type, identifier });
			return { id, type };
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["identity", variables.id] });
		},
	});
};

// Identity recovery mutation
export const useRecoverIdentity = () => {
	return useMutation({
		mutationFn: async ({ id }: { id: string }) => {
			const { data } = await createRecoveryLink(id);
			return data;
		},
	});
};
