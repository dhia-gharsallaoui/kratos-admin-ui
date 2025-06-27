'use client';

import React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Chip, Tooltip } from '@mui/material';
import { Session } from '@ory/kratos-client';
import { formatSessionForDisplay, getSessionStatusColor, getSessionStatusLabel } from '../utils';

interface SessionsTableProps {
  sessions: Session[];
  loading: boolean;
}

const SessionsTable: React.FC<SessionsTableProps> = ({ sessions, loading }) => {
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.value}>
          <span>{params.value?.substring(0, 8)}...</span>
        </Tooltip>
      ),
    },
    {
      field: 'identityEmail',
      headerName: 'Identity',
      width: 200,
      valueGetter: (value, row) => {
        const formatted = formatSessionForDisplay(row);
        return formatted.identityEmail;
      },
    },
    {
      field: 'active',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={getSessionStatusLabel(params.value)} color={getSessionStatusColor(params.value)} size="small" />
      ),
    },
    {
      field: 'issued_at',
      headerName: 'Created',
      width: 180,
      valueGetter: (value) => {
        return value ? new Date(value).toLocaleString() : 'N/A';
      },
    },
    {
      field: 'expires_at',
      headerName: 'Expires',
      width: 180,
      valueGetter: (value) => {
        return value ? new Date(value).toLocaleString() : 'N/A';
      },
    },
    {
      field: 'durationMinutes',
      headerName: 'Duration',
      width: 120,
      valueGetter: (value, row) => {
        const formatted = formatSessionForDisplay(row);
        return `${formatted.durationMinutes} min`;
      },
    },
  ];

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={sessions}
        columns={columns}
        loading={loading}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
      />
    </Box>
  );
};

export default SessionsTable;
