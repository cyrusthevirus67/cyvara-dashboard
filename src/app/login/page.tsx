import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If already logged in, send to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="wrap" style={{ maxWidth: 460 }}>
      {/* LOGO */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <Image
          src="/cyvara-logo.png"
          alt="Cyvara"
          width={120}
          height={120}
          priority
        />
      </div>

      {/* LOGIN CARD */}
      <div className="card">
        <h1 style={{ margin: 0, marginBottom: 6 }}>Client Login</h1>
        <p className="muted" style={{ marginTop: 0, marginBottom: 14 }}>
          Log in to your Cyvara dashboard.
        </p>

        <form action="/auth/login" method="post" style={{ display: "grid", gap: 10 }}>
          <input
            className="input"
            type="email"
            name="email"
            placeholder="Email"
            required
          />

          <input
            className="input"
            type="password"
            name="password"
            placeholder="Password"
            required
          />

          <button className="btn primary" type="submit">
            Log in
          </button>
        </form>

        <div className="muted" style={{ marginTop: 14 }}>
          Don’t have an account?{" "}
          <Link href="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
