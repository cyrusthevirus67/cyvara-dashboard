import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

type Lead = {
  id: string;
  name: string | null;
  phone: string | null;
  service_requested: string | null;
  status: "New" | "Qualified" | "Booked" | "Lost";
  last_activity: string;
};

export default async function DashboardPage() {
  const supabase = createSupabaseServer();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("account_id")
    .eq("id", user.id)
    .single();

  const { data: account } = await supabase
    .from("accounts")
    .select("business_name")
    .eq("id", profile?.account_id)
    .single();

  const { data: leads } = await supabase
    .from("leads")
    .select("id,name,phone,service_requested,status,last_activity")
    .order("last_activity", { ascending: false })
    .limit(50);

  return (
    <div style={{ maxWidth: 1100, margin: "30px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <div style={{ color: "#6b7280", marginTop: 6 }}>
            {account?.business_name || "Your Business"} • {user.email}
          </div>
        </div>

        <form action="/auth/logout" method="post">
          <button style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb", background: "white" }}>
            Log out
          </button>
        </form>
      </div>

      <div style={{ marginTop: 18, border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: 12, background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontWeight: 900 }}>
          Leads
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#6b7280", fontSize: 13 }}>
              <th style={{ padding: 12 }}>Name</th>
              <th style={{ padding: 12 }}>Phone</th>
              <th style={{ padding: 12 }}>Service</th>
              <th style={{ padding: 12 }}>Status</th>
              <th style={{ padding: 12 }}>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {(leads as Lead[] | null)?.map((l) => (
              <tr key={l.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: 12 }}>
                  <Link href={`/leads/${l.id}`} style={{ fontWeight: 900, color: "#111827", textDecoration: "none" }}>
                    {l.name || "Unknown"}
                  </Link>
                </td>
                <td style={{ padding: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas" }}>
                  {l.phone || "—"}
                </td>
                <td style={{ padding: 12 }}>{l.service_requested || "—"}</td>
                <td style={{ padding: 12 }}>{l.status}</td>
                <td style={{ padding: 12 }}>{new Date(l.last_activity).toLocaleString()}</td>
              </tr>
            ))}
            {!leads?.length ? (
              <tr>
                <td colSpan={5} style={{ padding: 14, color: "#6b7280" }}>
                  No leads yet. Insert a test lead in Supabase.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
