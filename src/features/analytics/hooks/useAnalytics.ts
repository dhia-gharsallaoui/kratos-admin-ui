import { useQuery } from '@tanstack/react-query';
import { getAllIdentities, getSessionsUntilDate, listIdentitySchemas, listSessions } from '@/services/kratos';
import { IdentityAnalytics, SessionAnalytics, SystemAnalytics } from '../types';

// Hook to fetch comprehensive identity analytics
export const useIdentityAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'identities'],
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
        const dateStr = date.toISOString().split('T')[0];
        const count = allIdentities.filter((identity) => {
          const createdAt = new Date(identity.created_at);
          return createdAt.toISOString().split('T')[0] === dateStr;
        }).length;
        identitiesByDay.push({ date: dateStr, count });
      }

      // Group by schema
      const schemaGroups = allIdentities.reduce(
        (acc, identity) => {
          const schema = identity.schema_id || 'unknown';
          acc[schema] = (acc[schema] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

// Hook to fetch session analytics
export const useSessionAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'sessions'],
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
        if (isNaN(authenticatedAt.getTime())) return false;
        return authenticatedAt >= sevenDaysAgo;
      }).length;

      // Group sessions by day (last 7 days) - count sessions that were active on each day
      const sessionsByDay: Array<{ date: string; count: number }> = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

        const count = sessions.filter((session) => {
          if (!session.authenticated_at) return false;

          const authenticatedAt = new Date(session.authenticated_at);
          if (isNaN(authenticatedAt.getTime())) return false;

          // Session must have started before or on this day
          if (authenticatedAt > dayEnd) return false;

          // If session has expiry, it must not have expired before this day started
          if (session.expires_at) {
            const expiresAt = new Date(session.expires_at);
            if (isNaN(expiresAt.getTime())) return true; // If invalid expiry, assume still active
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
          const authenticated = new Date(session.authenticated_at || '').getTime();
          const issued = new Date(session.issued_at || '').getTime();
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
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Hook to fetch system analytics
export const useSystemAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'system'],
    queryFn: async (): Promise<SystemAnalytics> => {
      const schemasResponse = await listIdentitySchemas();
      const schemas = schemasResponse.data;

      return {
        totalSchemas: schemas.length,
        systemHealth: 'healthy', // Could be enhanced with actual health checks
        lastUpdated: new Date(),
      };
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });
};

// Combined analytics hook
export const useAnalytics = () => {
  const identityAnalytics = useIdentityAnalytics();
  const sessionAnalytics = useSessionAnalytics();
  const systemAnalytics = useSystemAnalytics();

  return {
    identity: identityAnalytics,
    session: sessionAnalytics,
    system: systemAnalytics,
    isLoading: identityAnalytics.isLoading || sessionAnalytics.isLoading || systemAnalytics.isLoading,
    isError: identityAnalytics.isError || sessionAnalytics.isError || systemAnalytics.isError,
    refetchAll: () => {
      identityAnalytics.refetch();
      sessionAnalytics.refetch();
      systemAnalytics.refetch();
    },
  };
};
