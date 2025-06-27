import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listIdentitySessions, listSessions } from '@/services/kratos';

// General sessions hook
export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data } = await listSessions();
      return data;
    },
  });
};

// Identity-specific sessions hook
export const useIdentitySessions = (identityId: string) => {
  return useQuery({
    queryKey: ['identity', identityId, 'sessions'],
    queryFn: async () => {
      const { data } = await listIdentitySessions({ id: identityId });
      return data;
    },
    enabled: !!identityId,
  });
};

// Session revocation mutation
export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string }) => {
      // Implementation depends on your API
      // await revokeSession(sessionId);
      return sessionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

// Revoke all sessions for an identity
export const useRevokeAllSessions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ identityId }: { identityId: string }) => {
      // Implementation depends on your API
      // await revokeAllSessions(identityId);
      return identityId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['identity', variables.identityId, 'sessions'] });
    },
  });
};