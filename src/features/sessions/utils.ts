import type { Session } from "@ory/kratos-client";
import type { SessionAnalytics, SessionWithMeta } from "./types";

export function formatSessionForDisplay(session: Session): SessionWithMeta {
	const identity = session.identity;
	const traits = identity?.traits as any;

	return {
		...session,
		identityEmail: traits?.email || "N/A",
		identityDisplayName: traits?.name || traits?.first_name || traits?.email || "Unknown",
		isActive: session.active,
		durationMinutes: calculateSessionDuration(session),
	};
}

export function calculateSessionDuration(session: Session): number {
	if (!session.issued_at || !session.expires_at) return 0;

	const issued = new Date(session.issued_at);
	const expires = new Date(session.expires_at);

	return Math.round((expires.getTime() - issued.getTime()) / (1000 * 60));
}

export function generateSessionAnalytics(sessions: Session[]): SessionAnalytics {
	const now = new Date();
	const activeSessions = sessions.filter((s) => s.active).length;

	// Calculate sessions by day for the last 7 days
	const sessionsByDay = [];
	for (let i = 6; i >= 0; i--) {
		const date = new Date(now);
		date.setDate(date.getDate() - i);
		const dateStr = date.toISOString().split("T")[0];

		const dayStart = new Date(date);
		dayStart.setHours(0, 0, 0, 0);
		const dayEnd = new Date(date);
		dayEnd.setHours(23, 59, 59, 999);

		const count = sessions.filter((session) => {
			const issuedAt = new Date(session.issued_at || "");
			return issuedAt >= dayStart && issuedAt <= dayEnd;
		}).length;

		sessionsByDay.push({
			date: dateStr,
			count,
		});
	}

	// Calculate average session duration
	const validSessions = sessions.filter((s) => s.issued_at && s.expires_at);
	const totalDuration = validSessions.reduce((sum, session) => {
		return sum + calculateSessionDuration(session);
	}, 0);
	const averageSessionDuration = validSessions.length > 0 ? Math.round(totalDuration / validSessions.length) : 0;

	return {
		totalSessions: sessions.length,
		activeSessions,
		sessionsByDay,
		averageSessionDuration,
	};
}

export function getSessionStatusColor(isActive?: boolean) {
	return isActive ? "success" : "default";
}

export function getSessionStatusLabel(isActive?: boolean) {
	return isActive ? "Active" : "Expired";
}
