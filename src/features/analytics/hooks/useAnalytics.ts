import { useQuery } from "@tanstack/react-query";
import { useHydraEnabled, useIsOryNetwork, useSettingsLoaded } from "@/features/settings/hooks/useSettings";
import { checkHydraHealth, listOAuth2Clients } from "@/services/hydra";
import { checkKratosHealth, getAllIdentities, getSessionsUntilDate, listIdentitySchemas, listSessions } from "@/services/kratos";
import type { HydraAnalytics, IdentityAnalytics, SessionAnalytics, SystemAnalytics } from "../types";

// Health check hooks
const useKratosHealthCheck = (isOryNetwork: boolean, isSettingsLoaded: boolean) => {
	return useQuery({
		queryKey: ["health", "kratos", isOryNetwork],
		queryFn: async () => {
			// Ory Network does not provide health check endpoints
			if (isOryNetwork) {
				return { isHealthy: true };
			}
			return checkKratosHealth();
		},
		enabled: isSettingsLoaded, // Wait for settings to load before checking health
		staleTime: 2 * 60 * 1000, // Cache for 2 minutes
		retry: 1, // Only retry once for health checks
	});
};

const useHydraHealthCheck = (isOryNetwork: boolean, isSettingsLoaded: boolean, hydraEnabled: boolean) => {
	return useQuery({
		queryKey: ["health", "hydra", isOryNetwork, hydraEnabled],
		queryFn: async () => {
			// If Hydra is disabled, return as not healthy (but not an error)
			if (!hydraEnabled) {
				return { isHealthy: false, disabled: true };
			}
			// Ory Network does not provide health check endpoints
			if (isOryNetwork) {
				return { isHealthy: true };
			}
			return checkHydraHealth();
		},
		enabled: isSettingsLoaded, // Wait for settings to load before checking health
		staleTime: 2 * 60 * 1000, // Cache for 2 minutes
		retry: 1, // Only retry once for health checks
	});
};

// Hook to fetch comprehensive identity analytics
export const useIdentityAnalytics = (isKratosHealthy: boolean) => {
	return useQuery({
		queryKey: ["analytics", "identities"],
		queryFn: async (): Promise<IdentityAnalytics> => {
			// Use the centralized getAllIdentities function
			const result = await getAllIdentities({
				maxPages: 20,
				pageSize: 250,
				onProgress: (count, page) => console.log(`Analytics: Fetched ${count} identities (page ${page})`),
			});

			const allIdentities = result.identities;

			// Process the data
			const now = new Date();
			const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

			// Count new identities in last 30 days
			const newIdentitiesLast30Days = allIdentities.filter((identity) => {
				const createdAt = new Date(identity.created_at);
				return createdAt >= thirtyDaysAgo;
			}).length;

			// Group identities by day (last 30 days)
			const identitiesByDay: Array<{ date: string; count: number }> = [];
			for (let i = 29; i >= 0; i--) {
				const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
				const dateStr = date.toISOString().split("T")[0];
				const count = allIdentities.filter((identity) => {
					const createdAt = new Date(identity.created_at);
					return createdAt.toISOString().split("T")[0] === dateStr;
				}).length;
				identitiesByDay.push({ date: dateStr, count });
			}

			// Group by schema
			const schemaGroups = allIdentities.reduce(
				(acc, identity) => {
					const schema = identity.schema_id || "unknown";
					acc[schema] = (acc[schema] || 0) + 1;
					return acc;
				},
				{} as Record<string, number>,
			);

			const identitiesBySchema = Object.entries(schemaGroups).map(([schema, count]) => ({
				schema,
				count: count as number,
			}));

			// Verification status (check if email is verified)
			let verified = 0;
			let unverified = 0;

			allIdentities.forEach((identity) => {
				const verifiableAddresses = identity.verifiable_addresses || [];
				const hasVerifiedEmail = verifiableAddresses.some((addr: any) => addr.verified);
				if (hasVerifiedEmail) {
					verified++;
				} else {
					unverified++;
				}
			});

			return {
				totalIdentities: allIdentities.length,
				newIdentitiesLast30Days,
				identitiesByDay,
				identitiesBySchema,
				verificationStatus: { verified, unverified },
			};
		},
		enabled: isKratosHealthy, // Only fetch when Kratos is healthy
		staleTime: 5 * 60 * 1000, // Cache for 5 minutes
		refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
	});
};

