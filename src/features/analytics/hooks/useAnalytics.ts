"use client";

import { useQuery } from "@tanstack/react-query";
import { listOAuth2Clients } from "@/api/hydra/clients";
import { checkHydraHealth } from "@/api/hydra/health";
import { checkKratosHealth } from "@/api/kratos/health";
import { listIdentities } from "@/api/kratos/identities";
import { listSchemas } from "@/api/kratos/schemas";
import { listSessions } from "@/api/kratos/sessions";
import { useHydraEnabled, useIsOryNetwork, useSettingsLoaded } from "@/features/settings/hooks/useSettings";
import type { HydraAnalytics, IdentityAnalytics, SessionAnalytics, SystemAnalytics } from "../types";

// Health check hooks
const useKratosHealthCheck = (isOryNetwork: boolean, isSettingsLoaded: boolean) => {
	return useQuery({
		queryKey: ["health", "kratos", isOryNetwork],
		queryFn: async () => {
			if (isOryNetwork) {
				return { isHealthy: true };
			}
			return checkKratosHealth();
		},
		enabled: isSettingsLoaded,
		staleTime: 2 * 60 * 1000,
		retry: 1,
	});
};

const useHydraHealthCheck = (isOryNetwork: boolean, isSettingsLoaded: boolean, hydraEnabled: boolean) => {
	return useQuery({
		queryKey: ["health", "hydra", isOryNetwork, hydraEnabled],
		queryFn: async () => {
			if (!hydraEnabled) {
				return { isHealthy: false, disabled: true };
			}
			if (isOryNetwork) {
				return { isHealthy: true };
			}
			return checkHydraHealth();
		},
		enabled: isSettingsLoaded,
		staleTime: 2 * 60 * 1000,
		retry: 1,
	});
};

// Helper: fetch all identities across pages via API
async function fetchAllIdentitiesViaApi(maxPages = 20, pageSize = 250): Promise<any[]> {
	let allIdentities: any[] = [];
	let pageToken: string | undefined;
	let hasMore = true;
	let pageCount = 0;

	while (hasMore && pageCount < maxPages) {
		const data = await listIdentities({ pageSize, pageToken });
		allIdentities = [...allIdentities, ...data.identities];
		hasMore = data.hasMore;
		pageToken = data.nextPageToken || undefined;
		pageCount++;

		if (hasMore) {
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	}

	return allIdentities;
}

// Helper: fetch sessions until a date via API
async function fetchSessionsUntilDate(untilDate: Date, maxPages = 10, pageSize = 250): Promise<any[]> {
	const allSessions: any[] = [];
	let pageToken: string | undefined;
	let hasMore = true;
	let pageCount = 0;
	let shouldStop = false;

	while (hasMore && pageCount < maxPages && !shouldStop) {
		const data = await listSessions({ pageSize, pageToken });

		for (const session of data.sessions) {
			const sessionDate = new Date(session.authenticated_at || session.issued_at || "");
			if (sessionDate >= untilDate) {
				allSessions.push(session);
			} else {
				shouldStop = true;
				break;
			}
		}

		if (data.sessions.length === 0) shouldStop = true;

		if (!shouldStop) {
			hasMore = data.hasMore;
			pageToken = data.nextPageToken || undefined;
			if (hasMore) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		}

		pageCount++;
	}

	return allSessions;
}

// Hook to fetch comprehensive identity analytics
export const useIdentityAnalytics = (isKratosHealthy: boolean) => {
	return useQuery({
		queryKey: ["analytics", "identities"],
		queryFn: async (): Promise<IdentityAnalytics> => {
			const allIdentities = await fetchAllIdentitiesViaApi();

			const now = new Date();
			const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

			const newIdentitiesLast30Days = allIdentities.filter((identity) => {
				const createdAt = new Date(identity.created_at);
				return createdAt >= thirtyDaysAgo;
			}).length;

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
		enabled: isKratosHealthy,
		staleTime: 5 * 60 * 1000,
		refetchInterval: 10 * 60 * 1000,
	});
};

// Hook to fetch session analytics
export const useSessionAnalytics = (isKratosHealthy: boolean) => {
	return useQuery({
		queryKey: ["analytics", "sessions"],
		queryFn: async (): Promise<SessionAnalytics> => {
			const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
			const sessions = await fetchSessionsUntilDate(sevenDaysAgo);

			const now = new Date();
			const sessionsLast7Days = sessions.filter((session) => {
				if (!session.authenticated_at) return false;
				const authenticatedAt = new Date(session.authenticated_at);
				if (Number.isNaN(authenticatedAt.getTime())) return false;
				return authenticatedAt >= sevenDaysAgo;
			}).length;

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
					if (authenticatedAt > dayEnd) return false;
					if (session.expires_at) {
						const expiresAt = new Date(session.expires_at);
						if (Number.isNaN(expiresAt.getTime())) return true;
						if (expiresAt < dayStart) return false;
					}
					return true;
				}).length;
				sessionsByDay.push({ date: dateStr, count });
			}

			const sessionDurations = sessions
				.filter((session) => session.authenticated_at && session.issued_at)
				.map((session) => {
					const authenticated = new Date(session.authenticated_at || "").getTime();
					const issued = new Date(session.issued_at || "").getTime();
					return Math.abs(authenticated - issued) / (1000 * 60);
				});

			const averageSessionDuration =
				sessionDurations.length > 0 ? sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length : 0;

			// Get active sessions count
			const activeData = await listSessions({ active: true, pageSize: 250 });
			const activeSessions = activeData.sessions.length;

			return {
				totalSessions: sessions.length,
				activeSessions,
				sessionsByDay,
				averageSessionDuration: Math.round(averageSessionDuration),
				sessionsLast7Days,
			};
		},
		enabled: isKratosHealthy,
		staleTime: 2 * 60 * 1000,
		refetchInterval: 5 * 60 * 1000,
	});
};

