import { MenuItem as MuiMenuItem, TextField as MuiTextField, useTheme } from "@mui/material";
import type { FieldTemplateProps, ObjectFieldTemplateProps, SubmitButtonProps, WidgetProps } from "@rjsf/utils";
import parsePhoneNumber, { type CountryCode, getCountries, getCountryCallingCode, isValidPhoneNumber } from "libphonenumber-js";
import React, { useState } from "react";
import { Autocomplete, Box, FormControl, InputLabel, Select as MuiSelect, Typography } from "@/components/ui";

// Memoize country options for autocomplete to avoid recalculation
export const getCountryOptions = () => {
	return getCountries()
		.map((countryCode) => {
			const callingCode = getCountryCallingCode(countryCode);
			return {
				code: countryCode,
				name: new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) || countryCode,
				callingCode: `+${callingCode}`,
				label: `${new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode)} (+${callingCode})`,
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name));
};

// Custom tel widget component with libphonenumber-js integration
export const TelWidget: React.FC<WidgetProps> = ({ id, value, onChange, onBlur, onFocus, placeholder, disabled, readonly, required, label }) => {
	const theme = useTheme();
	const [selectedCountry, setSelectedCountry] = useState<CountryCode>("US");
	const [phoneInput, setPhoneInput] = useState("");
	const [error, setError] = useState<string>("");
	const [isValid, setIsValid] = useState<boolean | null>(null);

	const countryOptions = getCountryOptions();

	// Initialize state from value
	React.useEffect(() => {
		if (value) {
			try {
				const parsed = parsePhoneNumber(value);
				if (parsed) {
					setSelectedCountry(parsed.country || "US");
					setPhoneInput(parsed.nationalNumber || "");
				} else {
					setPhoneInput(value);
				}
			} catch {
				setPhoneInput(value);
			}
		}
	}, [value]);

	const handlePhoneChange = (newPhoneInput: string) => {
		setPhoneInput(newPhoneInput);
		setError("");

		if (!newPhoneInput.trim()) {
			onChange("");
			return;
		}

		try {
			// Try to parse with selected country
			const phoneNumber = parsePhoneNumber(newPhoneInput, selectedCountry);

			if (phoneNumber?.isValid()) {
				// Format as international number
				const formatted = phoneNumber.formatInternational();
				onChange(formatted);
				setError("");
				setIsValid(true);
			} else {
				// Also check with isValidPhoneNumber for additional validation
				const valid = isValidPhoneNumber(newPhoneInput, selectedCountry);
				onChange(newPhoneInput);

				if (newPhoneInput.length > 3 && !valid) {
					setError("Invalid phone number format");
					setIsValid(false);
				} else if (newPhoneInput.length <= 3) {
					setIsValid(null);
				}
			}
		} catch (_err) {
			// Final validation check for any parsing errors
			const valid = isValidPhoneNumber(newPhoneInput, selectedCountry);
			onChange(newPhoneInput);

			if (newPhoneInput.length > 3 && !valid) {
				setError("Invalid phone number format");
				setIsValid(false);
			} else if (newPhoneInput.length <= 3) {
				setIsValid(null);
			}
		}
	};

	const handleCountryChange = (newCountry: CountryCode) => {
		setSelectedCountry(newCountry);

		if (phoneInput) {
			try {
				const phoneNumber = parsePhoneNumber(phoneInput, newCountry);
				if (phoneNumber?.isValid()) {
					const formatted = phoneNumber.formatInternational();
					onChange(formatted);
					setError("");
				} else {
					// Validate with the new country
					const isValid = isValidPhoneNumber(phoneInput, newCountry);
					if (!isValid && phoneInput.length > 3) {
						setError("Invalid phone number format for selected country");
					} else {
						setError("");
					}
				}
			} catch {
				// Validate even if parsing fails
				const isValid = isValidPhoneNumber(phoneInput, newCountry);
				if (!isValid && phoneInput.length > 3) {
					setError("Invalid phone number format for selected country");
				} else {
					setError("");
				}
			}
		}
	};

	const currentCountry = countryOptions.find((c) => c.code === selectedCountry);

	const getBorderColor = () => {
		if (isValid === true) return "#4caf50"; // Green for valid
		if (isValid === false) return "#f44336"; // Red for invalid
		return theme.palette.divider; // Theme-aware default
	};

	const getHoverBorderColor = () => {
		if (isValid === true) return "#66bb6a"; // Lighter green on hover
		if (isValid === false) return "#ef5350"; // Lighter red on hover
		return theme.palette.text.primary; // Theme-aware hover
	};

	return (
		<Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
			<Autocomplete
				value={currentCountry || null}
				onChange={(_, newValue) => {
					if (newValue) {
						handleCountryChange(newValue.code);
					}
				}}
				options={countryOptions}
				getOptionLabel={(option) => option.label}
				renderInput={(params) => (
					<MuiTextField
						{...params}
						label="Country"
						variant="outlined"
						sx={{
							minWidth: 200,
							"& .MuiOutlinedInput-root": {
								"& fieldset": {
									borderColor: theme.palette.divider,
									borderWidth: "1px",
								},
								"&:hover fieldset": {
									borderColor: theme.palette.text.primary,
									borderWidth: "1px",
								},
								"&.Mui-focused fieldset": {
									borderColor: "primary.main",
									borderWidth: "2px",
								},
							},
						}}
					/>
				)}
				disabled={disabled || readonly}
				size="small"
			/>

			<MuiTextField
				id={id}
				type="tel"
				label={required ? `${label || "Phone Number"} *` : label || "Phone Number"}
				value={phoneInput}
				onChange={(e) => handlePhoneChange(e.target.value)}
				onBlur={onBlur && (() => onBlur(id, value))}
				onFocus={onFocus && (() => onFocus(id, value))}
				placeholder={placeholder || `Enter phone number (${currentCountry?.callingCode})`}
				disabled={disabled}
				slotProps={{ input: { readOnly: readonly } }}
				error={!!error}
				helperText={error || (currentCountry ? `Format: ${currentCountry.callingCode} XXX XXX XXXX` : "")}
				fullWidth
				variant="outlined"
				size="small"
				sx={{
					"& .MuiInputLabel-root": {
						"& .MuiInputLabel-asterisk": {
							color: "error.main",
						},
					},
					"& .MuiOutlinedInput-root": {
						"& fieldset": {
							borderColor: getBorderColor(),
							borderWidth: "1px",
							transition: "border-color 0.2s ease-in-out",
						},
						"&:hover fieldset": {
							borderColor: getHoverBorderColor(),
							borderWidth: "1px",
						},
						"&.Mui-focused fieldset": {
							borderColor: isValid === false ? "error.main" : "primary.main",
							borderWidth: "2px",
						},
						"&.Mui-error fieldset": {
							borderColor: "error.main",
						},
					},
				}}
			/>
		</Box>
	);
};

