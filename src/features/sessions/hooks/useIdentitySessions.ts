"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteIdentitySessions, listIdentitySessions } from "@/api/kratos/identities";

// Hook to fetch sessions for a specific identity
export const useIdentitySessions = (identityId: string, options?: { enabled?: boolean }) => {
	const { enabled = true } = options || {};

	return useQuery({
		queryKey: ["identity-sessions", identityId],
		queryFn: () => listIdentitySessions(identityId),
		enabled: enabled && !!identityId,
		staleTime: 30000,
		refetchOnWindowFocus: false,
		retry: 2,
	});
};

// Hook to delete all sessions for a specific identity
export const useDeleteIdentitySessions = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (identityId: string) => deleteIdentitySessions(identityId),
		onSuccess: (_, identityId) => {
			queryClient.invalidateQueries({ queryKey: ["identity-sessions", identityId] });
			queryClient.invalidateQueries({ queryKey: ["sessions"] });
		},
	});
};
