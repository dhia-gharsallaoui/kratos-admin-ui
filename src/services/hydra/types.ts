// Core Hydra API types based on the OpenAPI spec

export interface OAuth2Client {
  client_id?: string;
  client_name?: string;
  client_secret?: string;
  client_uri?: string;
  grant_types?: string[];
  response_types?: string[];
  redirect_uris?: string[];
  scope?: string;
  audience?: string[];
  owner?: string;
  policy_uri?: string;
  tos_uri?: string;
  logo_uri?: string;
  contacts?: string[];
  client_secret_expires_at?: number;
  subject_type?: string;
  token_endpoint_auth_method?: string;
  userinfo_signed_response_alg?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface OAuth2ConsentRequest {
  challenge?: string;
  skip?: boolean;
  subject?: string;
  client?: OAuth2Client;
  request_url?: string;
  requested_scope?: string[];
  requested_access_token_audience?: string[];
  login_challenge?: string;
  login_session_id?: string;
  acr?: string;
  amr?: string[];
  context?: Record<string, any>;
  oidc_context?: OAuth2ConsentRequestOpenIDConnectContext;
}

export interface OAuth2ConsentRequestOpenIDConnectContext {
  acr_values?: string[];
  display?: string;
  id_token_hint_claims?: Record<string, any>;
  login_hint?: string;
  ui_locales?: string[];
}

export interface OAuth2LoginRequest {
  challenge?: string;
  client?: OAuth2Client;
  oidc_context?: OAuth2ConsentRequestOpenIDConnectContext;
  request_url?: string;
  requested_access_token_audience?: string[];
  requested_scope?: string[];
  session_id?: string;
  skip?: boolean;
  subject?: string;
}

export interface OAuth2LogoutRequest {
  challenge?: string;
  client?: OAuth2Client;
  request_url?: string;
  rp_initiated?: boolean;
  sid?: string;
  subject?: string;
}

export interface IntrospectedOAuth2Token {
  active?: boolean;
  aud?: string[];
  client_id?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  nbf?: number;
  obfuscated_subject?: string;
  scope?: string;
  sub?: string;
  token_type?: string;
  token_use?: string;
  username?: string;
}

export interface AcceptOAuth2ConsentRequest {
  grant_scope?: string[];
  grant_access_token_audience?: string[];
  remember?: boolean;
  remember_for?: number;
  session?: AcceptOAuth2ConsentRequestSession;
  context?: Record<string, any>;
  handled_at?: string;
}

export interface AcceptOAuth2ConsentRequestSession {
  access_token?: Record<string, any>;
  id_token?: Record<string, any>;
}

export interface AcceptOAuth2LoginRequest {
  subject: string;
  remember?: boolean;
  remember_for?: number;
  acr?: string;
  amr?: string[];
  context?: Record<string, any>;
  extend_session_lifespan?: boolean;
  force_subject_identifier?: string;
  identity_provider_session_id?: string;
}

export interface RejectOAuth2Request {
  error?: string;
  error_description?: string;
  error_hint?: string;
  error_debug?: string;
  status_code?: number;
}

export interface OAuth2RedirectTo {
  redirect_to: string;
}

export interface OidcConfiguration {
  authorization_endpoint?: string;
  token_endpoint?: string;
  userinfo_endpoint?: string;
  jwks_uri?: string;
  subject_types_supported?: string[];
  response_types_supported?: string[];
  claims_supported?: string[];
  scopes_supported?: string[];
  issuer?: string;
  id_token_signing_alg_values_supported?: string[];
}

export interface OidcUserInfo {
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: Record<string, any>;
  updated_at?: number;
}

export interface JsonWebKey {
  alg?: string;
  crv?: string;
  d?: string;
  dp?: string;
  dq?: string;
  e?: string;
  k?: string;
  kid?: string;
  kty?: string;
  n?: string;
  p?: string;
  q?: string;
  qi?: string;
  use?: string;
  x?: string;
  x5c?: string[];
  x5t?: string;
  'x5t#S256'?: string;
  x5u?: string;
  y?: string;
}

export interface JsonWebKeySet {
  keys?: JsonWebKey[];
}

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