import { Cancel, Save } from "@mui/icons-material";
import Form from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import React, { useState } from "react";
import { Alert, Box, Button, Card, FormControl, InputLabel, MenuItem, Select, Spinner, Tooltip, Typography } from "@/components/ui";

// Add custom format for tel to avoid validation warnings
validator.ajv.addFormat("tel", {
	type: "string",
	validate: (data: string) => {
		// Basic phone number validation - allow any string that could be a phone number
		return typeof data === "string" && data.length > 0;
	},
});

import type { IdentitySchemaContainer } from "@ory/kratos-client";
import { useRouter } from "next/navigation";
import { useSchemas } from "@/features/schemas/hooks/useSchemas";
import { useCreateIdentity } from "../hooks/useIdentities";
import {
	convertKratosSchemaToRJSF,
	createUISchema,
	FieldTemplate,
	ObjectFieldTemplate,
	SelectWidget,
	SubmitButton,
	TelWidget,
	TextWidget,
} from "./shared-form-widgets";

interface CreateIdentityFormProps {
	onSuccess?: () => void;
	onCancel?: () => void;
}

const CreateIdentityForm: React.FC<CreateIdentityFormProps> = ({ onSuccess, onCancel }) => {
	const router = useRouter();
	const createIdentityMutation = useCreateIdentity();
	const { data: schemas, isLoading: schemasLoading } = useSchemas();

	const [selectedSchemaId, setSelectedSchemaId] = useState<string>("");
	const [formData, setFormData] = useState<any>({});
	const [formSchema, setFormSchema] = useState<any | null>(null);

	// Custom widgets for better form experience
	const widgets = React.useMemo(
		() => ({
			tel: TelWidget,
			TextWidget: TextWidget,
			SelectWidget: SelectWidget,
			text: TextWidget,
			email: TextWidget,
		}),
		[],
	);

	// Custom templates for Material-UI styling
	const templates = React.useMemo(
		() => ({
			FieldTemplate: FieldTemplate,
			ObjectFieldTemplate: ObjectFieldTemplate,
			SubmitButton: SubmitButton,
		}),
		[],
	);

	const handleSchemaChange = (schemaId: string) => {
		setSelectedSchemaId(schemaId);
		setFormData({});

		if (schemaId && schemas) {
			const selectedSchema = schemas.find((s: IdentitySchemaContainer) => s.id === schemaId);
			if (selectedSchema?.schema) {
				const rjsfSchema = convertKratosSchemaToRJSF(selectedSchema.schema);
				setFormSchema(rjsfSchema);
			}
		} else {
			setFormSchema(null);
		}
	};

	const handleSubmit = async (data: any) => {
		const { formData: submitData } = data;

		try {
			await createIdentityMutation.mutateAsync({
				schemaId: selectedSchemaId,
				traits: submitData,
			});

			onSuccess?.();
			router.push("/identities");
		} catch (error) {
			console.error("Failed to create identity:", error);
		}
	};

	const handleCancel = () => {
		onCancel?.();
		router.push("/identities");
	};

	if (schemasLoading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" height="400px">
				<Spinner variant="ring" size="large" />
			</Box>
		);
	}

	return (
		<Card
			variant="bordered"
			sx={{
				p: 4,
				maxWidth: 800,
				mx: "auto",
			}}
		>
			<Typography variant="gradient" size="2xl" gutterBottom>
				Create New Identity
			</Typography>

			<Typography variant="subheading" sx={{ mb: 3 }}>
				Create a new user identity in your Kratos instance. Select a schema to see the required fields.
			</Typography>

			{createIdentityMutation.isError && (
				<Alert variant="inline" severity="error" sx={{ mb: 3 }}>
					Failed to create identity: {(createIdentityMutation.error as any)?.message || "Unknown error"}
				</Alert>
			)}

			<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
				<FormControl fullWidth required>
					<InputLabel>Identity Schema</InputLabel>
					<Select
						value={selectedSchemaId}
						label="Identity Schema"
						onChange={(e) => handleSchemaChange(e.target.value as string)}
						disabled={createIdentityMutation.isPending}
					>
						{schemas?.map((schema: IdentitySchemaContainer) => (
							<MenuItem key={schema.id} value={schema.id}>
								<Tooltip title={`Schema ID: ${schema.id}`} placement="right">
									<span style={{ display: "block", width: "100%" }}>{(schema.schema as any)?.title || schema.id}</span>
								</Tooltip>
							</MenuItem>
						))}
					</Select>
				</FormControl>

				{selectedSchemaId && formSchema && (
					<Box
						sx={{
							"& .rjsf": {
								"& .field-string": { mb: 0 },
								"& .field-object": { mb: 0 },
								"& .form-group": { mb: 0 },
								"& .control-label": { display: "none" },
								"& .field-description": { display: "none" },
								"& .help-block": { display: "none" },
							},
						}}
					>
						<Form
							schema={formSchema}
							uiSchema={createUISchema(formSchema)}
							formData={formData}
							onChange={({ formData }) => setFormData(formData)}
							onSubmit={handleSubmit}
							validator={validator}
							customValidate={(_, errors) => {
								// Allow submission even with empty optional fields
								return errors;
							}}
							widgets={widgets}
							templates={templates}
							disabled={createIdentityMutation.isPending}
							showErrorList={false}
							noHtml5Validate
							className="rjsf"
							onError={(errors) => {
								console.error("Form validation errors:", errors);
							}}
						>
							<Box
								sx={{
									display: "flex",
									gap: 2,
									justifyContent: "flex-end",
									mt: 3,
								}}
							>
								<Button variant="outlined" startIcon={<Cancel />} onClick={handleCancel} disabled={createIdentityMutation.isPending} type="button">
									Cancel
								</Button>
								<Button
									type="submit"
									variant="primary"
									startIcon={createIdentityMutation.isPending ? <Spinner variant="inline" size="small" /> : <Save />}
									disabled={createIdentityMutation.isPending || !selectedSchemaId}
								>
									{createIdentityMutation.isPending ? "Creating..." : "Create Identity"}
								</Button>
							</Box>
						</Form>
					</Box>
				)}

				{selectedSchemaId && !formSchema && (
					<Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
						<Button variant="outlined" startIcon={<Cancel />} onClick={handleCancel} disabled={createIdentityMutation.isPending}>
							Cancel
						</Button>
						<Button variant="primary" disabled>
							No form fields available
						</Button>
					</Box>
				)}
			</Box>
		</Card>
	);
};

export default React.memo(CreateIdentityForm);
