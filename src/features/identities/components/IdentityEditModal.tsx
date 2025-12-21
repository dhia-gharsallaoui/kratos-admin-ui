import type { Identity } from "@ory/kratos-client";
import Form from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import React, { useEffect, useState } from "react";
import { ActionBar, Alert, Box, Chip, Dialog, DialogActions, DialogContent, Spinner, Typography } from "@/components/ui";
import { useSchemas } from "@/features/schemas/hooks/useSchemas";
import { uiLogger } from "@/lib/logger";
import { useUpdateIdentity } from "../hooks/useIdentities";
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

// Add custom format for tel to avoid validation warnings
validator.ajv.addFormat("tel", {
	type: "string",
	validate: (data: string) => {
		return typeof data === "string" && data.length > 0;
	},
});

interface IdentityEditModalProps {
	open: boolean;
	onClose: () => void;
	identity: Identity | null;
	onSuccess?: () => void;
}

export const IdentityEditModal: React.FC<IdentityEditModalProps> = ({ open, onClose, identity, onSuccess }) => {
	const updateIdentityMutation = useUpdateIdentity();
	const { data: schemas, isLoading: schemasLoading } = useSchemas();
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

	// Initialize form data when identity changes
	useEffect(() => {
		if (identity && schemas) {
			const schema = schemas.find((s) => s.id === identity.schema_id);
			if (schema?.schema) {
				const rjsfSchema = convertKratosSchemaToRJSF(schema.schema);
				setFormSchema(rjsfSchema);
				setFormData(identity.traits || {});
				uiLogger.debug("Initialized form with identity traits:", identity.traits);
			}
		}
	}, [identity, schemas]);

	const onSubmit = async (data: any) => {
		if (!identity) return;

		const { formData: submitData } = data;

		try {
			uiLogger.debug("Submitting identity update:", {
				originalIdentity: identity,
				formData: submitData,
			});

			await updateIdentityMutation.mutateAsync({
				id: identity.id,
				schemaId: identity.schema_id,
				traits: submitData,
			});

			onSuccess?.();
			onClose();
		} catch (error) {
			uiLogger.logError(error, "Failed to update identity");
		}
	};

	const handleClose = () => {
		if (!updateIdentityMutation.isPending) {
			setFormData({});
			onClose();
		}
	};

	if (!identity) return null;

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="md"
			fullWidth
			title={
				<Box>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<Typography variant="heading" size="lg">
							Edit Identity
						</Typography>
						<Chip label={identity.schema_id} variant="tag" />
					</Box>
					<Typography variant="code" sx={{ mt: 1 }}>
						{identity.id}
					</Typography>
				</Box>
			}
			slotProps={{
				paper: {
					sx: { minHeight: "500px" },
				},
			}}
		>
			<DialogContent>
				{updateIdentityMutation.isError && (
					<Alert variant="inline" severity="error" sx={{ mb: 2 }}>
						Failed to update identity: {(updateIdentityMutation.error as any)?.message || "Unknown error"}
					</Alert>
				)}

				{schemasLoading && (
					<Box display="flex" justifyContent="center" alignItems="center" height="300px">
						<Spinner variant="ring" size="large" />
					</Box>
				)}

				{!schemasLoading && formSchema && (
					<Box
						sx={{
							mt: 2,
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
							onSubmit={onSubmit}
							validator={validator}
							widgets={widgets}
							templates={templates}
							disabled={updateIdentityMutation.isPending}
							showErrorList={false}
							noHtml5Validate
							className="rjsf"
						>
							<DialogActions sx={{ p: 3, pt: 1 }}>
								<ActionBar
									primaryAction={{
										label: "Save Changes",
										onClick: () => {
											// Trigger form submission
											document.querySelector<HTMLFormElement>("form.rjsf")?.requestSubmit();
										},
										loading: updateIdentityMutation.isPending,
										disabled: false,
									}}
									secondaryActions={[
										{
											label: "Cancel",
											onClick: handleClose,
											variant: "outlined",
											disabled: updateIdentityMutation.isPending,
										},
									]}
								/>
							</DialogActions>
						</Form>
					</Box>
				)}

				{!schemasLoading && !formSchema && (
					<Alert variant="inline" severity="warning" sx={{ mt: 2 }}>
						Schema not found for this identity
					</Alert>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default IdentityEditModal;
