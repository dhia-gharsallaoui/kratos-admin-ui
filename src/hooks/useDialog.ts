import { useCallback, useState } from "react";

export interface UseDialogReturn {
	isOpen: boolean;
	open: () => void;
	close: () => void;
	toggle: () => void;
}

/**
 * Custom hook for managing dialog/modal open/close state
 * @param initialOpen - Initial open state (default: false)
 * @returns Object with dialog state and control functions
 */
export function useDialog(initialOpen = false): UseDialogReturn {
	const [isOpen, setIsOpen] = useState(initialOpen);

	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);
	const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

	return {
		isOpen,
		open,
		close,
		toggle,
	};
}
