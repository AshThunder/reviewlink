import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ThanksRedirect({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  redirect(`/r/${token}`);
}
