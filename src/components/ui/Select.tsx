import React from 'react';
import {
  FormControl as MuiFormControl,
  FormControlProps as MuiFormControlProps,
  InputLabel as MuiInputLabel,
  InputLabelProps as MuiInputLabelProps,
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  MenuItem as MuiMenuItem,
  MenuItemProps as MuiMenuItemProps,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

export interface FormControlProps extends MuiFormControlProps {}
export interface InputLabelProps extends MuiInputLabelProps {}
export type SelectProps = MuiSelectProps;
export interface MenuItemProps extends MuiMenuItemProps {}

const StyledFormControl = styled(MuiFormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 'var(--radius)',
    transition: 'all 0.2s ease',
    '& fieldset': {
      borderColor: alpha(theme.palette.divider, 0.2),
    },
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.5),
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
}));

const StyledInputLabel = styled(MuiInputLabel)(({ theme }) => ({
  '&.Mui-focused': {
    color: theme.palette.primary.main,
  },
}));

const StyledSelect = styled(MuiSelect)(({ theme }) => ({}));

const StyledMenuItem = styled(MuiMenuItem)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.16),
    },
  },
}));

export const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  (props, ref) => {
    return <StyledFormControl ref={ref} {...props} />;
  }
);

export const InputLabel = React.forwardRef<HTMLLabelElement, InputLabelProps>(
  (props, ref) => {
    return <StyledInputLabel ref={ref} {...props} />;
  }
);

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (props, ref) => {
    return <StyledSelect ref={ref} {...props} />;
  }
);

export const MenuItem = React.forwardRef<HTMLLIElement, MenuItemProps>(
  (props, ref) => {
    return <StyledMenuItem ref={ref} {...props} />;
  }
);

FormControl.displayName = 'FormControl';
InputLabel.displayName = 'InputLabel';
Select.displayName = 'Select';
MenuItem.displayName = 'MenuItem';
