import { hydraAdminClient } from '../client';
import {
  OAuth2ConsentRequest,
  OAuth2LoginRequest,
  OAuth2LogoutRequest,
  AcceptOAuth2ConsentRequest,
  AcceptOAuth2LoginRequest,
  RejectOAuth2Request,
  OAuth2RedirectTo,
  PaginationParams,
} from '../types';
import { apiLogger } from '@/lib/logger';

// OAuth2 Authentication Flow operations

export interface ListConsentSessionsParams extends PaginationParams {
  subject?: string;
  login_session_id?: string;
}

// Consent Request operations
export async function getOAuth2ConsentRequest(challenge: string) {
  try {
    const response = await hydraAdminClient.get<OAuth2ConsentRequest>(
      `/admin/oauth2/auth/requests/consent?consent_challenge=${encodeURIComponent(challenge)}`
    );
    return response;
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
    const response = await hydraAdminClient.put<OAuth2RedirectTo>(
      `/admin/oauth2/auth/requests/consent/accept?consent_challenge=${encodeURIComponent(challenge)}`,
      body
    );
    return response;
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
    const response = await hydraAdminClient.put<OAuth2RedirectTo>(
      `/admin/oauth2/auth/requests/consent/reject?consent_challenge=${encodeURIComponent(challenge)}`,
      body
    );
    return response;
  } catch (error) {
    apiLogger.logError(error, `Error rejecting OAuth2 consent request ${challenge}`);
    throw error;
  }
}

// Login Request operations
export async function getOAuth2LoginRequest(challenge: string) {
  try {
    const response = await hydraAdminClient.get<OAuth2LoginRequest>(
      `/admin/oauth2/auth/requests/login?login_challenge=${encodeURIComponent(challenge)}`
    );
    return response;
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
    const response = await hydraAdminClient.put<OAuth2RedirectTo>(
      `/admin/oauth2/auth/requests/login/accept?login_challenge=${encodeURIComponent(challenge)}`,
      body
    );
    return response;
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
    const response = await hydraAdminClient.put<OAuth2RedirectTo>(
      `/admin/oauth2/auth/requests/login/reject?login_challenge=${encodeURIComponent(challenge)}`,
      body
    );
    return response;
  } catch (error) {
    apiLogger.logError(error, `Error rejecting OAuth2 login request ${challenge}`);
    throw error;
  }
}

// Logout Request operations
export async function getOAuth2LogoutRequest(challenge: string) {
  try {
    const response = await hydraAdminClient.get<OAuth2LogoutRequest>(
      `/admin/oauth2/auth/requests/logout?logout_challenge=${encodeURIComponent(challenge)}`
    );
    return response;
  } catch (error) {
    apiLogger.logError(error, `Error getting OAuth2 logout request ${challenge}`);
    throw error;
  }
}

export async function acceptOAuth2LogoutRequest(challenge: string) {
  try {
    const response = await hydraAdminClient.put<OAuth2RedirectTo>(
      `/admin/oauth2/auth/requests/logout/accept?logout_challenge=${encodeURIComponent(challenge)}`
    );
    return response;
  } catch (error) {
    apiLogger.logError(error, `Error accepting OAuth2 logout request ${challenge}`);
    throw error;
  }
}

export async function rejectOAuth2LogoutRequest(challenge: string) {
  try {
    const response = await hydraAdminClient.put<OAuth2RedirectTo>(
      `/admin/oauth2/auth/requests/logout/reject?logout_challenge=${encodeURIComponent(challenge)}`
    );
    return response;
  } catch (error) {
    apiLogger.logError(error, `Error rejecting OAuth2 logout request ${challenge}`);
    throw error;
  }
}

// Consent Session operations
export async function listOAuth2ConsentSessions(params: ListConsentSessionsParams = {}) {
  try {
    const queryParams = new URLSearchParams();

    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params.page_token) queryParams.append('page_token', params.page_token);
    if (params.subject) queryParams.append('subject', params.subject);
    if (params.login_session_id) queryParams.append('login_session_id', params.login_session_id);

    const url = `/admin/oauth2/auth/sessions/consent${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await hydraAdminClient.get<any[]>(url);

    return {
      ...response,
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
    const queryParams = new URLSearchParams({ subject });
    if (client) queryParams.append('client', client);
    if (all) queryParams.append('all', 'true');

    const url = `/admin/oauth2/auth/sessions/consent?${queryParams.toString()}`;
    const response = await hydraAdminClient.delete(url);
    return response;
  } catch (error) {
    apiLogger.logError(error, `Error revoking OAuth2 consent sessions for subject ${subject}`);
    throw error;
  }
}

// Login Session operations
export async function listOAuth2LoginSessions(subject: string) {
  try {
    const response = await hydraAdminClient.get<any[]>(
      `/admin/oauth2/auth/sessions/login?subject=${encodeURIComponent(subject)}`
    );
    return {
      ...response,
      data: response.data || [],
    };
  } catch (error) {
    apiLogger.logError(error, `Error listing OAuth2 login sessions for subject ${subject}`);
    throw error;
  }
}

export async function revokeOAuth2LoginSessions(subject: string) {
  try {
    const response = await hydraAdminClient.delete(
      `/admin/oauth2/auth/sessions/login?subject=${encodeURIComponent(subject)}`
    );
    return response;
  } catch (error) {
    apiLogger.logError(error, `Error revoking OAuth2 login sessions for subject ${subject}`);
    throw error;
  }
}