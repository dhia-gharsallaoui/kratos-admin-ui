import React from 'react';
import {
  Accordion as MuiAccordion,
  AccordionProps as MuiAccordionProps,
  AccordionSummary as MuiAccordionSummary,
  AccordionSummaryProps as MuiAccordionSummaryProps,
  AccordionDetails as MuiAccordionDetails,
  AccordionDetailsProps as MuiAccordionDetailsProps,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

export interface AccordionProps extends MuiAccordionProps {}
export interface AccordionSummaryProps extends MuiAccordionSummaryProps {}
export interface AccordionDetailsProps extends MuiAccordionDetailsProps {}

const StyledAccordion = styled(MuiAccordion)(({ theme }) => ({
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: 'var(--radius)',
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: 0,
  },
}));

const StyledAccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  '&.Mui-expanded': {
    minHeight: 48,
  },
  '& .MuiAccordionSummary-content': {
    '&.Mui-expanded': {
      margin: '12px 0',
    },
  },
}));

const StyledAccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>((props, ref) => {
  return <StyledAccordion ref={ref} {...props} />;
});

export const AccordionSummary = React.forwardRef<HTMLDivElement, AccordionSummaryProps>((props, ref) => {
  return <StyledAccordionSummary ref={ref} {...props} />;
});

export const AccordionDetails = React.forwardRef<HTMLDivElement, AccordionDetailsProps>((props, ref) => {
  return <StyledAccordionDetails ref={ref} {...props} />;
});

Accordion.displayName = 'Accordion';
AccordionSummary.displayName = 'AccordionSummary';
AccordionDetails.displayName = 'AccordionDetails';
