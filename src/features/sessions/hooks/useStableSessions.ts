import { useMemo, useRef } from "react";

interface UseStableSessionsOptions {
	sessions: any[];
	searchQuery: string;
	getIdentityDisplay: (session: any) => string;
}

export const useStableSessions = ({ sessions, searchQuery, getIdentityDisplay }: UseStableSessionsOptions) => {
	// Refs to store stable state
	const stableSessionsRef = useRef<any[]>([]);
	const lastSessionFingerprintRef = useRef<string>("");

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

		// Create a unique identifier for this set of sessions including key properties
		const sessionFingerprint = filteredSessions
			.map((s) => `${s.id}:${s.active}:${s.expires_at}:${s.authenticated_at}`)
			.sort()
			.join(",");

		// Only update our stable reference if the session fingerprint actually changed
		if (sessionFingerprint !== lastSessionFingerprintRef.current) {
			stableSessionsRef.current = filteredSessions;
			lastSessionFingerprintRef.current = sessionFingerprint;
		}

		return {
			sessions: stableSessionsRef.current,
			sessionIds: lastSessionFingerprintRef.current,
			count: stableSessionsRef.current.length,
		};
	}, [sessions, searchQuery, isSearching, getIdentityDisplay]);

	return currentState;
};
