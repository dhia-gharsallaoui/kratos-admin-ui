import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type AcceptOAuth2ConsentRequest,
	type AcceptOAuth2LoginRequest,
	acceptOAuth2ConsentRequest,
	acceptOAuth2LoginRequest,
	acceptOAuth2LogoutRequest,
	getOAuth2ConsentRequest,
	getOAuth2LoginRequest,
	getOAuth2LogoutRequest,
	type ListConsentSessionsParams,
	listOAuth2ConsentSessions,
	type RejectOAuth2Request,
	rejectOAuth2ConsentRequest,
	rejectOAuth2LoginRequest,
	rejectOAuth2LogoutRequest,
	revokeOAuth2ConsentSessions,
} from "@/services/hydra";

// Query keys
export const oauth2AuthKeys = {
	all: ["oauth2-auth"] as const,
	consentRequests: () => [...oauth2AuthKeys.all, "consent-requests"] as const,
	consentRequest: (challenge: string) => [...oauth2AuthKeys.consentRequests(), challenge] as const,
	loginRequests: () => [...oauth2AuthKeys.all, "login-requests"] as const,
	loginRequest: (challenge: string) => [...oauth2AuthKeys.loginRequests(), challenge] as const,
	logoutRequests: () => [...oauth2AuthKeys.all, "logout-requests"] as const,
	logoutRequest: (challenge: string) => [...oauth2AuthKeys.logoutRequests(), challenge] as const,
	consentSessions: () => [...oauth2AuthKeys.all, "consent-sessions"] as const,
	consentSessionsList: (params: ListConsentSessionsParams) => [...oauth2AuthKeys.consentSessions(), params] as const,
	loginSessions: () => [...oauth2AuthKeys.all, "login-sessions"] as const,
	loginSessionsList: (subject: string) => [...oauth2AuthKeys.loginSessions(), subject] as const,
	stats: () => [...oauth2AuthKeys.all, "stats"] as const,
};

// Consent Request hooks
export function useOAuth2ConsentRequest(challenge: string, enabled = true) {
	return useQuery({
		queryKey: oauth2AuthKeys.consentRequest(challenge),
		queryFn: () => getOAuth2ConsentRequest(challenge),
		enabled: enabled && !!challenge,
		staleTime: 1000 * 60 * 2, // 2 minutes (consent requests are time-sensitive)
	});
}

export function useAcceptOAuth2ConsentRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ challenge, body }: { challenge: string; body: AcceptOAuth2ConsentRequest }) => acceptOAuth2ConsentRequest(challenge, body),
		onSuccess: (_data, variables) => {
			// Remove the specific consent request from cache as it's been handled
			queryClient.removeQueries({
				queryKey: oauth2AuthKeys.consentRequest(variables.challenge),
			});
			// Invalidate consent sessions to refresh
			queryClient.invalidateQueries({
				queryKey: oauth2AuthKeys.consentSessions(),
			});
			queryClient.invalidateQueries({ queryKey: oauth2AuthKeys.stats() });
		},
	});
}

export function useRejectOAuth2ConsentRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ challenge, body }: { challenge: string; body: RejectOAuth2Request }) => rejectOAuth2ConsentRequest(challenge, body),
		onSuccess: (_data, variables) => {
			// Remove the specific consent request from cache as it's been handled
			queryClient.removeQueries({
				queryKey: oauth2AuthKeys.consentRequest(variables.challenge),
			});
			// Invalidate sessions and stats
			queryClient.invalidateQueries({
				queryKey: oauth2AuthKeys.consentSessions(),
			});
			queryClient.invalidateQueries({ queryKey: oauth2AuthKeys.stats() });
		},
	});
}

// Login Request hooks
export function useOAuth2LoginRequest(challenge: string, enabled = true) {
	return useQuery({
		queryKey: oauth2AuthKeys.loginRequest(challenge),
		queryFn: () => getOAuth2LoginRequest(challenge),
		enabled: enabled && !!challenge,
		staleTime: 1000 * 60 * 2, // 2 minutes (login requests are time-sensitive)
	});
}

export function useAcceptOAuth2LoginRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ challenge, body }: { challenge: string; body: AcceptOAuth2LoginRequest }) => acceptOAuth2LoginRequest(challenge, body),
		onSuccess: (_data, variables) => {
			// Remove the specific login request from cache as it's been handled
			queryClient.removeQueries({
				queryKey: oauth2AuthKeys.loginRequest(variables.challenge),
			});
			// Invalidate login sessions to refresh
			queryClient.invalidateQueries({
				queryKey: oauth2AuthKeys.loginSessions(),
			});
			queryClient.invalidateQueries({ queryKey: oauth2AuthKeys.stats() });
		},
	});
}

