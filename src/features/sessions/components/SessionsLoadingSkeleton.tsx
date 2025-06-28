import { Skeleton, TableCell, TableRow } from '@mui/material';

interface SessionsLoadingSkeletonProps {
  rows?: number;
}

export const SessionsLoadingSkeleton = ({ rows = 5 }: SessionsLoadingSkeletonProps) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell>
            <Skeleton variant="text" width="60%" height={20} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="40%" height={20} />
          </TableCell>
          <TableCell>
            <Skeleton variant="rounded" width={60} height={24} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="50%" height={20} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="45%" height={20} />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};
