import Link from "next/link";

export default function SignupPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div style={{ maxWidth: 520, margin: "60px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 6 }}>Create your Cyvara account</h1>
      <p style={{ color: "#6b7280", marginTop: 0 }}>This creates a login and a new business account.</p>

      {searchParams?.error ? (
        <div style={{ background: "#fee2e2", padding: 10, borderRadius: 10, marginBottom: 12 }}>
          {searchParams.error}
        </div>
      ) : null}

      <form action="/auth/signup" method="post" style={{ display: "grid", gap: 10 }}>
        <input name="business_name" placeholder="Business name" required style={{ padding: 12, borderRadius: 12, border: "1px solid #e5e7eb" }} />
        <input name="owner_name" placeholder="Owner name" required style={{ padding: 12, borderRadius: 12, border: "1px solid #e5e7eb" }} />
        <input name="owner_phone" placeholder="Owner phone" required style={{ padding: 12, borderRadius: 12, border: "1px solid #e5e7eb" }} />
        <input name="email" type="email" placeholder="Email" required style={{ padding: 12, borderRadius: 12, border: "1px solid #e5e7eb" }} />
        <input name="password" type="password" placeholder="Password" required style={{ padding: 12, borderRadius: 12, border: "1px solid #e5e7eb" }} />
        <button type="submit" style={{ padding: 12, borderRadius: 12, border: "none", background: "#111827", color: "white", fontWeight: 800 }}>
          Create account
        </button>
      </form>

      <div style={{ marginTop: 12, color: "#6b7280" }}>
        Already have one? <Link href="/login">Log in</Link>
      </div>
    </div>
  );
}
