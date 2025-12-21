"use client";

import { Schema as SchemaIcon } from "@mui/icons-material";
import type { IdentitySchemaContainer } from "@ory/kratos-client";
import type React from "react";
import { Box, Card, Chip, EmptyState, List, ListItem, ListItemButton, ListItemIcon, ListItemText, LoadingState, Typography } from "@/components/ui";
import { formatSchemaForDisplay } from "../utils";

interface SchemaListProps {
	schemas: IdentitySchemaContainer[];
	loading: boolean;
	selectedSchemaId?: string;
	onSchemaSelect: (schema: IdentitySchemaContainer) => void;
}

const SchemaList: React.FC<SchemaListProps> = ({ schemas, loading, selectedSchemaId, onSchemaSelect }) => {
	if (loading) {
		return (
			<Card>
				<LoadingState variant="section" message="Loading schemas..." />
			</Card>
		);
	}

	if (schemas.length === 0) {
		return (
			<Card>
				<EmptyState icon={SchemaIcon} title="No schemas found" description="No identity schemas are currently configured" />
			</Card>
		);
	}

	return (
		<Card>
			<List>
				{schemas.map((schema) => {
					const formattedSchema = formatSchemaForDisplay(schema);
					const isSelected = selectedSchemaId === schema.id;

					return (
						<ListItem key={schema.id} disablePadding>
							<ListItemButton onClick={() => onSchemaSelect(schema)} selected={isSelected}>
								<ListItemIcon>
									<SchemaIcon />
								</ListItemIcon>
								<ListItemText
									primary={
										<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
											<Typography variant="label">{formattedSchema.displayName}</Typography>
											{formattedSchema.isDefault && <Chip label="Default" variant="tag" />}
										</Box>
									}
									secondary={
										<Box>
											<Typography variant="body" color="text.secondary">
												{formattedSchema.description}
											</Typography>
											<Typography variant="label" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
												{formattedSchema.fieldCount} fields • ID: {schema.id}
											</Typography>
										</Box>
									}
								/>
							</ListItemButton>
						</ListItem>
					);
				})}
			</List>
		</Card>
	);
};

export default SchemaList;
