import { LoadingState } from '@/components/ui';

interface SessionsLoadingSkeletonProps {
  rows?: number;
}

export const SessionsLoadingSkeleton = ({ rows = 5 }: SessionsLoadingSkeletonProps) => {
  return <LoadingState variant="section" message="Loading sessions..." />;
};