// Custom TextWidget with Material-UI styling
export const TextWidget: React.FC<WidgetProps> = ({
	id,
	value,
	onChange,
	onBlur,
	onFocus,
	placeholder,
	disabled,
	readonly,
	required,
	schema,
	label,
}) => {
	const theme = useTheme();
	const isEmail = schema.format === "email";
	const [isValid, setIsValid] = React.useState<boolean | null>(null);

	const validateField = React.useCallback(
		(fieldValue: string) => {
			if (!fieldValue) {
				if (required) {
					setIsValid(false);
					return false;
				} else {
					setIsValid(null);
					return true;
				}
			}

			// Email validation
			if (isEmail) {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				const valid = emailRegex.test(fieldValue);
				setIsValid(valid);
				return valid;
			}

			// Basic validation for non-empty required fields
			if (fieldValue.trim().length > 0) {
				setIsValid(true);
				return true;
			}

			setIsValid(false);
			return false;
		},
		[required, isEmail],
	);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		validateField(newValue);
		onChange(newValue);
	};

	const handleBlurEvent = () => {
		validateField(value || "");
		if (onBlur) onBlur(id, value);
	};

	React.useEffect(() => {
		if (value) {
			validateField(value);
		}
	}, [value, validateField]);

	const getBorderColor = () => {
		if (isValid === true) return "#4caf50"; // Green for valid
		if (isValid === false) return "#f44336"; // Red for invalid
		return theme.palette.divider; // Theme-aware default
	};

	const getHoverBorderColor = () => {
		if (isValid === true) return "#66bb6a"; // Lighter green on hover
		if (isValid === false) return "#ef5350"; // Lighter red on hover
		return theme.palette.text.primary; // Theme-aware hover
	};

	return (
		<MuiTextField
			id={id}
			label={required ? `${label} *` : label}
			type={isEmail ? "email" : "text"}
			value={value || ""}
			onChange={handleChange}
			onBlur={handleBlurEvent}
			onFocus={onFocus && (() => onFocus(id, value))}
			placeholder={placeholder}
			disabled={disabled}
			slotProps={{ input: { readOnly: readonly } }}
			fullWidth
			variant="outlined"
			size="small"
			sx={{
				mb: 2,
				"& .MuiInputLabel-root": {
					"& .MuiInputLabel-asterisk": {
						color: "error.main",
					},
				},
				"& .MuiOutlinedInput-root": {
					"& fieldset": {
						borderColor: getBorderColor(),
						borderWidth: "1px",
						transition: "border-color 0.2s ease-in-out",
					},
					"&:hover fieldset": {
						borderColor: getHoverBorderColor(),
						borderWidth: "1px",
					},
					"&.Mui-focused fieldset": {
						borderColor: isValid === false ? "#f44336" : "primary.main",
						borderWidth: "2px",
					},
				},
			}}
		/>
	);
};

