import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
	const session = getSessionFromRequest(request);
	if (!session) {
		return Response.json({ error: "Not authenticated" }, { status: 401 });
	}

	const { createdAt, ...userData } = session;
	return Response.json({ user: userData });
}
