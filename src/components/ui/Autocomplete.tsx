import { Autocomplete as MuiAutocomplete, type AutocompleteProps as MuiAutocompleteProps } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import React from "react";

export interface AutocompleteProps<
	T,
	Multiple extends boolean | undefined = undefined,
	DisableClearable extends boolean | undefined = undefined,
	FreeSolo extends boolean | undefined = undefined,
> extends MuiAutocompleteProps<T, Multiple, DisableClearable, FreeSolo> {}

const StyledAutocomplete = styled(MuiAutocomplete)(({ theme }) => ({
	"& .MuiOutlinedInput-root": {
		borderRadius: "var(--radius)",
		transition: "all 0.2s ease",
		"& fieldset": {
			borderColor: alpha(theme.palette.divider, 0.2),
		},
		"&:hover fieldset": {
			borderColor: alpha(theme.palette.primary.main, 0.5),
		},
		"&.Mui-focused fieldset": {
			borderColor: theme.palette.primary.main,
			borderWidth: 2,
		},
	},
	"& .MuiAutocomplete-listbox": {
		"& .MuiAutocomplete-option": {
			transition: "all 0.2s ease",
			"&:hover": {
				backgroundColor: alpha(theme.palette.primary.main, 0.08),
			},
			'&[aria-selected="true"]': {
				backgroundColor: alpha(theme.palette.primary.main, 0.12),
				"&:hover": {
					backgroundColor: alpha(theme.palette.primary.main, 0.16),
				},
			},
		},
	},
})) as typeof MuiAutocomplete;

export const Autocomplete = React.forwardRef(
	<
		T,
		Multiple extends boolean | undefined = undefined,
		DisableClearable extends boolean | undefined = undefined,
		FreeSolo extends boolean | undefined = undefined,
	>(
		props: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
		ref: React.ForwardedRef<HTMLDivElement>,
	) => {
		return <StyledAutocomplete ref={ref} {...props} />;
	},
) as (<
	T,
	Multiple extends boolean | undefined = undefined,
	DisableClearable extends boolean | undefined = undefined,
	FreeSolo extends boolean | undefined = undefined,
>(
	props: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo> & {
		ref?: React.ForwardedRef<HTMLDivElement>;
	},
) => ReturnType<typeof StyledAutocomplete>) & { displayName?: string };

Autocomplete.displayName = "Autocomplete";
