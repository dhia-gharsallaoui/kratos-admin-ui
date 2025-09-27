import { getAdminOAuth2Api } from '../client';
import {
  OAuth2ConsentRequest,
  OAuth2LoginRequest,
  OAuth2LogoutRequest,
  AcceptOAuth2ConsentRequest,
  AcceptOAuth2LoginRequest,
  RejectOAuth2Request,
  OAuth2RedirectTo,
  OAuth2ConsentSession,
} from '@ory/hydra-client';
import { PaginationParams } from '../types';
import { apiLogger } from '@/lib/logger';

// Use PaginationParams from ../types instead

// OAuth2 Authentication Flow operations

export interface ListConsentSessionsParams extends PaginationParams {
  subject?: string;
  login_session_id?: string;
}

// Consent Request operations
export async function getOAuth2ConsentRequest(challenge: string) {
  try {
    const response = await getAdminOAuth2Api().getOAuth2ConsentRequest({ consentChallenge: challenge });
    return { data: response.data };
  } catch (error) {
    apiLogger.logError(error, `Error getting OAuth2 consent request ${challenge}`);
    throw error;
  }
}

export async function acceptOAuth2ConsentRequest(
  challenge: string,
  body: AcceptOAuth2ConsentRequest
) {
  try {
    const response = await getAdminOAuth2Api().acceptOAuth2ConsentRequest({
      consentChallenge: challenge,
      acceptOAuth2ConsentRequest: body
    });
    return { data: response.data };
  } catch (error) {
    apiLogger.logError(error, `Error accepting OAuth2 consent request ${challenge}`);
    throw error;
  }
}

export async function rejectOAuth2ConsentRequest(
  challenge: string,
  body: RejectOAuth2Request
) {
  try {
    const response = await getAdminOAuth2Api().rejectOAuth2ConsentRequest({
      consentChallenge: challenge,
      rejectOAuth2Request: body
    });
    return { data: response.data };
  } catch (error) {
    apiLogger.logError(error, `Error rejecting OAuth2 consent request ${challenge}`);
    throw error;
  }
}

// Login Request operations
export async function getOAuth2LoginRequest(challenge: string) {
  try {
    const response = await getAdminOAuth2Api().getOAuth2LoginRequest({ loginChallenge: challenge });
    return { data: response.data };
  } catch (error) {
    apiLogger.logError(error, `Error getting OAuth2 login request ${challenge}`);
    throw error;
  }
}

export async function acceptOAuth2LoginRequest(
  challenge: string,
  body: AcceptOAuth2LoginRequest
) {
  try {
    const response = await getAdminOAuth2Api().acceptOAuth2LoginRequest({
      loginChallenge: challenge,
      acceptOAuth2LoginRequest: body
    });
    return { data: response.data };
  } catch (error) {
    apiLogger.logError(error, `Error accepting OAuth2 login request ${challenge}`);
    throw error;
  }
}

export async function rejectOAuth2LoginRequest(
  challenge: string,
  body: RejectOAuth2Request
) {
  try {
    const response = await getAdminOAuth2Api().rejectOAuth2LoginRequest({
      loginChallenge: challenge,
      rejectOAuth2Request: body
    });
    return { data: response.data };
  } catch (error) {
    apiLogger.logError(error, `Error rejecting OAuth2 login request ${challenge}`);
    throw error;
  }
}

// Logout Request operations
export async function getOAuth2LogoutRequest(challenge: string) {
  try {
    const response = await getAdminOAuth2Api().getOAuth2LogoutRequest({ logoutChallenge: challenge });
    return { data: response.data };
  } catch (error) {
    apiLogger.logError(error, `Error getting OAuth2 logout request ${challenge}`);
    throw error;
  }
}

export async function acceptOAuth2LogoutRequest(challenge: string) {
  try {
    const response = await getAdminOAuth2Api().acceptOAuth2LogoutRequest({ logoutChallenge: challenge });
    return { data: response.data };
  } catch (error) {
    apiLogger.logError(error, `Error accepting OAuth2 logout request ${challenge}`);
    throw error;
  }
}

export async function rejectOAuth2LogoutRequest(challenge: string) {
  try {
    const response = await getAdminOAuth2Api().rejectOAuth2LogoutRequest({ logoutChallenge: challenge });
    return { data: response.data };
  } catch (error) {
    apiLogger.logError(error, `Error rejecting OAuth2 logout request ${challenge}`);
    throw error;
  }
}

// Consent Session operations
export async function listOAuth2ConsentSessions(params: ListConsentSessionsParams = {}) {
  // Subject is required by Hydra API
  if (!params.subject) {
    throw new Error('Subject parameter is required for listing consent sessions');
  }

  try {
    const response = await getAdminOAuth2Api().listOAuth2ConsentSessions({
      pageSize: params.page_size,
      pageToken: params.page_token,
      subject: params.subject,
      loginSessionId: params.login_session_id
    });

    return {
      data: response.data || [],
    };
  } catch (error) {
    apiLogger.logError(error, 'Error listing OAuth2 consent sessions');
    throw error;
  }
}

export async function revokeOAuth2ConsentSessions(
  subject: string,
  client?: string,
  all?: boolean
) {
  try {
    const response = await getAdminOAuth2Api().revokeOAuth2ConsentSessions({
      subject,
      client,
      all
    });
    return { data: response.data };
  } catch (error) {
    apiLogger.logError(error, `Error revoking OAuth2 consent sessions for subject ${subject}`);
    throw error;
  }
}

// Note: OAuth2LoginSession operations are not available in the official Hydra client
// Use OAuth2ConsentSession operations instead