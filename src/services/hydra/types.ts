// Re-export types from the official Hydra client
export type {
	AcceptOAuth2ConsentRequest,
	AcceptOAuth2LoginRequest,
	IntrospectedOAuth2Token,
	JsonWebKey,
	JsonWebKeySet,
	OAuth2Client,
	OAuth2ConsentRequest,
	OAuth2ConsentSession,
	OAuth2LoginRequest,
	OAuth2LogoutRequest,
	OAuth2RedirectTo,
	OidcConfiguration,
	OidcUserInfo,
	RejectOAuth2Request,
} from "@ory/hydra-client";

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
