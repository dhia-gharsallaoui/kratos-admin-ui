'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { CardContent } from '@/components/ui/CardContent';
import { Typography } from '@/components/ui/Typography';
import { Box } from '@/components/ui/Box';
import { Chip } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Skeleton';
import { IdentitySchemaContainer } from '@ory/kratos-client';
import { formatSchemaForDisplay, extractSchemaFields } from '../utils';

interface SchemaViewerProps {
  schema: IdentitySchemaContainer;
  loading?: boolean;
}

const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema, loading = false }) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="80%" height={24} sx={{ mt: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  const formattedSchema = formatSchemaForDisplay(schema);
  const schemaObj = typeof schema.schema === 'string' ? JSON.parse(schema.schema) : schema.schema;
  const fields = extractSchemaFields(schemaObj);

  return (
    <Card>
      <CardContent>
        <Typography variant="heading" size="lg" gutterBottom>
          {formattedSchema.displayName}
        </Typography>

        <Typography variant="body" color="text.secondary" component="p" sx={{ mb: 2 }}>
          {formattedSchema.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="label" gutterBottom>
            Schema ID: {schema.id}
          </Typography>
          {formattedSchema.isDefault && <Chip label="Default Schema" variant="gradient" />}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="label" gutterBottom>
            Fields ({formattedSchema.fieldCount}):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {fields.map((field) => (
              <Chip key={field} label={field} variant="tag" />
            ))}
          </Box>
        </Box>

        <Typography variant="label" gutterBottom>
          Schema Definition:
        </Typography>
        <Box
          component="pre"
          sx={{
            backgroundColor: 'grey.100',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            maxHeight: 400,
          }}
        >
          {JSON.stringify(schemaObj, null, 2)}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SchemaViewer;
