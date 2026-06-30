import { Bot, Lead, s } from "./types";

interface Props {
  bots: Bot[];
  leads: Lead[];
  loading: boolean;
  selectedBotId: number | null;
  onLoadLeads: (id: number) => void;
  onBack: () => void;
}

export default function LeadsTab({ bots, leads, loading, selectedBotId, onLoadLeads, onBack }: Props) {
  return (
    <>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>📧 Лиды</h1>
          <p style={s.pageSubtitle}>
            Бот: <strong>{bots.find((b) => b.id === selectedBotId)?.name ?? "—"}</strong>
            {" · "}
            <button style={{ background: "none", border: "none", color: "#0077FF", cursor: "pointer", fontSize: "0.88rem", padding: 0 }} onClick={onBack}>← Назад к ботам</button>
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {bots.map((b) => (
            <button key={b.id}
              style={{ background: b.id === selectedBotId ? "linear-gradient(135deg,#E040FB,#7B61FF)" : "#F4F6FF", color: b.id === selectedBotId ? "#fff" : "#4A5280", border: "1.5px solid #E0E4F0", borderRadius: "10px", padding: "8px 14px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
              onClick={() => onLoadLeads(b.id)}>{b.name}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={s.empty}>Загружаю лиды...</div>
      ) : leads.length === 0 ? (
        <div style={s.emptyBox}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📧</div>
          <h3 style={s.emptyTitle}>Лидов пока нет</h3>
          <p style={s.emptySub}>Добавьте узел «Сбор email» в сценарий бота и протестируйте его</p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #F0F2F8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, color: "#0A0E27" }}>Всего лидов: {leads.length}</span>
            <button
              onClick={() => {
                const csv = ["Email,Имя,Телефон,Дата", ...leads.map((l) => `${l.email},${l.name},${l.phone},${new Date(l.created_at).toLocaleDateString("ru")}`)].join("\n");
                const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "leads.csv"; a.click();
              }}
              style={{ background: "#F4F6FF", border: "1.5px solid #E0E4F0", borderRadius: "9px", padding: "7px 14px", fontSize: "0.82rem", fontWeight: 600, color: "#4A5280", cursor: "pointer" }}>
              ⬇ Скачать CSV
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8F9FF" }}>
                {["Email", "Имя", "Телефон", "Дата"].map((h) => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, color: "#8B92B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => (
                <tr key={lead.id} style={{ borderTop: "1px solid #F0F2F8", background: i % 2 === 0 ? "#fff" : "#FAFBFF" }}>
                  <td style={{ padding: "13px 20px", fontSize: "0.88rem", color: "#0077FF", fontWeight: 600 }}>{lead.email}</td>
                  <td style={{ padding: "13px 20px", fontSize: "0.88rem", color: "#0A0E27" }}>{lead.name || "—"}</td>
                  <td style={{ padding: "13px 20px", fontSize: "0.88rem", color: "#8B92B8" }}>{lead.phone || "—"}</td>
                  <td style={{ padding: "13px 20px", fontSize: "0.78rem", color: "#C8CEE0" }}>{new Date(lead.created_at).toLocaleDateString("ru")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
