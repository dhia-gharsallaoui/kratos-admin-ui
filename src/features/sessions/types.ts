import type { Session } from "@ory/kratos-client";

export interface SessionWithMeta extends Session {
	// Additional computed fields for UI
	identityEmail?: string;
	identityDisplayName?: string;
	isActive?: boolean;
	durationMinutes?: number;
}

export interface SessionsTableProps {
	sessions: Session[];
	loading: boolean;
	onRefresh: () => void;
}

export interface SessionAnalytics {
	totalSessions: number;
	activeSessions: number;
	sessionsByDay: Array<{
		date: string;
		count: number;
	}>;
	averageSessionDuration: number;
}
