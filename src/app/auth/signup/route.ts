import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const form = await req.formData();
  const business_name = String(form.get("business_name") || "");
  const owner_name = String(form.get("owner_name") || "");
  const owner_phone = String(form.get("owner_phone") || "");
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const anon = createClient(supabaseUrl, anonKey);
  const { data: signUp, error: signUpErr } = await anon.auth.signUp({ email, password });

  if (signUpErr || !signUp.user) {
    const msg = signUpErr?.message || "Signup failed";
    return NextResponse.redirect(new URL(`/signup?error=${encodeURIComponent(msg)}`, req.url));
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { error: rpcErr } = await admin.rpc("admin_create_account_for_user", {
    p_user_id: signUp.user.id,
    p_business_name: business_name,
    p_owner_name: owner_name,
    p_owner_email: email,
    p_owner_phone: owner_phone,
    p_role: "owner",
  });

  if (rpcErr) {
    return NextResponse.redirect(new URL(`/signup?error=${encodeURIComponent(rpcErr.message)}`, req.url));
  }

  return NextResponse.redirect(new URL("/login", req.url));
}
