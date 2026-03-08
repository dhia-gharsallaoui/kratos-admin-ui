import { createSession, getSessionCookieHeader, validateCredentials } from "@/lib/auth";

export async function POST(request: Request) {
	try {
		const { username, password } = await request.json();

		if (!username || !password) {
			return Response.json({ error: "Username and password are required" }, { status: 400 });
		}

		const sessionData = validateCredentials(username, password);
		if (!sessionData) {
			return Response.json({ error: "Invalid credentials" }, { status: 401 });
		}

		const token = createSession(sessionData);
		const { createdAt, ...userData } = sessionData;

		return new Response(JSON.stringify({ user: userData }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Set-Cookie": getSessionCookieHeader(token),
			},
		});
	} catch {
		return Response.json({ error: "Invalid request body" }, { status: 400 });
	}
}
