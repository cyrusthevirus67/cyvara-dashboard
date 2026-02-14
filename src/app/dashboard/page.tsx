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

  const leadList = (leads as Lead[] | null) ?? [];
  const totalLeads = leadList.length;
  const newLeads = leadList.filter((l) => l.status === "New").length;
  const qualifiedLeads = leadList.filter((l) => l.status === "Qualified").length;
  const bookedLeads = leadList.filter((l) => l.status === "Booked").length;
  const latestActivity = leadList[0]?.last_activity
    ? new Date(leadList[0].last_activity).toLocaleString()
    : "—";

  return (
    <div className="wrap">
      <div className="topbar">
        <div>
          <div className="pill">Client Portal</div>
          <h1 className="page-title">Dashboard</h1>
          <div className="muted">
            {account?.business_name || "Your Business"} • {user.email}
          </div>
        </div>

        <form action="/auth/logout" method="post">
          <button className="btn primary" type="submit">
            Log out
          </button>
        </form>
      </div>

      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-label">Total leads</div>
          <div className="stat-value">{totalLeads}</div>
          <div className="stat-sub">Last activity: {latestActivity}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">New</div>
          <div className="stat-value">{newLeads}</div>
          <div className="stat-sub">Needs follow-up</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Qualified</div>
          <div className="stat-value">{qualifiedLeads}</div>
          <div className="stat-sub">High intent</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Booked</div>
          <div className="stat-value">{bookedLeads}</div>
          <div className="stat-sub">Converted</div>
        </div>
      </div>

      <div className="card">
        <div className="table-head">
          <div className="table-title">Recent leads</div>
          <div className="muted">Most recent 50</div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Service</th>
              <th>Status</th>
              <th>Last activity</th>
            </tr>
          </thead>
          <tbody>
            {leadList.map((l) => (
              <tr key={l.id} className="table-row">
                <td>
                  <Link href={`/leads/${l.id}`} className="link-strong">
                    {l.name || "Unknown"}
                  </Link>
                </td>
                <td className="mono">{l.phone || "—"}</td>
                <td>{l.service_requested || "—"}</td>
                <td>
                  <span
                    className={
                      l.status === "Booked"
                        ? "badge green"
                        : l.status === "Qualified"
                        ? "badge"
                        : l.status === "Lost"
                        ? "badge red"
                        : "badge yellow"
                    }
                  >
                    {l.status}
                  </span>
                </td>
                <td>{new Date(l.last_activity).toLocaleString()}</td>
              </tr>
            ))}
            {!leadList.length ? (
              <tr>
                <td colSpan={5} className="empty-row">
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
