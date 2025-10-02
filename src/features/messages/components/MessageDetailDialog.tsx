import React from 'react';
import { Close, Mail, Sms, Person, Schedule, Info, ExpandMore, CheckCircle, Cancel, Error } from '@mui/icons-material';
import { Box } from '@/components/ui/Box';
import { Grid } from '@/components/ui/Grid';
import { Accordion, AccordionSummary, AccordionDetails } from '@/components/ui/Accordion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog';
import { Typography } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { Card } from '@/components/ui/Card';
import { CardContent } from '@/components/ui/CardContent';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { IconButton } from '@/components/ui/IconButton';
import { useMessage } from '../hooks';
import { CourierMessageStatus } from '@/services/kratos/endpoints/courier';
import { formatDate } from '@/lib/date-utils';

interface MessageDetailDialogProps {
  open: boolean;
  onClose: () => void;
  messageId: string;
}

export const MessageDetailDialog: React.FC<MessageDetailDialogProps> = ({ open, onClose, messageId }) => {
  const { data: messageData, isLoading, error: fetchError } = useMessage(messageId, { enabled: open && !!messageId });

  const message = messageData?.data;

  const getStatusIcon = (status: CourierMessageStatus) => {
    switch (status) {
      case 'sent':
        return <CheckCircle color="success" />;
      case 'queued':
        return <Schedule color="info" />;
      case 'processing':
        return <Spinner variant="inline" size="small" />;
      case 'abandoned':
        return <Cancel color="error" />;
      default:
        return <Error color="warning" />;
    }
  };

  const getStatusColor = (status: CourierMessageStatus) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'queued':
        return 'info';
      case 'processing':
        return 'warning';
      case 'abandoned':
        return 'error';
      default:
        return 'default';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail color="primary" />;
      case 'sms':
        return <Sms color="primary" />;
      default:
        return <Mail color="primary" />;
    }
  };


  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Spinner variant="page" />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (fetchError || !message) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="heading" size="lg">Message Details</Typography>
            <IconButton onClick={onClose} variant="action" size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert variant="inline" severity="error">Failed to load message details: {fetchError?.message || 'Unknown error'}</Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            {getMessageTypeIcon(message.type)}
            <Typography variant="heading" size="lg">Message Details</Typography>
          </Box>
          <IconButton onClick={onClose} variant="action" size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Basic Message Info */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Info color="primary" />
                  <Typography variant="heading" size="lg">Basic Information</Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="label" color="text.secondary">
                      Message ID
                    </Typography>
                    <Typography variant="code" sx={{ wordBreak: 'break-all' }}>
                      {message.id}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="label" color="text.secondary">
                      Type
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getMessageTypeIcon(message.type)}
                      <Typography variant="body" sx={{ textTransform: 'capitalize' }}>
                        {message.type}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="label" color="text.secondary">
                      Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(message.status)}
                      <Chip label={message.status} color={getStatusColor(message.status) as any} size="small" sx={{ textTransform: 'capitalize' }} />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="label" color="text.secondary">
                      Send Count
                    </Typography>
                    <Typography variant="body">{message.send_count || 0}</Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="label" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body">{formatDate(message.created_at)}</Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="label" color="text.secondary">
                      Updated At
                    </Typography>
                    <Typography variant="body">{formatDate(message.updated_at)}</Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="label" color="text.secondary">
                      Template Type
                    </Typography>
                    <Typography variant="code">
                      {message.template_type || 'Unknown'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="label" color="text.secondary">
                      Channel
                    </Typography>
                    <Typography variant="body">{message.channel || 'Default'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Recipient Information */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Person color="primary" />
                  <Typography variant="heading" size="lg">Recipient Information</Typography>
                </Box>

                <Typography variant="label" color="text.secondary">
                  Recipient
                </Typography>
                <Typography variant="body" sx={{ wordBreak: 'break-all', mb: 2 }}>
                  {message.recipient}
                </Typography>

                <Typography variant="label" color="text.secondary">
                  Subject
                </Typography>
                <Typography variant="body">{message.subject || 'No subject'}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Message Content */}
          {message.body && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="heading" size="lg" gutterBottom>
                    Message Content
                  </Typography>
                  <Box
                    component="div"
                    sx={{
                      backgroundColor: 'grey.50',
                      p: 2,
                      borderRadius: 1,
                      maxHeight: '300px',
                      overflow: 'auto',
                      fontSize: '0.875rem',
                      whiteSpace: 'pre-wrap',
                      border: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    {message.body}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Dispatches */}
          {message.dispatches && message.dispatches.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="heading" size="lg" gutterBottom>
                    Delivery Attempts
                  </Typography>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="label">{message.dispatches.length} dispatch(es)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {message.dispatches.map((dispatch: any, index: number) => (
                        <Box key={dispatch.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="label" color="text.secondary">
                                Dispatch ID
                              </Typography>
                              <Typography variant="code" fontSize="0.75rem">
                                {dispatch.id}
                              </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="label" color="text.secondary">
                                Status
                              </Typography>
                              <Chip
                                label={dispatch.status}
                                variant="status"
                                status={dispatch.status === 'failed' ? 'inactive' : 'active'}
                              />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="label" color="text.secondary">
                                Created At
                              </Typography>
                              <Typography variant="body">{formatDate(dispatch.created_at)}</Typography>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="label" color="text.secondary">
                                Updated At
                              </Typography>
                              <Typography variant="body">{formatDate(dispatch.updated_at)}</Typography>
                            </Grid>

                            {dispatch.error && (
                              <Grid size={{ xs: 12 }}>
                                <Typography variant="label" color="text.secondary">
                                  Error
                                </Typography>
                                <Alert variant="inline" severity="error" sx={{ mt: 1 }}>
                                  <Typography variant="code">{JSON.stringify(dispatch.error, null, 2)}</Typography>
                                </Alert>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
