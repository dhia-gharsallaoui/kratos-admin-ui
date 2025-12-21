import { useCallback, useState } from "react";

export interface UseCopyToClipboardReturn {
	copy: (text: string, label?: string) => Promise<void>;
	copiedField: string | null;
	isCopied: boolean;
}

/**
 * Custom hook for copying text to clipboard with feedback
 * @param timeout - Duration in milliseconds to show copied state (default: 2000)
 * @returns Object with copy function and copied state
 */
export function useCopyToClipboard(timeout = 2000): UseCopyToClipboardReturn {
	const [copiedField, setCopiedField] = useState<string | null>(null);

	const copy = useCallback(
		async (text: string, label?: string) => {
			try {
				await navigator.clipboard.writeText(text);
				setCopiedField(label || "default");
				setTimeout(() => setCopiedField(null), timeout);
			} catch (error) {
				console.error("Failed to copy to clipboard:", error);
				throw error;
			}
		},
		[timeout],
	);

	return {
		copy,
		copiedField,
		isCopied: copiedField !== null,
	};
}
