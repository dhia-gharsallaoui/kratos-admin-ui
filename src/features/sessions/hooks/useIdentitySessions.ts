import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteIdentitySessions, listIdentitySessions } from "@/services/kratos/endpoints/sessions";

// Hook to fetch sessions for a specific identity
export const useIdentitySessions = (identityId: string, options?: { enabled?: boolean }) => {
	const { enabled = true } = options || {};

	return useQuery({
		queryKey: ["identity-sessions", identityId],
		queryFn: () =>
			listIdentitySessions({
				id: identityId,
			}),
		enabled: enabled && !!identityId,
		staleTime: 30000, // 30 seconds
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
			// Invalidate identity sessions
			queryClient.invalidateQueries({
				queryKey: ["identity-sessions", identityId],
			});
			// Also invalidate general sessions list in case they're viewing that too
			queryClient.invalidateQueries({ queryKey: ["sessions"] });
		},
	});
};