export function useRejectOAuth2LoginRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ challenge, body }: { challenge: string; body: RejectOAuth2Request }) => rejectOAuth2LoginRequest(challenge, body),
		onSuccess: (_data, variables) => {
			// Remove the specific login request from cache as it's been handled
			queryClient.removeQueries({
				queryKey: oauth2AuthKeys.loginRequest(variables.challenge),
			});
			// Invalidate sessions and stats
			queryClient.invalidateQueries({
				queryKey: oauth2AuthKeys.loginSessions(),
			});
			queryClient.invalidateQueries({ queryKey: oauth2AuthKeys.stats() });
		},
	});
}

// Logout Request hooks
export function useOAuth2LogoutRequest(challenge: string, enabled = true) {
	return useQuery({
		queryKey: oauth2AuthKeys.logoutRequest(challenge),
		queryFn: () => getOAuth2LogoutRequest(challenge),
		enabled: enabled && !!challenge,
		staleTime: 1000 * 60 * 2, // 2 minutes (logout requests are time-sensitive)
	});
}

export function useAcceptOAuth2LogoutRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (challenge: string) => acceptOAuth2LogoutRequest(challenge),
		onSuccess: (_data, challenge) => {
			// Remove the specific logout request from cache as it's been handled
			queryClient.removeQueries({
				queryKey: oauth2AuthKeys.logoutRequest(challenge),
			});
			// Invalidate sessions and stats
			queryClient.invalidateQueries({
				queryKey: oauth2AuthKeys.loginSessions(),
			});
			queryClient.invalidateQueries({
				queryKey: oauth2AuthKeys.consentSessions(),
			});
			queryClient.invalidateQueries({ queryKey: oauth2AuthKeys.stats() });
		},
	});
}

export function useRejectOAuth2LogoutRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (challenge: string) => rejectOAuth2LogoutRequest(challenge),
		onSuccess: (_data, challenge) => {
			// Remove the specific logout request from cache as it's been handled
			queryClient.removeQueries({
				queryKey: oauth2AuthKeys.logoutRequest(challenge),
			});
			queryClient.invalidateQueries({ queryKey: oauth2AuthKeys.stats() });
		},
	});
}

// Session management hooks
export function useOAuth2ConsentSessions(params: ListConsentSessionsParams = {}) {
	return useQuery({
		queryKey: oauth2AuthKeys.consentSessionsList(params),
		queryFn: () => listOAuth2ConsentSessions(params),
		enabled: !!params.subject, // Only fetch if subject is provided (required by Hydra API)
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

export function useRevokeOAuth2ConsentSessions() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ subject, client, all }: { subject: string; client?: string; all?: boolean }) => revokeOAuth2ConsentSessions(subject, client, all),
		onSuccess: () => {
			// Invalidate all consent sessions
			queryClient.invalidateQueries({
				queryKey: oauth2AuthKeys.consentSessions(),
			});
			queryClient.invalidateQueries({ queryKey: oauth2AuthKeys.stats() });
		},
	});
}

export function useOAuth2LoginSessions(subject: string, enabled = true) {
	return useQuery({
		queryKey: oauth2AuthKeys.loginSessionsList(subject),
		queryFn: () => listOAuth2ConsentSessions({ subject }),
		enabled: enabled && !!subject,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

export function useRevokeOAuth2LoginSessions() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (subject: string) => revokeOAuth2ConsentSessions(subject),
		onSuccess: () => {
			// Invalidate all login sessions
			queryClient.invalidateQueries({
				queryKey: oauth2AuthKeys.loginSessions(),
			});
			queryClient.invalidateQueries({ queryKey: oauth2AuthKeys.stats() });
		},
	});
}

// Auth flow statistics hook
export function useOAuth2AuthStats(enabled = true) {
	const { data: consentSessionsData } = useOAuth2ConsentSessions({});

	return useQuery({
		queryKey: oauth2AuthKeys.stats(),
		queryFn: () => {
			// Since we don't have a direct endpoint for auth flow stats,
			// we'll compute them from available session data
			const sessions = consentSessionsData?.data || [];

			const stats = {
				totalRequests: sessions.length,
				pendingRequests: 0, // We don't have pending status in session data
				acceptedRequests: sessions.length, // All sessions represent accepted requests
				rejectedRequests: 0, // We don't have rejected requests in session data
				typeDistribution: {
					consent: sessions.length,
					login: 0, // Would need separate endpoint
					logout: 0, // Would need separate endpoint
				},
				clientDistribution: {} as Record<string, number>,
				averageProcessingTime: undefined, // Would need timestamp analysis
			};

			// Calculate client distribution if we have client info
			sessions.forEach((session: any) => {
				if (session.client_id) {
					stats.clientDistribution[session.client_id] = (stats.clientDistribution[session.client_id] || 0) + 1;
				}
			});

			return stats;
		},
		enabled: enabled && !!consentSessionsData,
		staleTime: 1000 * 60 * 10, // 10 minutes
	});
}
