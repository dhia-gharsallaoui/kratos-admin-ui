import type { SvgIconComponent } from "@mui/icons-material";
import { Box, Card, CardContent, Typography } from "@mui/material";
import type React from "react";

interface MetricCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon: SvgIconComponent;
	color: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon: Icon, color }) => {
	return (
		<Card
			elevation={0}
			sx={{
				border: "1px solid",
				borderColor: "divider",
				transition: "all 0.2s ease",
				borderLeft: `4px solid ${color}`,
				"&:hover": {
					boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
				},
			}}
		>
			<CardContent>
				<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
					<Box
						sx={{
							background: `${color}1a`,
							borderRadius: 2,
							p: 1,
							display: "flex",
							mr: 2,
						}}
					>
						<Icon sx={{ fontSize: 28, color }} />
					</Box>
					<Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
						{title}
					</Typography>
				</Box>
				<Typography variant="h4" sx={{ mb: 0.5, fontWeight: 600 }}>
					{value}
				</Typography>
				{subtitle && (
					<Typography variant="caption" color="text.secondary">
						{subtitle}
					</Typography>
				)}
			</CardContent>
		</Card>
	);
};

export default MetricCard;
