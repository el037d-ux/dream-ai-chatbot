import { Landing, s } from "./types";

interface Props {
  landings: Landing[];
  loading: boolean;
  creating: boolean;
  onCreate: () => void;
  onOpen: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function LandingsTab({ landings, loading, creating, onCreate, onOpen, onDelete }: Props) {
  return (
    <>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>🖼 Лендинги</h1>
          <p style={s.pageSubtitle}>Собирайте посадочные страницы из готовых блоков</p>
        </div>
        <button onClick={onCreate} disabled={creating}
          style={{ background: "linear-gradient(135deg,#0077FF,#00A8FF)", color: "#fff", border: "none", borderRadius: "12px", padding: "11px 20px", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
          {creating ? "Создаю..." : "+ Новый лендинг"}
        </button>
      </div>

      {loading ? (
        <div style={s.empty}>Загружаю...</div>
      ) : landings.length === 0 ? (
        <div style={s.emptyBox}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🖼</div>
          <h3 style={s.emptyTitle}>Лендингов пока нет</h3>
          <p style={s.emptySub}>Создайте первый лендинг и соберите его из готовых блоков</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
          {landings.map((l) => (
            <div key={l.id} style={{ background: "#fff", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1.5px solid #E8EBF5", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: "rgba(0,119,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🖼</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: "#0A0E27", fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</div>
                  <div style={{ fontSize: "0.75rem", color: l.published ? "#00A884" : "#8B92B8", fontWeight: 600 }}>{l.published ? "● Опубликован" : "○ Черновик"}</div>
                </div>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#C8CEE0" }}>Изменён {new Date(l.updated_at).toLocaleDateString("ru")}</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => onOpen(l.id)}
                  style={{ flex: 1, background: "#F4F6FF", border: "1.5px solid #E0E4F0", borderRadius: "9px", padding: "9px", fontSize: "0.82rem", fontWeight: 700, color: "#0077FF", cursor: "pointer" }}>Открыть</button>
                <button onClick={() => onDelete(l.id)}
                  style={{ background: "#fff0f0", border: "1.5px solid #ffdada", borderRadius: "9px", padding: "9px 12px", fontSize: "0.82rem", fontWeight: 700, color: "#d63031", cursor: "pointer" }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
