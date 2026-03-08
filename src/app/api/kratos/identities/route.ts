import { errorResponse, getIntParam, getSearchParams, jsonResponse, withAuth } from "@/lib/api-helpers";
import { createIdentity, listIdentities } from "@/services/kratos/endpoints/identities";

export const GET = withAuth(async (request) => {
	try {
		const params = getSearchParams(request);
		const pageSize = getIntParam(params, "pageSize");
		const pageToken = params.get("pageToken") || undefined;

		const response = await listIdentities({ pageSize, pageToken });

		// Parse Link header for pagination
		const linkHeader = response.headers?.link;
		let nextPageToken: string | null = null;
		if (linkHeader) {
			const nextMatch = linkHeader.match(/<[^>]*[?&]page_token=([^&>]+)[^>]*>;\s*rel="next"/);
			if (nextMatch) {
				nextPageToken = nextMatch[1];
			}
		}

		return jsonResponse({
			identities: response.data,
			nextPageToken,
			hasMore: !!nextPageToken,
		});
	} catch (error) {
		return errorResponse(error);
	}
});

export const POST = withAuth(async (request) => {
	try {
		const body = await request.json();
		const { data } = await createIdentity({ createIdentityBody: body });
		return jsonResponse(data, 201);
	} catch (error) {
		return errorResponse(error);
	}
});
