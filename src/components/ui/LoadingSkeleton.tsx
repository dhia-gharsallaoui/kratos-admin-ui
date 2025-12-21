import { Box, Card, CardContent, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import type React from "react";

interface LoadingSkeletonProps {
	variant?: "table" | "card" | "list" | "page";
	rows?: number;
	columns?: number;
	height?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant = "table", rows = 5, columns = 4, height = 400 }) => {
	const renderTableSkeleton = () => (
		<Paper sx={{ width: "100%", overflow: "hidden" }}>
			<TableContainer sx={{ maxHeight: height }}>
				<Table stickyHeader>
					<TableHead>
						<TableRow>
							{Array.from({ length: columns }).map((_, index) => (
								<TableCell key={index}>
									<Skeleton width="60%" height={20} />
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{Array.from({ length: rows }).map((_, rowIndex) => (
							<TableRow key={rowIndex}>
								{Array.from({ length: columns }).map((_, colIndex) => (
									<TableCell key={colIndex}>
										<Skeleton width="80%" height={20} />
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Paper>
	);

	const renderCardSkeleton = () => (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
			{Array.from({ length: rows }).map((_, index) => (
				<Card key={index}>
					<CardContent>
						<Skeleton width="60%" height={24} sx={{ mb: 1 }} />
						<Skeleton width="100%" height={20} sx={{ mb: 0.5 }} />
						<Skeleton width="80%" height={20} sx={{ mb: 1 }} />
						<Box sx={{ display: "flex", gap: 1 }}>
							<Skeleton width={60} height={32} />
							<Skeleton width={80} height={32} />
						</Box>
					</CardContent>
				</Card>
			))}
		</Box>
	);

	const renderListSkeleton = () => (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
			{Array.from({ length: rows }).map((_, index) => (
				<Box
					key={index}
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 2,
						p: 2,
						border: 1,
						borderColor: "divider",
						borderRadius: 1,
					}}
				>
					<Skeleton variant="circular" width={40} height={40} />
					<Box sx={{ flex: 1 }}>
						<Skeleton width="60%" height={20} sx={{ mb: 0.5 }} />
						<Skeleton width="40%" height={16} />
					</Box>
					<Skeleton width={80} height={32} />
				</Box>
			))}
		</Box>
	);

	const renderPageSkeleton = () => (
		<Box sx={{ p: 3 }}>
			{/* Header */}
			<Box sx={{ mb: 4 }}>
				<Skeleton width="30%" height={40} sx={{ mb: 1 }} />
				<Skeleton width="50%" height={20} />
			</Box>

			{/* Content */}
			<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
				{/* Controls */}
				<Box sx={{ display: "flex", gap: 2, mb: 2 }}>
					<Skeleton width={200} height={40} />
					<Skeleton width={120} height={40} />
					<Skeleton width={100} height={40} />
				</Box>

				{/* Main content */}
				{renderTableSkeleton()}
			</Box>
		</Box>
	);

	switch (variant) {
		case "card":
			return renderCardSkeleton();
		case "list":
			return renderListSkeleton();
		case "page":
			return renderPageSkeleton();
		default:
			return renderTableSkeleton();
	}
};

export default LoadingSkeleton;