// Hook to fetch session analytics
export const useSessionAnalytics = (isKratosHealthy: boolean) => {
	return useQuery({
		queryKey: ["analytics", "sessions"],
		queryFn: async (): Promise<SessionAnalytics> => {
			// Fetch sessions until 7 days ago (smart pagination stops when reaching older sessions)
			const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
			const result = await getSessionsUntilDate({
				maxPages: 10,
				pageSize: 250,
				active: undefined, // Get all sessions (active and inactive)
				untilDate: sevenDaysAgo,
				onProgress: (count, page) => console.log(`Analytics: Fetched ${count} sessions (page ${page})`),
			});

			const sessions = result.sessions;

			const now = new Date();

			// Count sessions in last 7 days
			const sessionsLast7Days = sessions.filter((session) => {
				if (!session.authenticated_at) return false;
				const authenticatedAt = new Date(session.authenticated_at);
				if (Number.isNaN(authenticatedAt.getTime())) return false;
				return authenticatedAt >= sevenDaysAgo;
			}).length;

			// Group sessions by day (last 7 days) - count sessions that were active on each day
			const sessionsByDay: Array<{ date: string; count: number }> = [];
			for (let i = 6; i >= 0; i--) {
				const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
				const dateStr = date.toISOString().split("T")[0];
				const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
				const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

				const count = sessions.filter((session) => {
					if (!session.authenticated_at) return false;

					const authenticatedAt = new Date(session.authenticated_at);
					if (Number.isNaN(authenticatedAt.getTime())) return false;

					// Session must have started before or on this day
					if (authenticatedAt > dayEnd) return false;

					// If session has expiry, it must not have expired before this day started
					if (session.expires_at) {
						const expiresAt = new Date(session.expires_at);
						if (Number.isNaN(expiresAt.getTime())) return true; // If invalid expiry, assume still active
						if (expiresAt < dayStart) return false; // Expired before this day
					}

					// Session was active during this day
					return true;
				}).length;

				sessionsByDay.push({ date: dateStr, count });
			}

			// Calculate average session duration (estimate based on last activity)
			const sessionDurations = sessions
				.filter((session) => session.authenticated_at && session.issued_at)
				.map((session) => {
					const authenticated = new Date(session.authenticated_at || "").getTime();
					const issued = new Date(session.issued_at || "").getTime();
					return Math.abs(authenticated - issued) / (1000 * 60); // minutes
				});

			const averageSessionDuration =
				sessionDurations.length > 0 ? sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length : 0;

			// Get active sessions count using API filter
			const activeSessionsResponse = await listSessions(true);
			const activeSessions = activeSessionsResponse.data.length;

			return {
				totalSessions: sessions.length,
				activeSessions,
				sessionsByDay,
				averageSessionDuration: Math.round(averageSessionDuration),
				sessionsLast7Days,
			};
		},
		enabled: isKratosHealthy, // Only fetch when Kratos is healthy
		staleTime: 2 * 60 * 1000, // Cache for 2 minutes
		refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
	});
};

// Hook to fetch system analytics
export const useSystemAnalytics = (isKratosHealthy: boolean) => {
	return useQuery({
		queryKey: ["analytics", "system"],
		queryFn: async (): Promise<SystemAnalytics> => {
			const schemasResponse = await listIdentitySchemas();
			const schemas = schemasResponse.data;

			return {
				totalSchemas: schemas.length,
				systemHealth: "healthy", // Could be enhanced with actual health checks
				lastUpdated: new Date(),
			};
		},
		enabled: isKratosHealthy, // Only fetch when Kratos is healthy
		staleTime: 10 * 60 * 1000, // Cache for 10 minutes
		refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
	});
};

