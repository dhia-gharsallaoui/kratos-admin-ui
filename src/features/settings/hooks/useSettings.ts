"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";

export interface ClientSettings {
	kratosPublicUrl: string;
	kratosAdminUrl: string;
	hydraPublicUrl: string;
	hydraAdminUrl: string;
	isOryNetwork: boolean;
	hydraEnabled: boolean;
	kratosApiKeyConfigured: boolean;
	hydraApiKeyConfigured: boolean;
}

export interface KratosEndpoints {
	publicUrl: string;
	adminUrl: string;
}

export interface HydraEndpoints {
	publicUrl: string;
	adminUrl: string;
}

export interface SettingsStoreState {
	kratosEndpoints: KratosEndpoints;
	hydraEndpoints: HydraEndpoints;
	isOryNetwork: boolean;
	hydraEnabled: boolean;
	kratosApiKeyConfigured: boolean;
	hydraApiKeyConfigured: boolean;
	isReady: boolean;
	setKratosEndpoints: (endpoints: KratosEndpoints) => Promise<void>;
	setHydraEndpoints: (endpoints: HydraEndpoints) => Promise<void>;
	setIsOryNetwork: (value: boolean) => Promise<void>;
	setHydraEnabled: (value: boolean) => Promise<void>;
	resetToDefaults: () => Promise<void>;
	isValidUrl: (url: string) => boolean;
	initialize: () => Promise<void>;
}

const INITIAL_KRATOS_ENDPOINTS: KratosEndpoints = { publicUrl: "", adminUrl: "" };
const INITIAL_HYDRA_ENDPOINTS: HydraEndpoints = { publicUrl: "", adminUrl: "" };

async function fetchSettings(): Promise<ClientSettings> {
	const response = await fetch("/api/settings");
	if (!response.ok) {
		throw new Error("Failed to fetch settings");
	}
	return response.json();
}

async function saveSettings(updates: Record<string, any>): Promise<ClientSettings> {
	const response = await fetch("/api/settings", {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(updates),
	});
	if (!response.ok) {
		throw new Error("Failed to save settings");
	}
	return response.json();
}

function applySettings(set: any, settings: ClientSettings) {
	set({
		kratosEndpoints: { publicUrl: settings.kratosPublicUrl, adminUrl: settings.kratosAdminUrl },
		hydraEndpoints: { publicUrl: settings.hydraPublicUrl, adminUrl: settings.hydraAdminUrl },
		isOryNetwork: settings.isOryNetwork,
		hydraEnabled: settings.hydraEnabled,
		kratosApiKeyConfigured: settings.kratosApiKeyConfigured,
		hydraApiKeyConfigured: settings.hydraApiKeyConfigured,
		isReady: true,
	});
}

export const useSettingsStore = create<SettingsStoreState>()((set, get) => ({
	kratosEndpoints: INITIAL_KRATOS_ENDPOINTS,
	hydraEndpoints: INITIAL_HYDRA_ENDPOINTS,
	isOryNetwork: false,
	hydraEnabled: true,
	kratosApiKeyConfigured: false,
	hydraApiKeyConfigured: false,
	isReady: false,

	initialize: async () => {
		if (get().isReady) return;
		try {
			const settings = await fetchSettings();
			applySettings(set, settings);
		} catch (error) {
			console.warn("Failed to fetch settings, using defaults:", error);
			set({ isReady: true });
		}
	},

	setKratosEndpoints: async (endpoints: KratosEndpoints) => {
		const settings = await saveSettings({
			kratosPublicUrl: endpoints.publicUrl,
			kratosAdminUrl: endpoints.adminUrl,
		});
		applySettings(set, settings);
	},

	setHydraEndpoints: async (endpoints: HydraEndpoints) => {
		const settings = await saveSettings({
			hydraPublicUrl: endpoints.publicUrl,
			hydraAdminUrl: endpoints.adminUrl,
		});
		applySettings(set, settings);
	},

	setIsOryNetwork: async (value: boolean) => {
		const settings = await saveSettings({ isOryNetwork: value });
		applySettings(set, settings);
	},

	setHydraEnabled: async (value: boolean) => {
		const settings = await saveSettings({ hydraEnabled: value });
		applySettings(set, settings);
	},

	resetToDefaults: async () => {
		const response = await fetch("/api/settings/reset", { method: "POST" });
		if (!response.ok) {
			throw new Error("Failed to reset settings");
		}
		const settings = await response.json();
		applySettings(set, settings);
	},

	isValidUrl: (url: string) => {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	},
}));

// Hook to initialize settings and wait until ready
export const useSettingsReady = () => {
	const [isReady, setIsReady] = useState(false);
	const storeReady = useSettingsStore((state) => state.isReady);
	const initialize = useSettingsStore((state) => state.initialize);

	useEffect(() => {
		if (!storeReady) {
			initialize();
		} else {
			setIsReady(true);
		}
	}, [storeReady, initialize]);

	return isReady;
};

// Convenience hooks
export const useKratosEndpoints = () => useSettingsStore((state) => state.kratosEndpoints);
export const useHydraEndpoints = () => useSettingsStore((state) => state.hydraEndpoints);
export const useIsOryNetwork = () => useSettingsStore((state) => state.isOryNetwork);
export const useHydraEnabled = () => useSettingsStore((state) => state.hydraEnabled);
export const useSetKratosEndpoints = () => useSettingsStore((state) => state.setKratosEndpoints);
export const useSetHydraEndpoints = () => useSettingsStore((state) => state.setHydraEndpoints);
export const useSetIsOryNetwork = () => useSettingsStore((state) => state.setIsOryNetwork);
export const useSetHydraEnabled = () => useSettingsStore((state) => state.setHydraEnabled);
export const useResetSettings = () => useSettingsStore((state) => state.resetToDefaults);
export const useIsValidUrl = () => useSettingsStore((state) => state.isValidUrl);
export const useKratosApiKeyConfigured = () => useSettingsStore((state) => state.kratosApiKeyConfigured);
export const useHydraApiKeyConfigured = () => useSettingsStore((state) => state.hydraApiKeyConfigured);

// Backwards compatibility
export const useSettingsLoaded = () => useSettingsStore((state) => state.isReady);
