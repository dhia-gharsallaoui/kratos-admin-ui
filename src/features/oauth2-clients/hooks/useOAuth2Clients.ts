import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
	type CreateOAuth2ClientRequest,
	createOAuth2Client,
	deleteOAuth2Client,
	getAllOAuth2Clients,
	getOAuth2Client,
	type ListOAuth2ClientsParams,
	listOAuth2Clients,
	type UpdateOAuth2ClientRequest,
	updateOAuth2Client,
} from "@/services/hydra";
import type { OAuth2ClientFilters } from "../types";

// Query keys
export const oauth2ClientsKeys = {
	all: ["oauth2-clients"] as const,
	lists: () => [...oauth2ClientsKeys.all, "list"] as const,
	list: (params: ListOAuth2ClientsParams) => [...oauth2ClientsKeys.lists(), params] as const,
	details: () => [...oauth2ClientsKeys.all, "detail"] as const,
	detail: (id: string) => [...oauth2ClientsKeys.details(), id] as const,
	stats: () => [...oauth2ClientsKeys.all, "stats"] as const,
};

// Hook to list OAuth2 clients with pagination
export function useOAuth2Clients(params: ListOAuth2ClientsParams = {}) {
	return useQuery({
		queryKey: oauth2ClientsKeys.list(params),
		queryFn: () => listOAuth2Clients(params),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

// Hook to get all OAuth2 clients (with pagination handling)
export function useAllOAuth2Clients(options?: { maxPages?: number; pageSize?: number; enabled?: boolean }) {
	const { enabled = true, ...fetchOptions } = options || {};

	return useQuery({
		queryKey: [...oauth2ClientsKeys.all, "all"],
		queryFn: () => getAllOAuth2Clients(fetchOptions),
		enabled,
		staleTime: 1000 * 60 * 10, // 10 minutes
	});
}

// Hook to get a specific OAuth2 client
export function useOAuth2Client(clientId: string, enabled = true) {
	return useQuery({
		queryKey: oauth2ClientsKeys.detail(clientId),
		queryFn: () => getOAuth2Client(clientId),
		enabled: enabled && !!clientId,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

// Hook to create an OAuth2 client
export function useCreateOAuth2Client() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (clientData: CreateOAuth2ClientRequest) => createOAuth2Client(clientData),
		onSuccess: () => {
			// Invalidate and refetch OAuth2 clients list
			queryClient.invalidateQueries({ queryKey: oauth2ClientsKeys.lists() });
			queryClient.invalidateQueries({ queryKey: oauth2ClientsKeys.stats() });
		},
	});
}

// Hook to update an OAuth2 client
export function useUpdateOAuth2Client() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ clientId, clientData }: { clientId: string; clientData: UpdateOAuth2ClientRequest }) => updateOAuth2Client(clientId, clientData),
		onSuccess: (data, variables) => {
			// Update the specific client in cache
			queryClient.setQueryData(oauth2ClientsKeys.detail(variables.clientId), data);
			// Invalidate lists to refresh
			queryClient.invalidateQueries({ queryKey: oauth2ClientsKeys.lists() });
			queryClient.invalidateQueries({ queryKey: oauth2ClientsKeys.stats() });
		},
	});
}

// Hook to delete an OAuth2 client
export function useDeleteOAuth2Client() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (clientId: string) => deleteOAuth2Client(clientId),
		onSuccess: (_data, clientId) => {
			// Remove the client from cache
			queryClient.removeQueries({
				queryKey: oauth2ClientsKeys.detail(clientId),
			});
			// Invalidate lists to refresh
			queryClient.invalidateQueries({ queryKey: oauth2ClientsKeys.lists() });
			queryClient.invalidateQueries({ queryKey: oauth2ClientsKeys.stats() });
		},
	});
}

// Hook for OAuth2 client statistics
export function useOAuth2ClientStats(enabled = true) {
	const { data: allClientsData, isLoading } = useAllOAuth2Clients({ enabled });

	return useQuery({
		queryKey: oauth2ClientsKeys.stats(),
		queryFn: () => {
			if (!allClientsData?.clients) {
				return null;
			}

			const clients = allClientsData.clients;
			const stats = {
				totalClients: clients.length,
				activeClients: clients.length, // Assuming all fetched clients are active
				publicClients: clients.filter((c) => !c.client_secret).length,
				confidentialClients: clients.filter((c) => !!c.client_secret).length,
				grantTypeDistribution: {} as Record<string, number>,
				scopeDistribution: {} as Record<string, number>,
			};

			// Calculate grant type distribution
			clients.forEach((client) => {
				if (client.grant_types) {
					client.grant_types.forEach((grantType) => {
						stats.grantTypeDistribution[grantType] = (stats.grantTypeDistribution[grantType] || 0) + 1;
					});
				}
			});

			// Calculate scope distribution
			clients.forEach((client) => {
				if (client.scope) {
					const scopes = client.scope.split(" ");
					scopes.forEach((scope) => {
						if (scope.trim()) {
							stats.scopeDistribution[scope.trim()] = (stats.scopeDistribution[scope.trim()] || 0) + 1;
						}
					});
				}
			});

			return stats;
		},
		enabled: enabled && !isLoading && !!allClientsData?.clients,
		staleTime: 1000 * 60 * 10, // 10 minutes
	});
}

// Hook for filtered OAuth2 clients (client-side filtering)
export function useFilteredOAuth2Clients(filters: OAuth2ClientFilters) {
	const { data: allClientsData, ...queryResult } = useAllOAuth2Clients();

	const filteredClients = useCallback(() => {
		if (!allClientsData?.clients) return [];

		let filtered = [...allClientsData.clients];

		// Apply search filter
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			filtered = filtered.filter(
				(client) =>
					client.client_name?.toLowerCase().includes(searchLower) ||
					client.client_id?.toLowerCase().includes(searchLower) ||
					client.owner?.toLowerCase().includes(searchLower),
			);
		}

		// Apply owner filter
		if (filters.owner) {
			filtered = filtered.filter((client) => client.owner === filters.owner);
		}

		// Apply grant type filter
		if (filters.grant_type) {
			filtered = filtered.filter((client) => client.grant_types?.includes(filters.grant_type!));
		}

		// Apply date filters
		if (filters.created_after) {
			const afterDate = new Date(filters.created_after);
			filtered = filtered.filter((client) => {
				if (!client.created_at) return false;
				return new Date(client.created_at) >= afterDate;
			});
		}

		if (filters.created_before) {
			const beforeDate = new Date(filters.created_before);
			filtered = filtered.filter((client) => {
				if (!client.created_at) return false;
				return new Date(client.created_at) <= beforeDate;
			});
		}

		return filtered;
	}, [allClientsData?.clients, filters]);

	return {
		...queryResult,
		data: {
			...allClientsData,
			clients: filteredClients(),
			totalCount: filteredClients().length,
		},
	};
}
