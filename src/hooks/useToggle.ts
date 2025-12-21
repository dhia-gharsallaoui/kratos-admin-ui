import { useCallback, useState } from "react";

export interface UseToggleReturn {
	value: boolean;
	toggle: () => void;
	setTrue: () => void;
	setFalse: () => void;
	setValue: (value: boolean) => void;
}

/**
 * Custom hook for managing boolean toggle state
 * @param initialValue - Initial boolean value (default: false)
 * @returns Object with toggle state and control functions
 */
export function useToggle(initialValue = false): UseToggleReturn {
	const [value, setValue] = useState(initialValue);

	const toggle = useCallback(() => setValue((prev) => !prev), []);
	const setTrue = useCallback(() => setValue(true), []);
	const setFalse = useCallback(() => setValue(false), []);

	return {
		value,
		toggle,
		setTrue,
		setFalse,
		setValue,
	};
}
