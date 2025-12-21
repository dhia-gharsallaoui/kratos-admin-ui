import type { IdentitySchemaContainer } from "@ory/kratos-client";
import type { SchemaAnalytics, SchemaWithMeta } from "./types";

export function formatSchemaForDisplay(schema: IdentitySchemaContainer): SchemaWithMeta {
	const schemaObj = typeof schema.schema === "string" ? JSON.parse(schema.schema) : schema.schema;

	return {
		...schema,
		displayName: schemaObj?.title || schema.id || "Untitled Schema",
		description: schemaObj?.description || "No description available",
		fieldCount: countSchemaFields(schemaObj),
		isDefault: schema.id === "default",
	};
}

export function countSchemaFields(schemaObj: any): number {
	if (!schemaObj?.properties) return 0;

	let count = 0;
	const properties = schemaObj.properties;

	for (const key in properties) {
		if (properties[key]) {
			count++;
			// Count nested fields in objects
			if (properties[key].type === "object" && properties[key].properties) {
				count += countSchemaFields(properties[key]);
			}
		}
	}

	return count;
}

export function extractSchemaFields(schemaObj: any): string[] {
	if (!schemaObj?.properties) return [];

	const fields: string[] = [];
	const properties = schemaObj.properties;

	for (const key in properties) {
		if (properties[key]) {
			fields.push(key);
		}
	}

	return fields;
}

export function generateSchemaAnalytics(schemas: IdentitySchemaContainer[], identities: any[] = []): SchemaAnalytics {
	const schemaDistribution = schemas.map((schema) => {
		const count = identities.filter((identity) => identity.schema_id === schema.id).length;

		const percentage = identities.length > 0 ? Math.round((count / identities.length) * 100) : 0;

		return {
			id: schema.id || "unknown",
			name: formatSchemaForDisplay(schema).displayName || "Unknown",
			count,
			percentage,
		};
	});

	return {
		totalSchemas: schemas.length,
		schemaDistribution,
	};
}

export function validateSchemaJson(jsonString: string): {
	valid: boolean;
	error?: string;
} {
	try {
		const parsed = JSON.parse(jsonString);

		// Basic JSON Schema validation
		if (typeof parsed !== "object" || parsed === null) {
			return { valid: false, error: "Schema must be a valid JSON object" };
		}

		if (!parsed.type || parsed.type !== "object") {
			return { valid: false, error: 'Schema must have type "object"' };
		}

		if (!parsed.properties) {
			return { valid: false, error: "Schema must have properties" };
		}

		return { valid: true };
	} catch (_error) {
		return { valid: false, error: "Invalid JSON format" };
	}
}
