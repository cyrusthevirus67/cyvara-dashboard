import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const supabase = createSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/dashboard");

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 6 }}>Cyvara Login</h1>
      <p style={{ color: "#6b7280", marginTop: 0 }}>Log in to view leads and conversations.</p>

      {searchParams?.error ? (
        <div style={{ background: "#fee2e2", padding: 10, borderRadius: 10, marginBottom: 12 }}>
          {searchParams.error}
        </div>
      ) : null}

      <form action="/auth/login" method="post" style={{ display: "grid", gap: 10 }}>
        <input name="email" type="email" placeholder="Email" required style={{ padding: 12, borderRadius: 12, border: "1px solid #e5e7eb" }} />
        <input name="password" type="password" placeholder="Password" required style={{ padding: 12, borderRadius: 12, border: "1px solid #e5e7eb" }} />
        <button type="submit" style={{ padding: 12, borderRadius: 12, border: "none", background: "#4f46e5", color: "white", fontWeight: 800 }}>
          Log in
        </button>
      </form>

      <div style={{ marginTop: 12, color: "#6b7280" }}>
        No account? <Link href="/signup">Create one</Link>
      </div>
    </div>
  );
}
