import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServer();
  const leadId = params.id;

  const { data: lead } = await supabase
    .from("leads")
    .select("id,name,phone,service_requested,status,notes")
    .eq("id", leadId)
    .single();

  const { data: messages } = await supabase
    .from("messages")
    .select("id,direction,body,created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });

  async function updateLead(formData: FormData) {
    "use server";
    const status = String(formData.get("status") || "New");
    const notes = String(formData.get("notes") || "");

    const supabase = createSupabaseServer();
    await supabase
      .from("leads")
      .update({ status, notes, last_activity: new Date().toISOString() })
      .eq("id", leadId);

    revalidatePath(`/leads/${leadId}`);
  }

  if (!lead) {
    return (
      <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
        <h1>Lead not found</h1>
        <p style={{ color: "#6b7280" }}>Either it doesn’t exist or you don’t have access.</p>
        <a href="/dashboard" style={{ color: "#4f46e5", textDecoration: "none" }}>← Back</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
      <a href="/dashboard" style={{ color: "#4f46e5", textDecoration: "none" }}>← Back</a>
      <h1 style={{ marginBottom: 6 }}>{lead.name || "Unknown Lead"}</h1>
      <div style={{ color: "#6b7280" }}>{lead.phone || "—"} • {lead.service_requested || "—"}</div>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <form action={updateLead} style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 14 }}>
          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ fontWeight: 900 }}>Status</label>
            <select name="status" defaultValue={lead.status} style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }}>
              {["New","Qualified","Booked","Lost"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <label style={{ fontWeight: 900 }}>Notes</label>
            <textarea name="notes" defaultValue={lead.notes || ""} rows={5} style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }} />

            <button type="submit" style={{ padding: 12, borderRadius: 12, border: "none", background: "#111827", color: "white", fontWeight: 900 }}>
              Save
            </button>
          </div>
        </form>

        <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: 12, background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontWeight: 900 }}>Messages</div>
          <div style={{ padding: 12, display: "grid", gap: 10 }}>
            {messages?.map(m => (
              <div key={m.id} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 10, background: m.direction === "outbound" ? "#eef2ff" : "white" }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                  {m.direction.toUpperCase()} • {new Date(m.created_at).toLocaleString()}
                </div>
                <div>{m.body}</div>
              </div>
            ))}
            {!messages?.length ? <div style={{ color: "#6b7280" }}>No messages yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
