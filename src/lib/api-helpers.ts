import { ApiCallError } from "@/utils/api-wrapper";
import { getSessionFromRequest, UserRole } from "./auth";

type RouteHandler = (request: Request, context: { params: Promise<Record<string, string>> }) => Promise<Response>;

/** Wraps a route handler with authentication check */
export function withAuth(handler: RouteHandler): RouteHandler {
	return async (request, context) => {
		const session = getSessionFromRequest(request);
		if (!session) {
			return Response.json({ error: "Unauthorized", message: "Authentication required" }, { status: 401 });
		}
		return handler(request, context);
	};
}

/** Wraps a route handler with authentication + admin role check */
export function withAdminAuth(handler: RouteHandler): RouteHandler {
	return async (request, context) => {
		const session = getSessionFromRequest(request);
		if (!session) {
			return Response.json({ error: "Unauthorized", message: "Authentication required" }, { status: 401 });
		}
		if (session.role !== UserRole.ADMIN) {
			return Response.json({ error: "Forbidden", message: "Admin access required" }, { status: 403 });
		}
		return handler(request, context);
	};
}

/** Create a JSON response */
export function jsonResponse(data: unknown, status = 200): Response {
	return Response.json(data, { status });
}

/** Convert an error to a JSON response */
export function errorResponse(error: unknown): Response {
	if (error instanceof ApiCallError) {
		return Response.json({ error: error.message, code: error.code, status: error.status }, { status: error.status || 502 });
	}

	const message = error instanceof Error ? error.message : "Internal server error";
	return Response.json({ error: message }, { status: 500 });
}

/** Parse search params from a request URL */
export function getSearchParams(request: Request): URLSearchParams {
	return new URL(request.url).searchParams;
}

/** Parse optional integer from search params */
export function getIntParam(params: URLSearchParams, key: string): number | undefined {
	const value = params.get(key);
	if (value === null) return undefined;
	const parsed = Number.parseInt(value, 10);
	return Number.isNaN(parsed) ? undefined : parsed;
}
