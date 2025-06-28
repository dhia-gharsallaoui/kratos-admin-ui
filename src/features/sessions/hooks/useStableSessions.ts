import { useRef, useMemo } from 'react';

interface UseStableSessionsOptions {
  sessions: any[];
  searchQuery: string;
  getIdentityDisplay: (session: any) => string;
}

export const useStableSessions = ({ sessions, searchQuery, getIdentityDisplay }: UseStableSessionsOptions) => {
  // Refs to store stable state
  const stableSessionsRef = useRef<any[]>([]);
  const lastSessionIdsRef = useRef<string>('');

  // Determine if we're searching
  const isSearching = !!searchQuery.trim();

  // Compute the current state
  const currentState = useMemo(() => {
    let filteredSessions: any[];

    if (!isSearching) {
      filteredSessions = sessions;
    } else {
      // Filter sessions when searching
      filteredSessions = sessions.filter((session) => {
        const identityDisplay = getIdentityDisplay(session).toLowerCase();
        const id = session.id.toLowerCase();
        const query = searchQuery.toLowerCase();
        return identityDisplay.includes(query) || id.includes(query);
      });
    }

    // Create a unique identifier for this set of sessions
    const sessionIds = filteredSessions
      .map((s) => s.id)
      .sort()
      .join(',');

    // Only update our stable reference if the session IDs actually changed
    if (sessionIds !== lastSessionIdsRef.current) {
      stableSessionsRef.current = filteredSessions;
      lastSessionIdsRef.current = sessionIds;
    }

    return {
      sessions: stableSessionsRef.current,
      sessionIds: lastSessionIdsRef.current,
      count: stableSessionsRef.current.length,
    };
  }, [sessions, searchQuery, isSearching, getIdentityDisplay]);

  return currentState;
};
