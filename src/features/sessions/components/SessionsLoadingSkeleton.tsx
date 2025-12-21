import { LoadingState } from "@/components/ui";

interface SessionsLoadingSkeletonProps {
	rows?: number;
}

export const SessionsLoadingSkeleton = ({ rows: _rows = 5 }: SessionsLoadingSkeletonProps) => {
	return <LoadingState variant="section" message="Loading sessions..." />;
};
