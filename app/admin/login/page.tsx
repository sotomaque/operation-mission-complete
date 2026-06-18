import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DossierFrame } from "@/components/dossier-frame";
import { getSessionOptions, type SessionData } from "@/lib/session";

/**
 * Admin login. Single shared password kept in ADMIN_PASSWORD env var,
 * checked against the submitted password and set on an iron-session
 * signed cookie. No accounts, no rate limit (fire-and-forget project),
 * no CAPTCHA. If this leaks, change the env var.
 */

async function loginAction(formData: FormData) {
  "use server";
  const password = formData.get("password");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD is not set");
  }
  if (typeof password !== "string" || password !== expected) {
    redirect("/admin/login?error=1");
  }
  const session = await getIronSession<SessionData>(
    await cookies(),
    getSessionOptions(),
  );
  session.isAdmin = true;
  await session.save();
  redirect("/admin/dashboard");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <DossierFrame fileNumber="ADMIN" classification="HANDLER ACCESS">
      <header className="space-y-3 mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-dossier-ink-muted">
          Restricted Area
        </p>
        <h1 className="font-serif text-3xl text-dossier-ink leading-tight">
          Handler authentication required.
        </h1>
        <p className="font-mono text-sm text-dossier-ink-muted">
          Enter the dossier password to view the guest manifest.
        </p>
      </header>

      <form action={loginAction} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
          />
        </div>
        {sp.error ? (
          <p className="font-mono text-sm text-classified-red">
            Access denied. Try again.
          </p>
        ) : null}
        <Button type="submit" size="lg" className="w-full">
          Authenticate
        </Button>
      </form>
    </DossierFrame>
  );
}
