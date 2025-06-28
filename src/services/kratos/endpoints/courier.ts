import { getCourierApi } from '../client';

export type CourierMessageStatus = 'queued' | 'sent' | 'processing' | 'abandoned';

export interface ListMessagesParams {
  pageSize?: number;
  pageToken?: string;
  status?: CourierMessageStatus;
  recipient?: string;
}

// List all courier messages with optional filtering
export async function listMessages(params?: ListMessagesParams) {
  const { pageSize = 250, pageToken, status, recipient } = params || {};

  const courierApi = getCourierApi();
  return await courierApi.listCourierMessages({
    pageSize,
    pageToken,
    status,
    recipient,
  });
}

// Get a specific message by ID
export async function getMessage(id: string) {
  const courierApi = getCourierApi();
  return await courierApi.getCourierMessage({ id });
}

// Get messages with pagination for UI display
export async function getMessagesPage(options?: {
  pageToken?: string;
  pageSize?: number;
  status?: CourierMessageStatus;
  recipient?: string;
  signal?: AbortSignal;
}) {
  const { pageToken, pageSize = 25, status, recipient, signal } = options || {};

  const requestParams: any = {
    pageSize,
    status,
    recipient,
  };

  if (pageToken) {
    requestParams.pageToken = pageToken;
  }

  const courierApi = getCourierApi();
  const response = await courierApi.listCourierMessages(requestParams, { signal });

  // Extract next page token from Link header
  const linkHeader = response.headers?.link;
  let nextPageToken = null;

  if (linkHeader) {
    const nextMatch = linkHeader.match(/page_token=([^&>]+)[^>]*>;\s*rel="next"/);
    if (nextMatch) {
      nextPageToken = nextMatch[1];
    }
  }

  return {
    messages: response.data,
    nextPageToken,
    hasMore: !!nextPageToken,
  };
}
