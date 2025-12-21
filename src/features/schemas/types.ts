import type { IdentitySchemaContainer } from "@ory/kratos-client";

export interface SchemaWithMeta extends IdentitySchemaContainer {
	// Additional computed fields for UI
	displayName?: string;
	description?: string;
	fieldCount?: number;
	isDefault?: boolean;
}

export interface SchemaViewerProps {
	schema: IdentitySchemaContainer;
	loading?: boolean;
}

export interface SchemaListProps {
	schemas: IdentitySchemaContainer[];
	loading: boolean;
	onSchemaSelect: (schema: IdentitySchemaContainer) => void;
}

export interface SchemaAnalytics {
	totalSchemas: number;
	schemaDistribution: Array<{
		id: string;
		name: string;
		count: number;
		percentage: number;
	}>;
}
