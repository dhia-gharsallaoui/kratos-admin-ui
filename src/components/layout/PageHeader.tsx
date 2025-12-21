"use client";

import React from "react";
import { Box, type BoxProps, Typography } from "@/components/ui";
import { gradients } from "@/theme";

export interface PageHeaderProps extends Omit<BoxProps, "title" | "ref"> {
	title: string | React.ReactNode;
	subtitle?: string | React.ReactNode;
	actions?: React.ReactNode;
	breadcrumbs?: Array<{ label: string; href?: string }>;
	icon?: React.ReactNode;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(({ title, subtitle, actions, breadcrumbs, icon, sx, ...rest }, ref) => {
	return (
		<Box
			ref={ref}
			{...rest}
			sx={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: { xs: "flex-start", sm: "center" },
				flexDirection: { xs: "column", sm: "row" },
				gap: 2,
				mb: 4,
				...sx,
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
				{icon && (
					<Box
						sx={{
							background: gradients.normal,
							borderRadius: 2,
							p: 1.5,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						{icon}
					</Box>
				)}
				<Box sx={{ flex: 1 }}>
					{breadcrumbs && breadcrumbs.length > 0 && (
						<Box sx={{ mb: 1, display: "flex", gap: 1, alignItems: "center" }}>
							{breadcrumbs.map((crumb, index) => (
								<React.Fragment key={index}>
									<Typography
										variant="label"
										color="secondary"
										sx={{
											cursor: crumb.href ? "pointer" : "default",
											"&:hover": crumb.href ? { textDecoration: "underline" } : {},
										}}
									>
										{crumb.label}
									</Typography>
									{index < breadcrumbs.length - 1 && (
										<Typography variant="label" color="secondary">
											/
										</Typography>
									)}
								</React.Fragment>
							))}
						</Box>
					)}
					{typeof title === "string" ? (
						<Typography variant="gradient" size="3xl">
							{title}
						</Typography>
					) : (
						title
					)}
					{subtitle && (
						<Box sx={{ mt: 0.5 }}>{typeof subtitle === "string" ? <Typography variant="subheading">{subtitle}</Typography> : subtitle}</Box>
					)}
				</Box>
			</Box>
			{actions && (
				<Box
					sx={{
						display: "flex",
						gap: 1,
						flexShrink: 0,
						width: { xs: "100%", sm: "auto" },
						justifyContent: { xs: "flex-end", sm: "flex-start" },
					}}
				>
					{actions}
				</Box>
			)}
		</Box>
	);
});

PageHeader.displayName = "PageHeader";
