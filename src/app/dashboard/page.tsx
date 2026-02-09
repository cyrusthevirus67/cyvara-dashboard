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
  <div className="wrap">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <div>
        <div className="pill" style={{ marginBottom: 8 }}>
          <span>Cyvara Client Portal</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.02em" }}>Dashboard</h1>
        <div className="muted" style={{ marginTop: 6 }}>
          {account?.business_name || "Your Business"} • {user.email}
        </div>
      </div>

      <form action="/auth/logout" method="post">
        <button className="btn primary" type="submit">Log out</button>
      </form>
    </div>

    <div className="stat-grid">
      <div className="card">
        <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Total Leads</div>
        <div style={{ fontSize: 24, fontWeight: 800 }}>{leads?.length || 0}</div>
      </div>
      <div className="card">
        <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>New</div>
        <div style={{ fontSize: 24, fontWeight: 800 }}>
          {(leads as Lead[] | null)?.filter(l => l.status === "New").length || 0}
        </div>
      </div>
      <div className="card">
        <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Booked</div>
        <div style={{ fontSize: 24, fontWeight: 800 }}>
          {(leads as Lead[] | null)?.filter(l => l.status === "Booked").length || 0}
        </div>
      </div>
    </div>

    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontWeight: 800 }}>Leads</div>
        <div className="muted" style={{ fontSize: 12 }}>Most recent 50</div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Service</th>
            <th>Status</th>
            <th>Last Activity</th>
          </tr>
        </thead>
        <tbody>
          {(leads as Lead[] | null)?.map((l) => (
            <tr key={l.id}>
              <td>
                <Link href={`/leads/${l.id}`} style={{ fontWeight: 700 }}>
                  {l.name || "Unknown"}
                </Link>
              </td>
              <td style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas" }}>
                {l.phone || "—"}
              </td>
              <td>{l.service_requested || "—"}</td>
              <td>
                <span className={
                  l.status === "Booked" ? "badge green" :
                  l.status === "Qualified" ? "badge" :
                  l.status === "Lost" ? "badge red" :
                  "badge yellow"
                }>
                  {l.status}
                </span>
              </td>
              <td>{new Date(l.last_activity).toLocaleString()}</td>
            </tr>
          ))}
          {!leads?.length ? (
            <tr>
              <td colSpan={5} className="muted">No leads yet. Insert a test lead in Supabase.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  </div>
);