// Hook to fetch system analytics
export const useSystemAnalytics = (isKratosHealthy: boolean) => {
	return useQuery({
		queryKey: ["analytics", "system"],
		queryFn: async (): Promise<SystemAnalytics> => {
			const schemas = await listSchemas();
			return {
				totalSchemas: schemas.length,
				systemHealth: "healthy",
				lastUpdated: new Date(),
			};
		},
		enabled: isKratosHealthy,
		staleTime: 10 * 60 * 1000,
		refetchInterval: 15 * 60 * 1000,
	});
};

// Hook to fetch Hydra analytics
export const useHydraAnalytics = (isHydraHealthy: boolean) => {
	return useQuery({
		queryKey: ["analytics", "hydra"],
		queryFn: async (): Promise<HydraAnalytics> => {
			try {
				const clientsResponse = await listOAuth2Clients({ pageSize: 500 });
				const clients = Array.isArray(clientsResponse.data) ? clientsResponse.data : [];

				const publicClients = clients.filter((client) => client.token_endpoint_auth_method === "none").length;
				const confidentialClients = clients.length - publicClients;

				const grantTypeGroups: Record<string, number> = {};
				clients.forEach((client) => {
					client.grant_types?.forEach((grantType: string) => {
						grantTypeGroups[grantType] = (grantTypeGroups[grantType] || 0) + 1;
					});
				});

				const clientsByGrantType = Object.entries(grantTypeGroups).map(([grantType, count]) => ({
					grantType,
					count: count as number,
				}));

				return {
					totalClients: clients.length,
					publicClients,
					confidentialClients,
					clientsByGrantType,
					consentSessions: 0,
					tokensIssued: 0,
					systemHealth: "healthy",
				};
			} catch (error) {
				console.error("Failed to fetch Hydra analytics:", error);
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
		enabled: isHydraHealthy,
		staleTime: 5 * 60 * 1000,
		refetchInterval: 10 * 60 * 1000,
	});
};

// Combined analytics hook
export const useAnalytics = () => {
	const isOryNetwork = useIsOryNetwork();
	const isSettingsLoaded = useSettingsLoaded();
	const hydraEnabled = useHydraEnabled();

	const kratosHealth = useKratosHealthCheck(isOryNetwork, isSettingsLoaded);
	const hydraHealth = useHydraHealthCheck(isOryNetwork, isSettingsLoaded, hydraEnabled);

	const isKratosHealthy = kratosHealth.data?.isHealthy ?? false;
	const isHydraHealthy = hydraHealth.data?.isHealthy ?? false;
	const isHydraAvailable = hydraEnabled && isHydraHealthy;

	const identityAnalytics = useIdentityAnalytics(isKratosHealthy);
	const sessionAnalytics = useSessionAnalytics(isKratosHealthy);
	const systemAnalytics = useSystemAnalytics(isKratosHealthy);
	const hydraAnalytics = useHydraAnalytics(isHydraHealthy);

	const isLoading =
		!isSettingsLoaded ||
		kratosHealth.isLoading ||
		(hydraEnabled && hydraHealth.isLoading) ||
		(isKratosHealthy && (identityAnalytics.isLoading || sessionAnalytics.isLoading || systemAnalytics.isLoading)) ||
		(isHydraHealthy && hydraAnalytics.isLoading);

	const isError =
		kratosHealth.isError ||
		(!kratosHealth.data?.isHealthy && !kratosHealth.isLoading) ||
		identityAnalytics.isError ||
		sessionAnalytics.isError ||
		systemAnalytics.isError;

	let firstError: any = null;
	if (!kratosHealth.data?.isHealthy && !kratosHealth.isLoading && kratosHealth.data?.error) {
		firstError = new Error(kratosHealth.data.error);
	} else {
		firstError = identityAnalytics.error || sessionAnalytics.error || systemAnalytics.error;
	}

	return {
		identity: { ...identityAnalytics, error: firstError || identityAnalytics.error },
		session: { ...sessionAnalytics, error: firstError || sessionAnalytics.error },
		system: { ...systemAnalytics, error: firstError || systemAnalytics.error },
		hydra: { ...hydraAnalytics, error: hydraAnalytics.error },
		isLoading,
		isError,
		isHydraAvailable,
		hydraEnabled,
		refetchAll: () => {
			kratosHealth.refetch();
			if (hydraEnabled) hydraHealth.refetch();
			identityAnalytics.refetch();
			sessionAnalytics.refetch();
			systemAnalytics.refetch();
			if (isHydraHealthy) hydraAnalytics.refetch();
		},
	};
};
