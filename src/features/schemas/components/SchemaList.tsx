'use client';

import React from 'react';
import { Schema as SchemaIcon } from '@mui/icons-material';
import { Box, Card, Chip, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Skeleton, Typography } from '@/components/ui';
import { IdentitySchemaContainer } from '@ory/kratos-client';
import { formatSchemaForDisplay } from '../utils';

interface SchemaListProps {
  schemas: IdentitySchemaContainer[];
  loading: boolean;
  selectedSchemaId?: string;
  onSchemaSelect: (schema: IdentitySchemaContainer) => void;
}

const SchemaList: React.FC<SchemaListProps> = ({ schemas, loading, selectedSchemaId, onSchemaSelect }) => {
  if (loading) {
    return (
      <Card>
        <List>
          {Array.from({ length: 3 }).map((_, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Skeleton variant="circular" width={24} height={24} />
              </ListItemIcon>
              <ListItemText primary={<Skeleton width="60%" />} secondary={<Skeleton width="80%" />} />
            </ListItem>
          ))}
        </List>
      </Card>
    );
  }

  if (schemas.length === 0) {
    return (
      <Card>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body" color="text.secondary">
            No schemas found
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card>
      <List>
        {schemas.map((schema) => {
          const formattedSchema = formatSchemaForDisplay(schema);
          const isSelected = selectedSchemaId === schema.id;

          return (
            <ListItem key={schema.id} disablePadding>
              <ListItemButton onClick={() => onSchemaSelect(schema)} selected={isSelected}>
                <ListItemIcon>
                  <SchemaIcon />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="label">{formattedSchema.displayName}</Typography>
                      {formattedSchema.isDefault && <Chip label="Default" variant="tag" />}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body" color="text.secondary">
                        {formattedSchema.description}
                      </Typography>
                      <Typography variant="label" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {formattedSchema.fieldCount} fields • ID: {schema.id}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Card>
  );
};

export default SchemaList;
