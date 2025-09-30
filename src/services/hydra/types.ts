// Re-export types from the official Hydra client
export type {
  OAuth2Client,
  OAuth2ConsentRequest,
  OAuth2LoginRequest,
  OAuth2LogoutRequest,
  IntrospectedOAuth2Token,
  AcceptOAuth2ConsentRequest,
  AcceptOAuth2LoginRequest,
  RejectOAuth2Request,
  OAuth2RedirectTo,
  OidcConfiguration,
  OidcUserInfo,
  JsonWebKey,
  JsonWebKeySet,
  OAuth2ConsentSession,
} from '@ory/hydra-client';

// API Response wrapper types
export interface HydraApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// Pagination types
export interface PaginationParams {
  page_size?: number;
  page_token?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total_count?: number;
  page_token?: string;
  has_next_page?: boolean;
}