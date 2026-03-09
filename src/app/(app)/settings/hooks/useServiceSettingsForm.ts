import { useCallback, useEffect } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";

export interface ServiceEndpointsForm {
	publicUrl: string;
	adminUrl: string;
}

export interface ServiceEndpoints {
	publicUrl: string;
	adminUrl: string;
}

export interface UseServiceSettingsFormOptions {
	endpoints: ServiceEndpoints;
	setEndpoints: (endpoints: ServiceEndpoints) => Promise<void>;
	onSuccess?: () => void;
}

export interface UseServiceSettingsFormReturn {
	form: UseFormReturn<ServiceEndpointsForm>;
	handleSave: (data: ServiceEndpointsForm) => Promise<void>;
}

export function useServiceSettingsForm({ endpoints, setEndpoints, onSuccess }: UseServiceSettingsFormOptions): UseServiceSettingsFormReturn {
	const form = useForm<ServiceEndpointsForm>({
		defaultValues: {
			publicUrl: endpoints.publicUrl,
			adminUrl: endpoints.adminUrl,
		},
	});

	useEffect(() => {
		form.reset({
			publicUrl: endpoints.publicUrl,
			adminUrl: endpoints.adminUrl,
		});
	}, [endpoints, form]);

	const handleSave = useCallback(
		async (data: ServiceEndpointsForm) => {
			try {
				await setEndpoints({
					publicUrl: data.publicUrl.trim(),
					adminUrl: data.adminUrl.trim(),
				});
				onSuccess?.();
			} catch (error) {
				console.error("Failed to save settings:", error);
			}
		},
		[setEndpoints, onSuccess],
	);

	return { form, handleSave };
}
