import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  TextField,
  Autocomplete,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import Form from '@rjsf/core';
import { RJSFSchema, UiSchema, WidgetProps, FieldTemplateProps, ObjectFieldTemplateProps, SubmitButtonProps } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';

// Add custom format for tel to avoid validation warnings
validator.ajv.addFormat('tel', {
  type: 'string',
  validate: (data: string) => {
    // Basic phone number validation - allow any string that could be a phone number
    return typeof data === 'string' && data.length > 0;
  },
});
import parsePhoneNumber, { isValidPhoneNumber, getCountries, getCountryCallingCode, CountryCode } from 'libphonenumber-js';
import { useCreateIdentity } from '../hooks/useIdentities';
import { useSchemas } from '@/features/schemas/hooks/useSchemas';
import { useRouter } from 'next/navigation';
import { IdentitySchemaContainer } from '@ory/kratos-client';

interface CreateIdentityFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Get country options for autocomplete
const getCountryOptions = () => {
  return getCountries()
    .map((countryCode) => {
      const callingCode = getCountryCallingCode(countryCode);
      return {
        code: countryCode,
        name: new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) || countryCode,
        callingCode: `+${callingCode}`,
        label: `${new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode)} (+${callingCode})`,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Custom tel widget component with libphonenumber-js integration
const TelWidget: React.FC<WidgetProps> = ({ id, value, onChange, onBlur, onFocus, placeholder, disabled, readonly, required, label }) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('US');
  const [phoneInput, setPhoneInput] = useState('');
  const [error, setError] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const countryOptions = getCountryOptions();

  // Initialize state from value
  React.useEffect(() => {
    if (value) {
      try {
        const parsed = parsePhoneNumber(value);
        if (parsed) {
          setSelectedCountry(parsed.country || 'US');
          setPhoneInput(parsed.nationalNumber || '');
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
    setError('');

    if (!newPhoneInput.trim()) {
      onChange('');
      return;
    }

    try {
      // Try to parse with selected country
      const phoneNumber = parsePhoneNumber(newPhoneInput, selectedCountry);

      if (phoneNumber && phoneNumber.isValid()) {
        // Format as international number
        const formatted = phoneNumber.formatInternational();
        onChange(formatted);
        setError('');
        setIsValid(true);
      } else {
        // Also check with isValidPhoneNumber for additional validation
        const valid = isValidPhoneNumber(newPhoneInput, selectedCountry);
        onChange(newPhoneInput);

        if (newPhoneInput.length > 3 && !valid) {
          setError('Invalid phone number format');
          setIsValid(false);
        } else if (newPhoneInput.length <= 3) {
          setIsValid(null);
        }
      }
    } catch (err) {
      // Final validation check for any parsing errors
      const valid = isValidPhoneNumber(newPhoneInput, selectedCountry);
      onChange(newPhoneInput);

      if (newPhoneInput.length > 3 && !valid) {
        setError('Invalid phone number format');
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
        if (phoneNumber && phoneNumber.isValid()) {
          const formatted = phoneNumber.formatInternational();
          onChange(formatted);
          setError('');
        } else {
          // Validate with the new country
          const isValid = isValidPhoneNumber(phoneInput, newCountry);
          if (!isValid && phoneInput.length > 3) {
            setError('Invalid phone number format for selected country');
          } else {
            setError('');
          }
        }
      } catch {
        // Validate even if parsing fails
        const isValid = isValidPhoneNumber(phoneInput, newCountry);
        if (!isValid && phoneInput.length > 3) {
          setError('Invalid phone number format for selected country');
        } else {
          setError('');
        }
      }
    }
  };

  const currentCountry = countryOptions.find((c) => c.code === selectedCountry);

  const getBorderColor = () => {
    if (isValid === true) return '#4caf50'; // Green for valid
    if (isValid === false) return '#f44336'; // Red for invalid
    return 'rgba(0, 0, 0, 0.23)'; // Default gray
  };

  const getHoverBorderColor = () => {
    if (isValid === true) return '#66bb6a'; // Lighter green on hover
    if (isValid === false) return '#ef5350'; // Lighter red on hover
    return 'rgba(0, 0, 0, 0.87)'; // Default dark gray
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
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
          <TextField
            {...params}
            label="Country"
            variant="outlined"
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                  borderWidth: '1px',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.87)',
                  borderWidth: '1px',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: '2px',
                },
              },
            }}
          />
        )}
        disabled={disabled || readonly}
        size="small"
      />

      <TextField
        id={id}
        type="tel"
        label={required ? `${label || 'Phone Number'} *` : label || 'Phone Number'}
        value={phoneInput}
        onChange={(e) => handlePhoneChange(e.target.value)}
        onBlur={onBlur && (() => onBlur(id, value))}
        onFocus={onFocus && (() => onFocus(id, value))}
        placeholder={placeholder || `Enter phone number (${currentCountry?.callingCode})`}
        disabled={disabled}
        slotProps={{ input: { readOnly: readonly } }}
        error={!!error}
        helperText={error || (currentCountry ? `Format: ${currentCountry.callingCode} XXX XXX XXXX` : '')}
        fullWidth
        variant="outlined"
        size="small"
        sx={{
          '& .MuiInputLabel-root': {
            '& .MuiInputLabel-asterisk': {
              color: '#f44336',
            },
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: getBorderColor(),
              borderWidth: '1px',
              transition: 'border-color 0.2s ease-in-out',
            },
            '&:hover fieldset': {
              borderColor: getHoverBorderColor(),
              borderWidth: '1px',
            },
            '&.Mui-focused fieldset': {
              borderColor: isValid === false ? '#f44336' : 'primary.main',
              borderWidth: '2px',
            },
            '&.Mui-error fieldset': {
              borderColor: '#f44336',
            },
          },
        }}
      />
    </Box>
  );
};

