import { type NextRequest, NextResponse } from "next/server";
import { encryptApiKey } from "@/lib/crypto";

export async function POST(request: NextRequest) {
	try {
		const { value } = await request.json();
		const encrypted = encryptApiKey(value);
		return NextResponse.json({ encrypted });
	} catch (error) {
		console.error("Encryption error:", error);
		return NextResponse.json({ error: "Encryption failed" }, { status: 500 });
	}
}
