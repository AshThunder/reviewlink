import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { BufferApiError, getAccount, getChannels } from "@/lib/buffer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const orgId =
      session.organizationId ||
      (await getAccount(session.accountId)).organizations[0]?.id;
    if (!orgId) {
      return NextResponse.json({ channels: [] });
    }
    const channels = await getChannels(session.accountId, orgId);
    return NextResponse.json({ organizationId: orgId, channels });
  } catch (err) {
    const status = err instanceof BufferApiError ? err.status : 502;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load channels" },
      { status },
    );
  }
}