// Custom TextWidget with Material-UI styling
const TextWidget: React.FC<WidgetProps> = ({ id, value, onChange, onBlur, onFocus, placeholder, disabled, readonly, required, schema, label }) => {
  const isEmail = schema.format === 'email';
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
    [required, isEmail]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    validateField(newValue);
    onChange(newValue);
  };

  const handleBlurEvent = () => {
    validateField(value || '');
    if (onBlur) onBlur(id, value);
  };

  React.useEffect(() => {
    if (value) {
      validateField(value);
    }
  }, [value, required, validateField]);

  const getBorderColor = () => {
    if (isValid === true) return '#4caf50'; // Green for valid
    if (isValid === false) return '#f44336'; // Red for invalid
    return 'rgba(0, 0, 0, 0.23)'; // Default gray
  };

  const getHoverBorderColor = () => {
    if (isValid === true) return '#66bb6a'; // Lighter green on hover
    if (isValid === false) return '#ef5350'; // Lighter red on hover
    return 'rgba(0, 0, 0, 0.87)'; // Default dark gray
  };

  return (
    <TextField
      id={id}
      label={required ? `${label} *` : label}
      type={isEmail ? 'email' : 'text'}
      value={value || ''}
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
        '& .MuiInputLabel-root': {
          '& .MuiInputLabel-asterisk': {
            color: '#f44336',
          },
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: getBorderColor(),
            borderWidth: '1px',
            transition: 'border-color 0.2s ease-in-out',
          },
          '&:hover fieldset': {
            borderColor: getHoverBorderColor(),
            borderWidth: '1px',
          },
          '&.Mui-focused fieldset': {
            borderColor: isValid === false ? '#f44336' : 'primary.main',
            borderWidth: '2px',
          },
        },
      }}
    />
  );
};

// Custom Field Template
const FieldTemplate: React.FC<FieldTemplateProps> = ({ children, description, errors, help, hidden }) => {
  if (hidden) {
    return <div style={{ display: 'none' }}>{children}</div>;
  }

  return (
    <Box sx={{ mb: 2 }}>
      {children}
      {description && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {description}
        </Typography>
      )}
      {errors && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {errors}
        </Typography>
      )}
      {help && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {help}
        </Typography>
      )}
    </Box>
  );
};

// Custom Object Field Template for nested objects
const ObjectFieldTemplate: React.FC<ObjectFieldTemplateProps> = ({ title, description, properties }) => {
  return (
    <Box sx={{ mb: 3 }}>
      {title && (
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
          {title}
        </Typography>
      )}
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
        {properties.map((prop) => (
          <div key={prop.name}>{prop.content}</div>
        ))}
      </Box>
    </Box>
  );
};

// Custom Submit Button Template (hidden since we use our own buttons)
const SubmitButton: React.FC<SubmitButtonProps> = () => {
  return null; // We handle submit with our own buttons
};

