import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@authgear/nextjs/server";
import { authgearConfig } from "@/lib/authgear";

export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const payload = await verifyAccessToken(token, authgearConfig);
    return NextResponse.json({ sub: payload.sub, email: payload["email"] });
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }
}
