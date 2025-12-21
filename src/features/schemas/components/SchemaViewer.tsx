"use client";

import type { IdentitySchemaContainer } from "@ory/kratos-client";
import type React from "react";
import { Box, Card, CardContent, Chip, LoadingState, Typography } from "@/components/ui";
import { extractSchemaFields, formatSchemaForDisplay } from "../utils";

interface SchemaViewerProps {
	schema: IdentitySchemaContainer;
	loading?: boolean;
}

const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema, loading = false }) => {
	if (loading) {
		return (
			<Card>
				<LoadingState variant="section" message="Loading schema details..." />
			</Card>
		);
	}

	const formattedSchema = formatSchemaForDisplay(schema);
	const schemaObj = typeof schema.schema === "string" ? JSON.parse(schema.schema) : schema.schema;
	const fields = extractSchemaFields(schemaObj);

	return (
		<Card>
			<CardContent>
				<Typography variant="heading" size="lg" gutterBottom>
					{formattedSchema.displayName}
				</Typography>

				<Typography variant="body" color="text.secondary" component="p" sx={{ mb: 2 }}>
					{formattedSchema.description}
				</Typography>

				<Box sx={{ mb: 2 }}>
					<Typography variant="label" gutterBottom>
						Schema ID: {schema.id}
					</Typography>
					{formattedSchema.isDefault && <Chip label="Default Schema" variant="gradient" />}
				</Box>

				<Box sx={{ mb: 2 }}>
					<Typography variant="label" gutterBottom>
						Fields ({formattedSchema.fieldCount}):
					</Typography>
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
						{fields.map((field) => (
							<Chip key={field} label={field} variant="tag" />
						))}
					</Box>
				</Box>

				<Typography variant="label" gutterBottom>
					Schema Definition:
				</Typography>
				<Box
					component="pre"
					sx={{
						backgroundColor: "grey.100",
						p: 2,
						borderRadius: 1,
						overflow: "auto",
						fontSize: "0.875rem",
						fontFamily: "monospace",
						maxHeight: 400,
					}}
				>
					{JSON.stringify(schemaObj, null, 2)}
				</Box>
			</CardContent>
		</Card>
	);
};

export default SchemaViewer;
