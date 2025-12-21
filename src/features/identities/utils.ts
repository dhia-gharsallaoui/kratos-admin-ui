import type { Identity } from "@ory/kratos-client";
import type { IdentityWithMeta } from "./types";

export function extractIdentityEmail(identity: Identity): string {
	const traits = identity.traits as any;
	return traits?.email || "N/A";
}

export function extractIdentityDisplayName(identity: Identity): string {
	const traits = identity.traits as any;
	return traits?.name || traits?.first_name || traits?.email || "Unknown";
}

export function formatIdentityForDisplay(identity: Identity): IdentityWithMeta {
	return {
		...identity,
		email: extractIdentityEmail(identity),
		displayName: extractIdentityDisplayName(identity),
		createdAt: identity.created_at,
		updatedAt: identity.updated_at,
	};
}

export function getIdentityStateColor(state?: string) {
	switch (state) {
		case "active":
			return "success";
		case "inactive":
			return "warning";
		default:
			return "default";
	}
}

export function getIdentityStateLabel(state?: string) {
	switch (state) {
		case "active":
			return "Active";
		case "inactive":
			return "Inactive";
		default:
			return "Unknown";
	}
}