// Custom SelectWidget with Material-UI styling for enum fields
export const SelectWidget: React.FC<WidgetProps> = ({
	id,
	value,
	onChange,
	onBlur,
	onFocus,
	disabled,
	readonly,
	required,
	options,
	label,
	placeholder,
}) => {
	const theme = useTheme();
	const { enumOptions = [] } = options;
	const [isValid, setIsValid] = React.useState<boolean | null>(null);

	React.useEffect(() => {
		if (value) {
			setIsValid(true);
		} else if (required) {
			setIsValid(false);
		} else {
			setIsValid(null);
		}
	}, [value, required]);

	const handleChange = (event: any) => {
		const newValue = event.target.value;
		onChange(newValue === "" ? undefined : newValue);
		if (newValue) {
			setIsValid(true);
		} else if (required) {
			setIsValid(false);
		} else {
			setIsValid(null);
		}
	};

	const getBorderColor = () => {
		if (isValid === true) return "#4caf50"; // Green for valid
		if (isValid === false) return "#f44336"; // Red for invalid
		return theme.palette.divider; // Theme-aware default
	};

	const getHoverBorderColor = () => {
		if (isValid === true) return "#66bb6a"; // Lighter green on hover
		if (isValid === false) return "#ef5350"; // Lighter red on hover
		return theme.palette.text.primary; // Theme-aware hover
	};

	return (
		<FormControl
			fullWidth
			required={required}
			disabled={disabled}
			sx={{
				mb: 2,
				"& .MuiInputLabel-root": {
					"& .MuiInputLabel-asterisk": {
						color: "error.main",
					},
				},
				"& .MuiOutlinedInput-root": {
					"& fieldset": {
						borderColor: getBorderColor(),
						borderWidth: "1px",
						transition: "border-color 0.2s ease-in-out",
					},
					"&:hover fieldset": {
						borderColor: getHoverBorderColor(),
						borderWidth: "1px",
					},
					"&.Mui-focused fieldset": {
						borderColor: isValid === false ? "#f44336" : "primary.main",
						borderWidth: "2px",
					},
				},
			}}
		>
			<InputLabel id={`${id}-label`}>{required ? `${label} *` : label}</InputLabel>
			<MuiSelect
				id={id}
				labelId={`${id}-label`}
				label={required ? `${label} *` : label}
				value={value || ""}
				onChange={handleChange}
				onBlur={onBlur && (() => onBlur(id, value))}
				onFocus={onFocus && (() => onFocus(id, value))}
				disabled={disabled}
				readOnly={readonly}
				size="small"
				displayEmpty={!!placeholder}
			>
				{placeholder && (
					<MuiMenuItem value="">
						<em>{placeholder}</em>
					</MuiMenuItem>
				)}
				{enumOptions.map((option: any) => (
					<MuiMenuItem key={option.value} value={option.value}>
						{option.label}
					</MuiMenuItem>
				))}
			</MuiSelect>
		</FormControl>
	);
};