// Hook to fetch Hydra analytics
export const useHydraAnalytics = (isHydraHealthy: boolean) => {
	return useQuery({
		queryKey: ["analytics", "hydra"],
		queryFn: async (): Promise<HydraAnalytics> => {
			try {
				// Fetch OAuth2 clients
				const clientsResponse = await listOAuth2Clients({ page_size: 500 });
				const clients = Array.isArray(clientsResponse.data) ? clientsResponse.data : [];

				// Count public vs confidential clients
				const publicClients = clients.filter((client) => client.token_endpoint_auth_method === "none").length;
				const confidentialClients = clients.length - publicClients;

				// Group by grant types
				const grantTypeGroups: Record<string, number> = {};
				clients.forEach((client) => {
					client.grant_types?.forEach((grantType) => {
						grantTypeGroups[grantType] = (grantTypeGroups[grantType] || 0) + 1;
					});
				});

				const clientsByGrantType = Object.entries(grantTypeGroups).map(([grantType, count]) => ({
					grantType,
					count: count as number,
				}));

				// Note: Consent sessions require a specific subject parameter
				// so we can't get a global count easily. Set to 0 for now.
				const consentSessions = 0;

				return {
					totalClients: clients.length,
					publicClients,
					confidentialClients,
					clientsByGrantType,
					consentSessions,
					tokensIssued: 0, // This would require additional API calls to get token statistics
					systemHealth: "healthy",
				};
			} catch (error) {
				console.error("Failed to fetch Hydra analytics:", error);
				// Return empty/zero data on error
				return {
					totalClients: 0,
					publicClients: 0,
					confidentialClients: 0,
					clientsByGrantType: [],
					consentSessions: 0,
					tokensIssued: 0,
					systemHealth: "error",
				};
			}
		},
		enabled: isHydraHealthy, // Only fetch when Hydra is healthy
		staleTime: 5 * 60 * 1000, // Cache for 5 minutes
		refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
	});
};

// Combined analytics hook
export const useAnalytics = () => {
	// Get Ory Network flag, settings loaded state, and Hydra enabled flag
	const isOryNetwork = useIsOryNetwork();
	const isSettingsLoaded = useSettingsLoaded();
	const hydraEnabled = useHydraEnabled();

	// Check health first (waits for settings to load)
	const kratosHealth = useKratosHealthCheck(isOryNetwork, isSettingsLoaded);
	const hydraHealth = useHydraHealthCheck(isOryNetwork, isSettingsLoaded, hydraEnabled);

	const isKratosHealthy = kratosHealth.data?.isHealthy ?? false;
	const isHydraHealthy = hydraHealth.data?.isHealthy ?? false;
	// Hydra is "available" if it's enabled AND healthy
	const isHydraAvailable = hydraEnabled && isHydraHealthy;

	// Only fetch analytics if services are healthy
	const identityAnalytics = useIdentityAnalytics(isKratosHealthy);
	const sessionAnalytics = useSessionAnalytics(isKratosHealthy);
	const systemAnalytics = useSystemAnalytics(isKratosHealthy);
	const hydraAnalytics = useHydraAnalytics(isHydraHealthy);

	// Determine loading state - include waiting for settings
	// Only include Hydra loading state if Hydra is enabled
	const isLoading =
		!isSettingsLoaded ||
		kratosHealth.isLoading ||
		(hydraEnabled && hydraHealth.isLoading) ||
		(isKratosHealthy && (identityAnalytics.isLoading || sessionAnalytics.isLoading || systemAnalytics.isLoading)) ||
		(isHydraHealthy && hydraAnalytics.isLoading);

	// Determine error state - Hydra unhealthy is NOT a fatal error
	// Only Kratos health issues are treated as fatal errors
	const isError =
		kratosHealth.isError ||
		(!kratosHealth.data?.isHealthy && !kratosHealth.isLoading) ||
		identityAnalytics.isError ||
		sessionAnalytics.isError ||
		systemAnalytics.isError;

	// Get the first error (prioritize Kratos health check errors)
	let firstError: any = null;
	if (!kratosHealth.data?.isHealthy && !kratosHealth.isLoading && kratosHealth.data?.error) {
		firstError = new Error(kratosHealth.data.error);
	} else {
		firstError = identityAnalytics.error || sessionAnalytics.error || systemAnalytics.error;
	}

	return {
		identity: {
			...identityAnalytics,
			error: firstError || identityAnalytics.error,
		},
		session: {
			...sessionAnalytics,
			error: firstError || sessionAnalytics.error,
		},
		system: { ...systemAnalytics, error: firstError || systemAnalytics.error },
		hydra: { ...hydraAnalytics, error: hydraAnalytics.error },
		isLoading,
		isError,
		isHydraAvailable,
		hydraEnabled,
		refetchAll: () => {
			kratosHealth.refetch();
			if (hydraEnabled) {
				hydraHealth.refetch();
			}
			identityAnalytics.refetch();
			sessionAnalytics.refetch();
			systemAnalytics.refetch();
			if (isHydraHealthy) {
				hydraAnalytics.refetch();
			}
		},
	};
};
