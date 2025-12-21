import { useCallback, useEffect, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";

export interface ServiceEndpointsForm {
	publicUrl: string;
	adminUrl: string;
	apiKey?: string;
}

export interface ServiceEndpoints {
	publicUrl: string;
	adminUrl: string;
	apiKey?: string;
}

export interface UseServiceSettingsFormOptions {
	/** Current endpoints from the store */
	endpoints: ServiceEndpoints;
	/** Function to save endpoints to the store */
	setEndpoints: (endpoints: ServiceEndpoints) => Promise<void>;
	/** Callback on successful save */
	onSuccess?: () => void;
}

export interface UseServiceSettingsFormReturn {
	/** React Hook Form instance */
	form: UseFormReturn<ServiceEndpointsForm>;
	/** Whether the API key is currently being edited */
	isEditingApiKey: boolean;
	/** Start editing the API key */
	startEditingApiKey: () => void;
	/** Handle form submission */
	handleSave: (data: ServiceEndpointsForm) => Promise<void>;
}

/**
 * Custom hook for managing service settings form state.
 * Encapsulates form setup, API key editing state, and save logic.
 */
export function useServiceSettingsForm({ endpoints, setEndpoints, onSuccess }: UseServiceSettingsFormOptions): UseServiceSettingsFormReturn {
	const [isEditingApiKey, setIsEditingApiKey] = useState(false);

	const form = useForm<ServiceEndpointsForm>({
		defaultValues: {
			publicUrl: endpoints.publicUrl,
			adminUrl: endpoints.adminUrl,
			apiKey: endpoints.apiKey,
		},
	});

	// Reset form when endpoints change externally
	useEffect(() => {
		form.reset({
			publicUrl: endpoints.publicUrl,
			adminUrl: endpoints.adminUrl,
			apiKey: endpoints.apiKey,
		});
	}, [endpoints, form]);

	const startEditingApiKey = useCallback(() => {
		setIsEditingApiKey(true);
		form.setValue("apiKey", "");
	}, [form]);

	const handleSave = useCallback(
		async (data: ServiceEndpointsForm) => {
			try {
				await setEndpoints({
					publicUrl: data.publicUrl.trim(),
					adminUrl: data.adminUrl.trim(),
					apiKey: data.apiKey?.trim() || "",
				});
				setIsEditingApiKey(false);
				onSuccess?.();
			} catch (error) {
				console.error("Failed to save settings:", error);
			}
		},
		[setEndpoints, onSuccess],
	);

	return {
		form,
		isEditingApiKey,
		startEditingApiKey,
		handleSave,
	};
}
