import { CardContent as MuiCardContent, type CardContentProps as MuiCardContentProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

export interface CardContentProps extends MuiCardContentProps {}

const StyledCardContent = styled(MuiCardContent)(({ theme }) => ({
	padding: theme.spacing(2),
	"&:last-child": {
		paddingBottom: theme.spacing(2),
	},
}));

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>((props, ref) => {
	return <StyledCardContent ref={ref} {...props} />;
});

CardContent.displayName = "CardContent";
