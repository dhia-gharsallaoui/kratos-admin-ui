// Utility functions for analytics calculations

/**
 * Format a number with appropriate suffix (K, M, B)
 * @param num The number to format
 * @returns Formatted string
 */
export function formatNumber(num: number): string {
	if (num >= 1000000000) {
		return `${(num / 1000000000).toFixed(1)}B`;
	}
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(1)}M`;
	}
	if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}K`;
	}
	return num.toString();
}

/**
 * Calculate percentage change between two values
 * @param current Current value
 * @param previous Previous value
 * @returns Percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
	if (previous === 0) return current > 0 ? 100 : 0;
	return ((current - previous) / previous) * 100;
}

/**
 * Get color for metric based on trend
 * @param change Percentage change
 * @returns Color string
 */
export function getTrendColor(change: number): "success" | "error" | "info" {
	if (change > 0) return "success";
	if (change < 0) return "error";
	return "info";
}

/**
 * Format duration in minutes to human readable string
 * @param minutes Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
	if (minutes < 60) {
		return `${Math.round(minutes)}m`;
	}
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = Math.round(minutes % 60);
	return `${hours}h ${remainingMinutes}m`;
}

/**
 * Generate chart colors for data visualization
 * @param count Number of colors needed
 * @returns Array of color strings
 */
export function generateChartColors(count: number): string[] {
	const baseColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff7f", "#ff69b4", "#87ceeb", "#dda0dd", "#98fb98", "#f0e68c"];

	if (count <= baseColors.length) {
		return baseColors.slice(0, count);
	}

	// Generate additional colors if needed
	const colors = [...baseColors];
	while (colors.length < count) {
		const hue = (colors.length * 137.5) % 360;
		colors.push(`hsl(${hue}, 70%, 60%)`);
	}

	return colors;
}
