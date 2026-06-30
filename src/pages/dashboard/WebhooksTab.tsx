import { Bot, Webhook, s } from "./types";

interface Props {
  bots: Bot[];
  webhooks: Webhook[];
  loading: boolean;
  selectedBotId: number | null;
  whForm: Partial<Webhook> | null;
  whSaving: boolean;
  onLoadWebhooks: (id: number) => void;
  onBack: () => void;
  onSetWhForm: (v: Partial<Webhook> | null) => void;
  onSaveWebhook: () => void;
  onToggleWebhook: (wh: Webhook) => void;
}

export default function WebhooksTab({
  bots, webhooks, loading, selectedBotId, whForm, whSaving,
  onLoadWebhooks, onBack, onSetWhForm, onSaveWebhook, onToggleWebhook,
}: Props) {
  return (
    <>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>🔗 Webhook-интеграции</h1>
          <p style={s.pageSubtitle}>
            Бот: <strong>{bots.find((b) => b.id === selectedBotId)?.name ?? "—"}</strong>
            {" · "}
            <button style={{ background: "none", border: "none", color: "#0077FF", cursor: "pointer", fontSize: "0.88rem", padding: 0 }} onClick={onBack}>← Назад к ботам</button>
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {bots.map((b) => (
            <button key={b.id}
              style={{ background: b.id === selectedBotId ? "linear-gradient(135deg,#7B61FF,#0077FF)" : "#F4F6FF", color: b.id === selectedBotId ? "#fff" : "#4A5280", border: "1.5px solid #E0E4F0", borderRadius: "10px", padding: "8px 14px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
              onClick={() => onLoadWebhooks(b.id)}>{b.name}</button>
          ))}
          <button style={{ background: "linear-gradient(135deg,#7B61FF,#0077FF)", color: "#fff", border: "none", borderRadius: "10px", padding: "8px 16px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
            onClick={() => onSetWhForm({ name: "", url: "", method: "POST", secret: "", events: ["lead.created"], active: true })}>
            + Добавить webhook
          </button>
        </div>
      </div>

      {whForm && (
        <div style={{ background: "#fff", borderRadius: "20px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1.5px solid rgba(123,97,255,0.2)" }}>
          <div style={{ fontWeight: 700, color: "#0A0E27", fontSize: "0.95rem", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
            🔗 {whForm.id ? "Редактировать webhook" : "Новый webhook"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {[
              { label: "Название", key: "name", placeholder: "Например: Отправка в CRM", type: "text" },
              { label: "HTTP метод", key: "method", placeholder: "", type: "select" },
              { label: "URL для отправки", key: "url", placeholder: "https://your-service.com/webhook", type: "url", span: true },
              { label: "Секретный ключ (необязательно)", key: "secret", placeholder: "Для подписи X-Webhook-Secret", type: "password" },
            ].map((f) => (
              <div key={f.key} style={{ gridColumn: f.span ? "1 / -1" : "auto" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8B92B8", textTransform: "uppercase" as const, letterSpacing: "0.04em", display: "block", marginBottom: "5px" }}>{f.label}</label>
                {f.type === "select" ? (
                  <select style={{ padding: "9px 12px", border: "1.5px solid #E0E4F0", borderRadius: "10px", fontSize: "0.88rem", outline: "none", width: "100%", background: "#FAFBFF" }}
                    value={whForm.method || "POST"} onChange={(e) => onSetWhForm({ ...whForm, method: e.target.value })}>
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                    <option value="PUT">PUT</option>
                  </select>
                ) : (
                  <input style={{ padding: "9px 12px", border: "1.5px solid #E0E4F0", borderRadius: "10px", fontSize: "0.88rem", outline: "none", width: "100%", boxSizing: "border-box" as const, background: "#FAFBFF" }}
                    type={f.type} placeholder={f.placeholder}
                    value={(whForm as Record<string, string>)[f.key] || ""}
                    onChange={(e) => onSetWhForm({ ...whForm, [f.key]: e.target.value })} />
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: "14px" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8B92B8", textTransform: "uppercase" as const, letterSpacing: "0.04em", display: "block", marginBottom: "8px" }}>События</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["lead.created", "message.received", "session.started"].map((ev) => {
                const checked = (whForm.events || []).includes(ev);
                return (
                  <label key={ev} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "7px 12px", border: `1.5px solid ${checked ? "#7B61FF44" : "#E0E4F0"}`, borderRadius: "9px", background: checked ? "rgba(123,97,255,0.06)" : "#fff", cursor: "pointer", fontSize: "0.82rem" }}>
                    <input type="checkbox" checked={checked} style={{ accentColor: "#7B61FF" }}
                      onChange={(e) => {
                        const cur = whForm.events || [];
                        onSetWhForm({ ...whForm, events: e.target.checked ? [...cur, ev] : cur.filter((x) => x !== ev) });
                      }} />
                    <code style={{ color: checked ? "#7B61FF" : "#4A5280" }}>{ev}</code>
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: "14px", background: "#0A0E27", borderRadius: "10px", padding: "12px 14px", fontFamily: "monospace", fontSize: "0.75rem", color: "#00D4AA", lineHeight: 1.6 }}>
            <div style={{ color: "#8B92B8", marginBottom: "6px", fontSize: "0.7rem" }}>Пример payload (POST):</div>
            {`{\n  "event": "lead.created",\n  "bot_id": ${selectedBotId || "N"},\n  "data": {\n    "email": "user@example.com",\n    "name": "Иван"\n  }\n}`}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "16px", justifyContent: "flex-end" }}>
            <button style={{ background: "#F4F6FF", border: "1.5px solid #E0E4F0", borderRadius: "10px", padding: "9px 18px", fontSize: "0.85rem", fontWeight: 600, color: "#4A5280", cursor: "pointer" }} onClick={() => onSetWhForm(null)}>Отмена</button>
            <button style={{ background: whSaving ? "#E0E4F0" : "linear-gradient(135deg,#7B61FF,#0077FF)", color: "#fff", border: "none", borderRadius: "10px", padding: "9px 22px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
              disabled={whSaving || !whForm.url?.trim()} onClick={onSaveWebhook}>
              {whSaving ? "Сохраняю..." : "Сохранить webhook"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={s.empty}>Загружаю...</div>
      ) : webhooks.length === 0 && !whForm ? (
        <div style={s.emptyBox}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔗</div>
          <h3 style={s.emptyTitle}>Webhook-интеграций пока нет</h3>
          <p style={s.emptySub}>Подключите свой сервис — бот будет отправлять данные при каждом новом лиде</p>
          <button style={s.createBtn} onClick={() => onSetWhForm({ name: "", url: "", method: "POST", secret: "", events: ["lead.created"], active: true })}>+ Добавить первый webhook</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {webhooks.map((wh) => (
            <div key={wh.id} style={{ background: "#fff", borderRadius: "16px", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: `1.5px solid ${wh.active ? "rgba(123,97,255,0.15)" : "#E0E4F0"}`, display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: wh.active ? "rgba(123,97,255,0.1)" : "#F4F6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>🔗</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "#0A0E27", fontSize: "0.9rem" }}>{wh.name}</div>
                <div style={{ fontSize: "0.78rem", color: "#8B92B8", display: "flex", alignItems: "center", gap: "8px", marginTop: "3px", flexWrap: "wrap" }}>
                  <code style={{ background: "#F4F6FF", borderRadius: "5px", padding: "2px 6px", color: "#7B61FF", fontSize: "0.73rem" }}>{wh.method}</code>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "280px" }}>{wh.url}</span>
                </div>
                <div style={{ display: "flex", gap: "5px", marginTop: "6px", flexWrap: "wrap" }}>
                  {wh.events.map((ev) => <code key={ev} style={{ fontSize: "0.68rem", background: "rgba(123,97,255,0.08)", color: "#7B61FF", borderRadius: "5px", padding: "2px 6px" }}>{ev}</code>)}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                <button onClick={() => onToggleWebhook(wh)}
                  style={{ padding: "7px 14px", borderRadius: "9px", border: "1.5px solid #E0E4F0", background: wh.active ? "rgba(0,212,170,0.1)" : "#F4F6FF", color: wh.active ? "#00A884" : "#8B92B8", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                  {wh.active ? "● Активен" : "○ Выкл"}
                </button>
                <button onClick={() => onSetWhForm({ ...wh })}
                  style={{ padding: "7px 12px", borderRadius: "9px", border: "1.5px solid #E0E4F0", background: "#F4F6FF", color: "#4A5280", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                  ✏️ Изменить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