const CreateIdentityForm: React.FC<CreateIdentityFormProps> = ({ onSuccess, onCancel }) => {
  const router = useRouter();
  const createIdentityMutation = useCreateIdentity();
  const { data: schemas, isLoading: schemasLoading } = useSchemas();

  const [selectedSchemaId, setSelectedSchemaId] = useState<string>('');
  const [formData, setFormData] = useState<any>({});
  const [formSchema, setFormSchema] = useState<RJSFSchema | null>(null);

  // Custom widgets for better form experience
  const widgets = {
    tel: TelWidget,
    TextWidget: TextWidget,
    text: TextWidget,
    email: TextWidget,
  };

  // Custom templates for Material-UI styling
  const templates = {
    FieldTemplate: FieldTemplate,
    ObjectFieldTemplate: ObjectFieldTemplate,
    SubmitButton: SubmitButton,
  };

  // Convert Kratos schema to RJSF schema
  const convertKratosSchemaToRJSF = (kratosSchema: any): RJSFSchema => {
    const schemaObj = kratosSchema as any;

    if (schemaObj?.properties?.traits) {
      return {
        title: 'Identity Traits',
        type: 'object',
        properties: schemaObj.properties.traits.properties,
        required: schemaObj.properties.traits.required || [],
      };
    }

    return {
      title: 'Identity Traits',
      type: 'object',
      properties: {},
    };
  };

  // Create UI Schema for better form layout
  const createUISchema = (schema: RJSFSchema): UiSchema => {
    const uiSchema: UiSchema = {};

    // Customize specific field types
    Object.keys(schema.properties || {}).forEach((key) => {
      const property = (schema.properties as any)[key];

      if (property.format === 'email') {
        uiSchema[key] = {
          'ui:widget': 'email',
        };
      } else if (property.format === 'tel') {
        // Use custom tel widget
        uiSchema[key] = {
          'ui:widget': 'tel',
        };
      }

      // Handle nested objects (like name.first, name.last)
      if (property.type === 'object' && property.properties) {
        uiSchema[key] = {
          'ui:field': 'object',
        };
      }
    });

    return uiSchema;
  };

  const handleSchemaChange = (schemaId: string) => {
    setSelectedSchemaId(schemaId);
    setFormData({});

    if (schemaId && schemas) {
      const selectedSchema = schemas.find((s: IdentitySchemaContainer) => s.id === schemaId);
      if (selectedSchema?.schema) {
        const rjsfSchema = convertKratosSchemaToRJSF(selectedSchema.schema);
        setFormSchema(rjsfSchema);
      }
    } else {
      setFormSchema(null);
    }
  };

  const handleSubmit = async (data: any) => {
    const { formData: submitData } = data;

    try {
      await createIdentityMutation.mutateAsync({
        schemaId: selectedSchemaId,
        traits: submitData,
      });

      onSuccess?.();
      router.push('/identities');
    } catch (error) {
      console.error('Failed to create identity:', error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    router.push('/identities');
  };

  if (schemasLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Create New Identity
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create a new user identity in your Kratos instance. Select a schema to see the required fields.
      </Typography>

      {createIdentityMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to create identity: {(createIdentityMutation.error as any)?.message || 'Unknown error'}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FormControl fullWidth required>
          <InputLabel>Identity Schema</InputLabel>
          <Select
            value={selectedSchemaId}
            label="Identity Schema"
            onChange={(e) => handleSchemaChange(e.target.value)}
            disabled={createIdentityMutation.isPending}
          >
            {schemas?.map((schema: IdentitySchemaContainer) => (
              <MenuItem key={schema.id} value={schema.id}>
                {(schema.schema as any)?.title || schema.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedSchemaId && formSchema && (
          <Box
            sx={{
              '& .rjsf': {
                '& .field-string': { mb: 0 },
                '& .field-object': { mb: 0 },
                '& .form-group': { mb: 0 },
                '& .control-label': { display: 'none' },
                '& .field-description': { display: 'none' },
                '& .help-block': { display: 'none' },
              },
            }}
          >
            <Form
              schema={formSchema}
              uiSchema={createUISchema(formSchema)}
              formData={formData}
              onChange={({ formData }) => setFormData(formData)}
              onSubmit={handleSubmit}
              validator={validator}
              customValidate={(_, errors) => {
                // Allow submission even with empty optional fields
                return errors;
              }}
              widgets={widgets}
              templates={templates}
              disabled={createIdentityMutation.isPending}
              showErrorList={false}
              noHtml5Validate
              className="rjsf"
              onError={(errors) => {
                console.error('Form validation errors:', errors);
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button variant="outlined" startIcon={<Cancel />} onClick={handleCancel} disabled={createIdentityMutation.isPending} type="button">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={createIdentityMutation.isPending ? <CircularProgress size={20} /> : <Save />}
                  disabled={createIdentityMutation.isPending || !selectedSchemaId}
                >
                  {createIdentityMutation.isPending ? 'Creating...' : 'Create Identity'}
                </Button>
              </Box>
            </Form>
          </Box>
        )}

        {selectedSchemaId && !formSchema && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="outlined" startIcon={<Cancel />} onClick={handleCancel} disabled={createIdentityMutation.isPending}>
              Cancel
            </Button>
            <Button variant="contained" disabled>
              No form fields available
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default CreateIdentityForm;
