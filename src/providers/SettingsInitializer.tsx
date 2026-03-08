"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/features/settings/hooks/useSettings";

export function SettingsInitializer() {
	const initialize = useSettingsStore((state) => state.initialize);
	const isReady = useSettingsStore((state) => state.isReady);

	useEffect(() => {
		if (!isReady) {
			initialize();
		}
	}, [initialize, isReady]);

	return null;
}
