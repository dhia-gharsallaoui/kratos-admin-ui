import { deleteSession, getClearSessionCookieHeader, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
	// Extract token from cookie to delete from session store
	const cookieHeader = request.headers.get("cookie");
	if (cookieHeader) {
		const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
		if (match) {
			deleteSession(match[1]);
		}
	}

	return new Response(JSON.stringify({ success: true }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"Set-Cookie": getClearSessionCookieHeader(),
		},
	});
}
