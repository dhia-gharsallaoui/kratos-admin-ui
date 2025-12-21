import { Cancel, Save } from "@mui/icons-material";
import {
	Box,
	Card,
	CardContent,
	Divider,
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	type SelectProps,
	TextField,
	type TextFieldProps,
	Typography,
} from "@mui/material";
import type React from "react";
import { Button } from "./Button";

interface FormSectionProps {
	title?: string;
	description?: string;
	children: React.ReactNode;
	divider?: boolean;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, description, children, divider = true }) => {
	return (
		<Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
			<CardContent>
				{title && (
					<>
						<Typography variant="h6" fontWeight={600} gutterBottom>
							{title}
						</Typography>
						{description && (
							<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
								{description}
							</Typography>
						)}
						{divider && <Divider sx={{ mb: 3 }} />}
					</>
				)}
				{children}
			</CardContent>
		</Card>
	);
};

interface FormFieldProps extends Omit<TextFieldProps, "variant"> {
	name: string;
}

export const FormField: React.FC<FormFieldProps> = ({ name, sx, ...props }) => {
	return (
		<TextField
			{...props}
			name={name}
			fullWidth
			variant="outlined"
			sx={{
				"& .MuiOutlinedInput-root": {
					borderRadius: "var(--radius)",
				},
				...sx,
			}}
		/>
	);
};

interface FormSelectProps {
	name: string;
	label: string;
	value: any;
	onChange: SelectProps["onChange"];
	options: Array<{ value: any; label: string }>;
	error?: boolean;
	helperText?: string;
	required?: boolean;
	disabled?: boolean;
	fullWidth?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
	name,
	label,
	value,
	onChange,
	options,
	error,
	helperText,
	required,
	disabled,
	fullWidth = true,
}) => {
	return (
		<FormControl fullWidth={fullWidth} error={error} required={required} disabled={disabled}>
			<InputLabel>{label}</InputLabel>
			<Select
				name={name}
				value={value}
				label={label}
				onChange={onChange}
				sx={{
					borderRadius: "var(--radius)",
				}}
			>
				{options.map((option) => (
					<MenuItem key={option.value} value={option.value}>
						{option.label}
					</MenuItem>
				))}
			</Select>
			{helperText && <FormHelperText>{helperText}</FormHelperText>}
		</FormControl>
	);
};

interface FormActionsProps {
	onCancel?: () => void;
	onSubmit?: () => void;
	submitText?: string;
	cancelText?: string;
	isLoading?: boolean;
	disabled?: boolean;
	submitIcon?: React.ReactNode;
}

export const FormActions: React.FC<FormActionsProps> = ({
	onCancel,
	onSubmit,
	submitText = "Save",
	cancelText = "Cancel",
	isLoading = false,
	disabled = false,
	submitIcon = <Save />,
}) => {
	return (
		<Paper
			elevation={0}
			sx={{
				p: 3,
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				border: 1,
				borderColor: "divider",
				borderRadius: 2,
				position: "sticky",
				bottom: 0,
				backgroundColor: "background.paper",
				zIndex: 10,
			}}
		>
			{onCancel && (
				<Button variant="outlined" startIcon={<Cancel />} onClick={onCancel} disabled={isLoading}>
					{cancelText}
				</Button>
			)}
			{!onCancel && <Box />}
			{onSubmit && (
				<Button type="submit" variant="primary" startIcon={submitIcon} onClick={onSubmit} disabled={disabled || isLoading} sx={{ minWidth: 120 }}>
					{isLoading ? "Saving..." : submitText}
				</Button>
			)}
		</Paper>
	);
};

interface FormContainerProps {
	children: React.ReactNode;
	onSubmit?: (e: React.FormEvent) => void;
}

export const FormContainer: React.FC<FormContainerProps> = ({ children, onSubmit }) => {
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit?.(e);
	};

	return (
		<Box
			component="form"
			onSubmit={handleSubmit}
			sx={{
				width: "100%",
				display: "flex",
				flexDirection: "column",
				gap: 3,
			}}
		>
			{children}
		</Box>
	);
};
