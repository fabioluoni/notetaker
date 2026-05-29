import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as
    | "email"
    | "signup"
    | "magiclink"
    | "recovery"
    | "email_change"
    | null;
  const next = searchParams.get("next") ?? "/dashboard";

  // In produzione su Vercel usa x-forwarded-host per l'URL corretto
  const forwardedHost = request.headers.get("x-forwarded-host");
  const redirectBase =
    process.env.NODE_ENV === "production" && forwardedHost
      ? `https://${forwardedHost}`
      : origin;

  const supabase = await createClient();

  // Flusso PKCE (registrazione con conferma email)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${redirectBase}${next}`);
    }
  }

  // Flusso OTP (magic link)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return NextResponse.redirect(`${redirectBase}${next}`);
    }
  }

  return NextResponse.redirect(`${redirectBase}/login?error=auth_failed`);
}
