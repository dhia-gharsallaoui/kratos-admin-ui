import type { Identity, IdentityStateEnum } from "@ory/kratos-client";

export interface IdentityWithMeta extends Identity {
	// Additional computed fields for UI
	email?: string;
	displayName?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface IdentitiesTableProps {
	identities: Identity[];
	loading: boolean;
	onEdit: (identity: Identity) => void;
	onDelete: (identity: Identity) => void;
	onRecover: (identity: Identity) => void;
}

export interface IdentityFormData {
	schemaId: string;
	traits: Record<string, any>;
	state?: IdentityStateEnum;
}

export interface RecoveryLinkData {
	recoveryLink: string;
	expiresAt: string;
}

export interface IdentityPaginationResult {
	identities: Identity[];
	totalCount: number;
	isComplete: boolean;
	pagesFetched: number;
}
