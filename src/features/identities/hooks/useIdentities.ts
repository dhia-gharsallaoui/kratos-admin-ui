"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createIdentity,
	createRecoveryLink,
	deleteIdentity,
	deleteIdentityCredentials,
	getIdentity,
	listIdentities,
	patchIdentity,
	searchIdentities,
} from "@/api/kratos/identities";

// Identity list hook with pagination
export const useIdentities = (params?: { pageSize?: number; pageToken?: string }) => {
	const pageSize = params?.pageSize || 25;
	const pageToken = params?.pageToken;

	return useQuery({
		queryKey: ["identities", pageToken, pageSize],
		queryFn: async () => {
			const data = await listIdentities({ pageSize, pageToken });

			return {
				identities: data.identities,
				nextPageToken: data.nextPageToken,
				hasMore: data.hasMore,
				pageSize,
				currentPageToken: pageToken,
			};
		},
	});
};

// Server-side search hook — single request, no client-side multi-page scanning
export const useIdentitiesSearch = (params?: { pageSize?: number; searchTerm?: string }) => {
	const pageSize = params?.pageSize || 25;
	const searchTerm = params?.searchTerm?.trim();

	return useQuery({
		queryKey: ["identities-search", pageSize, searchTerm],
		queryFn: async () => {
			if (!searchTerm) {
				const data = await listIdentities({ pageSize });
				return {
					identities: data.identities,
					nextPageToken: data.nextPageToken,
					hasMore: data.hasMore,
					isSearchResult: false,
					totalFetched: data.identities.length,
				};
			}

			const result = await searchIdentities(searchTerm, pageSize);
			return {
				identities: result.identities || [],
				nextPageToken: null,
				hasMore: false,
				isSearchResult: true,
				totalFetched: result.totalMatched,
				totalMatched: result.totalMatched,
			};
		},
		staleTime: 30 * 1000,
	});
};

// Single identity hook
export const useIdentity = (id: string) => {
	return useQuery({
		queryKey: ["identity", id],
		queryFn: async () => {
			return await getIdentity(id, ["oidc", "totp", "lookup_secret", "webauthn", "passkey", "saml", "password"]);
		},
		enabled: !!id,
	});
};

// Identity creation mutation
export const useCreateIdentity = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ schemaId, traits }: { schemaId: string; traits: any }) => {
			return await createIdentity({ schema_id: schemaId, traits });
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
			return await patchIdentity(id, jsonPatch);
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
			return await patchIdentity(id, jsonPatch);
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
			await deleteIdentity(id);
			return id;
		},
		onSuccess: (deletedId) => {
			queryClient.setQueriesData({ queryKey: ["identities"] }, (oldData: any) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					identities: oldData.identities.filter((identity: any) => identity.id !== deletedId),
				};
			});

			queryClient.setQueriesData({ queryKey: ["identities-search"] }, (oldData: any) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					identities: oldData.identities.filter((identity: any) => identity.id !== deletedId),
				};
			});

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
		mutationFn: async ({ id, type, identifier }: { id: string; type: string; identifier?: string }) => {
			await deleteIdentityCredentials(id, type, identifier);
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
			return await createRecoveryLink(id);
		},
	});
};

// Re-export for backwards compatibility
export type { DeleteIdentityCredentialsTypeEnum } from "@ory/kratos-client";
