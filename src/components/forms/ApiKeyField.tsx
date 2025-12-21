"use client";

import { Edit as EditIcon, VpnKey as KeyIcon, Lock as LockIcon, Visibility, VisibilityOff } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { type Control, Controller, type FieldPath, type FieldValues } from "react-hook-form";
import { Box, IconButton, InputAdornment, TextField } from "@/components/ui";
import { themeColors } from "@/theme";

export interface ApiKeyFieldProps<TFieldValues extends FieldValues = FieldValues> {
	/** Field name for react-hook-form */
	name: FieldPath<TFieldValues>;
	/** Form control from react-hook-form */
	control: Control<TFieldValues>;
	/** Field label */
	label: string;
	/** Placeholder text for the input */
	placeholder?: string;
	/** Helper text shown below the field */
	helperText?: string;
	/** Whether an API key already exists (shows masked view) */
	hasExistingKey: boolean;
	/** Whether currently in edit mode */
	isEditing: boolean;
	/** Callback when user clicks to start editing */
	onEditStart: () => void;
	/** Error message from form validation */
	error?: string;
	/** Whether the field should take full width */
	fullWidth?: boolean;
}

export function ApiKeyField<TFieldValues extends FieldValues = FieldValues>({
	name,
	control,
	label,
	placeholder = "ory_pat_xxx",
	helperText,
	hasExistingKey,
	isEditing,
	onEditStart,
	error,
	fullWidth = true,
}: ApiKeyFieldProps<TFieldValues>) {
	const [showPassword, setShowPassword] = useState(false);

	// Reset visibility when leaving edit mode
	useEffect(() => {
		if (!isEditing) {
			setShowPassword(false);
		}
	}, [isEditing]);

	// Masked display mode - show when key exists and not editing
	if (hasExistingKey && !isEditing) {
		return (
			<Box>
				<TextField
					value="••••••••••••••••"
					label={label}
					disabled
					fullWidth={fullWidth}
					size="small"
					helperText="API key is set and encrypted"
					slotProps={{
						input: {
							startAdornment: (
								<Box sx={{ mr: 1, display: "flex", color: themeColors.success }}>
									<LockIcon sx={{ fontSize: 18 }} />
								</Box>
							),
							endAdornment: (
								<InputAdornment position="end">
									<IconButton size="small" onClick={onEditStart} aria-label="edit api key">
										<EditIcon sx={{ fontSize: 18 }} />
									</IconButton>
								</InputAdornment>
							),
						},
					}}
				/>
			</Box>
		);
	}

	// Edit mode - show editable password field
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<TextField
					{...field}
					label={label}
					placeholder={placeholder}
					fullWidth={fullWidth}
					size="small"
					type={showPassword ? "text" : "password"}
					helperText={error || helperText || "Enter your API key - it will be encrypted"}
					error={!!error}
					slotProps={{
						input: {
							startAdornment: (
								<Box sx={{ mr: 1, display: "flex", color: "text.secondary" }}>
									<KeyIcon sx={{ fontSize: 18 }} />
								</Box>
							),
							endAdornment: (
								<InputAdornment position="end">
									<IconButton aria-label="toggle api key visibility" onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
										{showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
									</IconButton>
								</InputAdornment>
							),
						},
					}}
				/>
			)}
		/>
	);
}

ApiKeyField.displayName = "ApiKeyField";
