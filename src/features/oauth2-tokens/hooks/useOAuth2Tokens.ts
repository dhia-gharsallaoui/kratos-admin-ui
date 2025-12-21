import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
	deleteOAuth2AccessTokens,
	exchangeOAuth2Token,
	flushInactiveOAuth2Tokens,
	type IntrospectTokenRequest,
	introspectOAuth2Token,
	type RevokeTokenRequest,
	revokeOAuth2Token,
	type TokenExchangeRequest,
} from "@/services/hydra";

// Query keys
export const oauth2TokensKeys = {
	all: ["oauth2-tokens"] as const,
	introspections: () => [...oauth2TokensKeys.all, "introspections"] as const,
	introspection: (token: string) => [...oauth2TokensKeys.introspections(), token] as const,
	stats: () => [...oauth2TokensKeys.all, "stats"] as const,
};

// Hook to introspect a token
export function useIntrospectOAuth2Token() {
	return useMutation({
		mutationFn: (tokenData: IntrospectTokenRequest) => introspectOAuth2Token(tokenData),
	});
}

// Hook to revoke a token
export function useRevokeOAuth2Token() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (tokenData: RevokeTokenRequest) => revokeOAuth2Token(tokenData),
		onSuccess: () => {
			// Invalidate token introspection cache
			queryClient.invalidateQueries({
				queryKey: oauth2TokensKeys.introspections(),
			});
			queryClient.invalidateQueries({ queryKey: oauth2TokensKeys.stats() });
		},
	});
}

// Hook to exchange tokens
export function useExchangeOAuth2Token() {
	return useMutation({
		mutationFn: (tokenData: TokenExchangeRequest) => exchangeOAuth2Token(tokenData),
	});
}

// Hook to delete access tokens for a subject
export function useDeleteOAuth2AccessTokens() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (subject: string) => deleteOAuth2AccessTokens(subject),
		onSuccess: () => {
			// Invalidate token-related cache
			queryClient.invalidateQueries({
				queryKey: oauth2TokensKeys.introspections(),
			});
			queryClient.invalidateQueries({ queryKey: oauth2TokensKeys.stats() });
		},
	});
}

// Hook to flush inactive tokens
export function useFlushInactiveOAuth2Tokens() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (notAfter?: string) => flushInactiveOAuth2Tokens(notAfter),
		onSuccess: () => {
			// Invalidate all token-related cache
			queryClient.invalidateQueries({ queryKey: oauth2TokensKeys.all });
		},
	});
}

// Hook for managing multiple token introspections
export function useTokenIntrospectionManager() {
	const [introspectedTokens, setIntrospectedTokens] = useState<Map<string, any>>(new Map());
	const introspectMutation = useIntrospectOAuth2Token();

	const addTokenIntrospection = useCallback(
		async (tokenData: IntrospectTokenRequest) => {
			const result = await introspectMutation.mutateAsync(tokenData);
			const tokenKey = `${tokenData.token.substring(0, 8)}...${tokenData.token.substring(tokenData.token.length - 8)}`;

			setIntrospectedTokens((prev) =>
				new Map(prev).set(tokenKey, {
					...result.data,
					tokenPreview: tokenKey,
					introspectedAt: new Date().toISOString(),
				}),
			);

			return result;
		},
		[introspectMutation],
	);

	const removeTokenIntrospection = useCallback((tokenKey: string) => {
		setIntrospectedTokens((prev) => {
			const newMap = new Map(prev);
			newMap.delete(tokenKey);
			return newMap;
		});
	}, []);

	const clearAllIntrospections = useCallback(() => {
		setIntrospectedTokens(new Map());
	}, []);

	return {
		introspectedTokens: Array.from(introspectedTokens.entries()).map(([key, value]) => ({
			key,
			...value,
		})),
		addTokenIntrospection,
		removeTokenIntrospection,
		clearAllIntrospections,
		isIntrospecting: introspectMutation.isPending,
		introspectionError: introspectMutation.error,
	};
}

// Hook for token statistics (mock implementation since we don't have a direct endpoint)
export function useOAuth2TokenStats(introspectedTokens: any[] = []) {
	return useQuery({
		queryKey: [...oauth2TokensKeys.stats(), introspectedTokens.length],
		queryFn: () => {
			if (introspectedTokens.length === 0) {
				return {
					totalTokens: 0,
					activeTokens: 0,
					expiredTokens: 0,
					revokedTokens: 0,
					tokenTypeDistribution: {},
					clientDistribution: {},
					scopeDistribution: {},
					averageTokenLifetime: 0,
					tokensExpiringIn24h: 0,
					tokensExpiringIn7d: 0,
				};
			}

			const now = Math.floor(Date.now() / 1000);
			const stats = {
				totalTokens: introspectedTokens.length,
				activeTokens: 0,
				expiredTokens: 0,
				revokedTokens: 0,
				tokenTypeDistribution: {} as Record<string, number>,
				clientDistribution: {} as Record<string, number>,
				scopeDistribution: {} as Record<string, number>,
				averageTokenLifetime: 0,
				tokensExpiringIn24h: 0,
				tokensExpiringIn7d: 0,
			};

			let totalLifetime = 0;
			let validLifetimeCount = 0;

			introspectedTokens.forEach((token) => {
				// Active/inactive counts
				if (token.active) {
					stats.activeTokens++;
				} else {
					stats.revokedTokens++;
				}

				// Expired counts
				if (token.exp && token.exp < now) {
					stats.expiredTokens++;
				}

				// Expiring soon counts
				if (token.exp) {
					const timeToExpiry = token.exp - now;
					if (timeToExpiry > 0 && timeToExpiry <= 86400) {
						// 24 hours
						stats.tokensExpiringIn24h++;
					}
					if (timeToExpiry > 0 && timeToExpiry <= 604800) {
						// 7 days
						stats.tokensExpiringIn7d++;
					}
				}

				// Token type distribution
				if (token.token_type) {
					stats.tokenTypeDistribution[token.token_type] = (stats.tokenTypeDistribution[token.token_type] || 0) + 1;
				}

				// Client distribution
				if (token.client_id) {
					stats.clientDistribution[token.client_id] = (stats.clientDistribution[token.client_id] || 0) + 1;
				}

				// Scope distribution
				if (token.scope) {
					const scopes = token.scope.split(" ");
					scopes.forEach((scope: string) => {
						if (scope.trim()) {
							stats.scopeDistribution[scope.trim()] = (stats.scopeDistribution[scope.trim()] || 0) + 1;
						}
					});
				}

				// Average token lifetime calculation
				if (token.iat && token.exp) {
					totalLifetime += token.exp - token.iat;
					validLifetimeCount++;
				}
			});

			if (validLifetimeCount > 0) {
				stats.averageTokenLifetime = Math.floor(totalLifetime / validLifetimeCount);
			}

			return stats;
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

// Hook for batch token operations
export function useBatchTokenOperations() {
	const revokeTokenMutation = useRevokeOAuth2Token();
	const flushTokensMutation = useFlushInactiveOAuth2Tokens();

	const revokeBatchTokens = useCallback(
		async (tokens: RevokeTokenRequest[]) => {
			const results = await Promise.allSettled(tokens.map((tokenData) => revokeTokenMutation.mutateAsync(tokenData)));

			const successful = results.filter((result) => result.status === "fulfilled").length;
			const failed = results.filter((result) => result.status === "rejected").length;

			return { successful, failed, results };
		},
		[revokeTokenMutation],
	);

	return {
		revokeBatchTokens,
		flushTokensMutation,
		isProcessing: revokeTokenMutation.isPending || flushTokensMutation.isPending,
	};
}
