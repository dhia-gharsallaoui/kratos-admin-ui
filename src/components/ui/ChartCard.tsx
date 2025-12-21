import { Paper, type PaperProps, Typography } from "@mui/material";
import type React from "react";

interface ChartCardProps extends Omit<PaperProps, "title"> {
	title: string;
	height?: number;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, height = 450, children, sx = {}, ...props }) => {
	return (
		<Paper
			elevation={0}
			sx={{
				p: 3,
				height,
				border: "1px solid",
				borderColor: "divider",
				transition: "all 0.2s ease",
				"&:hover": {
					boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
				},
				...sx,
			}}
			{...props}
		>
			<Typography
				variant="h6"
				gutterBottom
				sx={{
					fontWeight: 600,
					color: "text.primary",
					mb: 2,
				}}
			>
				{title}
			</Typography>
			{children}
		</Paper>
	);
};

export default ChartCard;