// Custom Field Template
export const FieldTemplate: React.FC<FieldTemplateProps> = ({ children, description, errors, help, hidden }) => {
	if (hidden) {
		return <div style={{ display: "none" }}>{children}</div>;
	}

	return (
		<Box sx={{ mb: 2 }}>
			{children}
			{description && (
				<Box component="span" sx={{ mt: 0.5, display: "block", opacity: 0.7, fontSize: "0.875rem" }}>
					{description}
				</Box>
			)}
			{errors && (
				<Box component="span" sx={{ mt: 0.5, display: "block", color: "error.main", fontSize: "0.875rem" }}>
					{errors}
				</Box>
			)}
			{help && (
				<Box component="span" sx={{ mt: 0.5, display: "block", opacity: 0.7, fontSize: "0.875rem" }}>
					{help}
				</Box>
			)}
		</Box>
	);
};

// Custom Object Field Template for nested objects
export const ObjectFieldTemplate: React.FC<ObjectFieldTemplateProps> = ({ title, description, properties }) => {
	return (
		<Box sx={{ mb: 3 }}>
			{title && (
				<Typography variant="heading" size="lg" sx={{ mb: 2 }}>
					{title}
				</Typography>
			)}
			{description && (
				<Typography variant="subheading" sx={{ mb: 2 }}>
					{description}
				</Typography>
			)}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
					gap: 2,
				}}
			>
				{properties.map((prop) => (
					<div key={prop.name}>{prop.content}</div>
				))}
			</Box>
		</Box>
	);
};

// Custom Submit Button Template (hidden since we use our own buttons)
export const SubmitButton: React.FC<SubmitButtonProps> = () => {
	return null; // We handle submit with our own buttons
};

// Helper to convert Kratos schema to RJSF schema
export const convertKratosSchemaToRJSF = (kratosSchema: any) => {
	const schemaObj = kratosSchema as any;

	if (schemaObj?.properties?.traits) {
		return {
			title: "Identity Traits",
			type: "object",
			properties: schemaObj.properties.traits.properties,
			required: schemaObj.properties.traits.required || [],
		};
	}

	return {
		title: "Identity Traits",
		type: "object",
		properties: {},
	};
};

// Create UI Schema for better form layout
export const createUISchema = (schema: any) => {
	const uiSchema: any = {};

	// Customize specific field types
	Object.keys(schema.properties || {}).forEach((key) => {
		const property = (schema.properties as any)[key];

		if (property.format === "email") {
			uiSchema[key] = {
				"ui:widget": "email",
			};
		} else if (property.format === "tel") {
			uiSchema[key] = {
				"ui:widget": "tel",
			};
		}

		// Handle nested objects (like name.first, name.last)
		if (property.type === "object" && property.properties) {
			uiSchema[key] = {
				"ui:field": "object",
			};
		}
	});

	return uiSchema;
};
