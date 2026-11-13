import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { BufferApiError, getAccount } from "@/lib/buffer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const account = await getAccount(session.accountId);
    return NextResponse.json({
      account: {
        id: account.id,
        name: account.name,
        email: account.email,
        timezone: account.timezone,
        organizations: account.organizations,
      },
    });
  } catch (err) {
    const status = err instanceof BufferApiError ? err.status : 502;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load account" },
      { status },
    );
  }
}
