import { useState, useEffect } from "react";
import { api } from "@/api";

interface Bot {
  id: number;
  name: string;
  description: string;
  status: string;
  dialogs_count: number;
  created_at: string;
}
interface Lead {
  id: number; email: string; name: string; phone: string; created_at: string;
}
interface Webhook {
  id: number; name: string; url: string; method: string;
  secret: string; events: string[]; active: boolean; created_at: string;
}

interface Props {
  user: { id: number; email: string; name: string };
  onLogout: () => void;
  onOpenBot: (id: number) => void;
  onGoHome: () => void;
}

type Tab = "bots" | "leads" | "webhooks";

export default function Dashboard({ user, onLogout, onOpenBot, onGoHome }: Props) {
  const [tab, setTab] = useState<Tab>("bots");
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  // Leads
  const [selectedBotForLeads, setSelectedBotForLeads] = useState<number | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  // Webhooks
  const [selectedBotForWh, setSelectedBotForWh] = useState<number | null>(null);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [whLoading, setWhLoading] = useState(false);
  const [whForm, setWhForm] = useState<Partial<Webhook> | null>(null);
  const [whSaving, setWhSaving] = useState(false);

  useEffect(() => {
    api.getBots().then((d) => { setBots(d.bots); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const createBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const d = await api.createBot(newName.trim(), newDesc.trim());
      setBots((prev) => [d.bot, ...prev]);
      setShowCreate(false);
      setNewName("");
      setNewDesc("");
      onOpenBot(d.bot.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setCreating(false);
    }
  };

  const loadLeads = async (botId: number) => {
    setSelectedBotForLeads(botId);
    setLeadsLoading(true);
    setTab("leads");
    try {
      const d = await api.getLeads(botId);
      setLeads(d.leads);
    } finally {
      setLeadsLoading(false);
    }
  };

  const loadWebhooks = async (botId: number) => {
    setSelectedBotForWh(botId);
    setWhLoading(true);
    setWhForm(null);
    setTab("webhooks");
    try {
      const d = await api.getWebhooks(botId);
      setWebhooks(d.webhooks);
    } finally {
      setWhLoading(false);
    }
  };

  const saveWebhook = async () => {
    if (!whForm || !selectedBotForWh) return;
    setWhSaving(true);
    try {
      await api.saveWebhook(selectedBotForWh, whForm);
      const d = await api.getWebhooks(selectedBotForWh);
      setWebhooks(d.webhooks);
      setWhForm(null);
    } finally {
      setWhSaving(false);
    }
  };

  const toggleWebhook = async (wh: Webhook) => {
    await api.toggleWebhook(wh.id, !wh.active);
    setWebhooks((prev) => prev.map((w) => w.id === wh.id ? { ...w, active: !w.active } : w));
  };

  const logout = async () => {
    await api.logout().catch(() => {});
    localStorage.removeItem("bf_token");
    onLogout();
  };

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <div style={s.logoIcon}>⚡</div>
          <span style={s.logoText}>BotFlow</span>
        </div>
        <nav style={s.nav}>
          <div style={{ ...s.navItem, ...(tab === "bots" ? s.navActive : {}) }} onClick={() => setTab("bots")}>🤖 Мои боты</div>
          <div style={{ ...s.navItem, ...(tab === "leads" ? s.navActive : {}) }} onClick={() => { if (bots.length > 0) loadLeads(selectedBotForLeads ?? bots[0].id); }}>📧 Лиды</div>
          <div style={{ ...s.navItem, ...(tab === "webhooks" ? s.navActive : {}) }} onClick={() => { if (bots.length > 0) loadWebhooks(selectedBotForWh ?? bots[0].id); }}>🔗 Webhook</div>
          <div style={s.navItem}>📊 Аналитика</div>
          <div style={s.navItem}>⚙️ Настройки</div>
          <div style={s.navDivider} />
          <div style={s.navItem} onClick={onGoHome}>🏠 На главную</div>
        </nav>
        <div style={s.sidebarBottom}>
          <div style={s.userInfo}>
            <div style={s.avatar}>{user.name[0].toUpperCase()}</div>
            <div>
              <div style={s.userName}>{user.name}</div>
              <div style={s.userEmail}>{user.email}</div>
            </div>
          </div>
          <button style={s.logoutBtn} onClick={logout}>Выйти</button>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        {tab === "bots" && (<>
          <div style={s.header}>
            <div>
              <h1 style={s.pageTitle}>Мои боты</h1>
              <p style={s.pageSubtitle}>Управляйте и настраивайте своих чат-ботов</p>
            </div>
            <button style={s.createBtn} onClick={() => setShowCreate(true)}>+ Создать бота</button>
          </div>

          {/* Stats */}
          <div style={s.stats}>
            {[
              { icon: "🤖", label: "Всего ботов", value: bots.length },
              { icon: "✅", label: "Активных", value: bots.filter((b) => b.status === "active").length },
              { icon: "💬", label: "Диалогов сегодня", value: 0 },
              { icon: "⚡", label: "Uptime", value: "98%" },
            ].map((st) => (
              <div key={st.label} style={s.statCard}>
                <div style={s.statIcon}>{st.icon}</div>
                <div style={s.statValue}>{st.value}</div>
                <div style={s.statLabel}>{st.label}</div>
              </div>
            ))}
          </div>

          {/* Bots grid */}
          {loading ? (
            <div style={s.empty}>Загружаю ботов...</div>
          ) : bots.length === 0 ? (
            <div style={s.emptyBox}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🤖</div>
              <h3 style={s.emptyTitle}>Ботов пока нет</h3>
              <p style={s.emptySub}>Создайте первого бота и начните автоматизировать общение с клиентами</p>
              <button style={s.createBtn} onClick={() => setShowCreate(true)}>+ Создать первого бота</button>
            </div>
          ) : (
            <div style={s.botsGrid}>
              {bots.map((bot) => (
                <div key={bot.id} style={s.botCard}>
                  <div style={s.botCardTop}>
                    <div style={s.botIcon}>🤖</div>
                    <span style={{ ...s.statusBadge, ...(bot.status === "active" ? s.statusActive : s.statusInactive) }}>
                      {bot.status === "active" ? "Активен" : "Неактивен"}
                    </span>
                  </div>
                  <h3 style={s.botName}>{bot.name}</h3>
                  <p style={s.botDesc}>{bot.description || "Нет описания"}</p>
                  <div style={s.botMeta}>
                    <span>💬 {bot.dialogs_count} диалогов</span>
                    <span>{new Date(bot.created_at).toLocaleDateString("ru")}</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <button style={{ ...s.editBtn, flex: 1 }} onClick={() => onOpenBot(bot.id)}>Конструктор →</button>
                    <button style={{ background: "rgba(224,64,251,0.1)", border: "1px solid rgba(224,64,251,0.25)", color: "#C026D3", borderRadius: "10px", padding: "10px 10px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }} onClick={() => loadLeads(bot.id)}>📧 Лиды</button>
                    <button style={{ background: "rgba(123,97,255,0.1)", border: "1px solid rgba(123,97,255,0.25)", color: "#7B61FF", borderRadius: "10px", padding: "10px 10px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }} onClick={() => loadWebhooks(bot.id)}>🔗</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>)}

        {tab === "leads" && (<>
          <div style={s.header}>
            <div>
              <h1 style={s.pageTitle}>📧 Лиды</h1>
              <p style={s.pageSubtitle}>
                Бот: <strong>{bots.find((b) => b.id === selectedBotForLeads)?.name ?? "—"}</strong>
                {" · "}
                <button style={{ background: "none", border: "none", color: "#0077FF", cursor: "pointer", fontSize: "0.88rem", padding: 0 }} onClick={() => setTab("bots")}>← Назад к ботам</button>
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {bots.map((b) => (
                <button key={b.id}
                  style={{ background: b.id === selectedBotForLeads ? "linear-gradient(135deg,#E040FB,#7B61FF)" : "#F4F6FF", color: b.id === selectedBotForLeads ? "#fff" : "#4A5280", border: "1.5px solid #E0E4F0", borderRadius: "10px", padding: "8px 14px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
                  onClick={() => loadLeads(b.id)}>{b.name}</button>
              ))}
            </div>
          </div>

          {leadsLoading ? (
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
        </>)}

        {/* ── WEBHOOKS TAB ── */}
        {tab === "webhooks" && (<>
          <div style={s.header}>
            <div>
              <h1 style={s.pageTitle}>🔗 Webhook-интеграции</h1>
              <p style={s.pageSubtitle}>
                Бот: <strong>{bots.find((b) => b.id === selectedBotForWh)?.name ?? "—"}</strong>
                {" · "}
                <button style={{ background: "none", border: "none", color: "#0077FF", cursor: "pointer", fontSize: "0.88rem", padding: 0 }} onClick={() => setTab("bots")}>← Назад к ботам</button>
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {bots.map((b) => (
                <button key={b.id}
                  style={{ background: b.id === selectedBotForWh ? "linear-gradient(135deg,#7B61FF,#0077FF)" : "#F4F6FF", color: b.id === selectedBotForWh ? "#fff" : "#4A5280", border: "1.5px solid #E0E4F0", borderRadius: "10px", padding: "8px 14px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
                  onClick={() => loadWebhooks(b.id)}>{b.name}</button>
              ))}
              <button style={{ background: "linear-gradient(135deg,#7B61FF,#0077FF)", color: "#fff", border: "none", borderRadius: "10px", padding: "8px 16px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
                onClick={() => setWhForm({ name: "", url: "", method: "POST", secret: "", events: ["lead.created"], active: true })}>
                + Добавить webhook
              </button>
            </div>
          </div>

          {/* Форма создания/редактирования */}
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
                        value={whForm.method || "POST"} onChange={(e) => setWhForm({ ...whForm, method: e.target.value })}>
                        <option value="POST">POST</option>
                        <option value="GET">GET</option>
                        <option value="PUT">PUT</option>
                      </select>
                    ) : (
                      <input style={{ padding: "9px 12px", border: "1.5px solid #E0E4F0", borderRadius: "10px", fontSize: "0.88rem", outline: "none", width: "100%", boxSizing: "border-box" as const, background: "#FAFBFF" }}
                        type={f.type} placeholder={f.placeholder}
                        value={(whForm as Record<string, string>)[f.key] || ""}
                        onChange={(e) => setWhForm({ ...whForm, [f.key]: e.target.value })} />
                    )}
                  </div>
                ))}
              </div>

              {/* События */}
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
                            setWhForm({ ...whForm, events: e.target.checked ? [...cur, ev] : cur.filter((x) => x !== ev) });
                          }} />
                        <code style={{ color: checked ? "#7B61FF" : "#4A5280" }}>{ev}</code>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Пример payload */}
              <div style={{ marginTop: "14px", background: "#0A0E27", borderRadius: "10px", padding: "12px 14px", fontFamily: "monospace", fontSize: "0.75rem", color: "#00D4AA", lineHeight: 1.6 }}>
                <div style={{ color: "#8B92B8", marginBottom: "6px", fontSize: "0.7rem" }}>Пример payload (POST):</div>
                {`{\n  "event": "lead.created",\n  "bot_id": ${selectedBotForWh || "N"},\n  "data": {\n    "email": "user@example.com",\n    "name": "Иван"\n  }\n}`}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "16px", justifyContent: "flex-end" }}>
                <button style={{ background: "#F4F6FF", border: "1.5px solid #E0E4F0", borderRadius: "10px", padding: "9px 18px", fontSize: "0.85rem", fontWeight: 600, color: "#4A5280", cursor: "pointer" }} onClick={() => setWhForm(null)}>Отмена</button>
                <button style={{ background: whSaving ? "#E0E4F0" : "linear-gradient(135deg,#7B61FF,#0077FF)", color: "#fff", border: "none", borderRadius: "10px", padding: "9px 22px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
                  disabled={whSaving || !whForm.url?.trim()} onClick={saveWebhook}>
                  {whSaving ? "Сохраняю..." : "Сохранить webhook"}
                </button>
              </div>
            </div>
          )}

          {/* Список webhooks */}
          {whLoading ? (
            <div style={s.empty}>Загружаю...</div>
          ) : webhooks.length === 0 && !whForm ? (
            <div style={s.emptyBox}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔗</div>
              <h3 style={s.emptyTitle}>Webhook-интеграций пока нет</h3>
              <p style={s.emptySub}>Подключите свой сервис — бот будет отправлять данные при каждом новом лиде</p>
              <button style={s.createBtn} onClick={() => setWhForm({ name: "", url: "", method: "POST", secret: "", events: ["lead.created"], active: true })}>+ Добавить первый webhook</button>
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
                    <button
                      onClick={() => toggleWebhook(wh)}
                      style={{ padding: "7px 14px", borderRadius: "9px", border: "1.5px solid #E0E4F0", background: wh.active ? "rgba(0,212,170,0.1)" : "#F4F6FF", color: wh.active ? "#00A884" : "#8B92B8", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                      {wh.active ? "● Активен" : "○ Выкл"}
                    </button>
                    <button onClick={() => setWhForm({ ...wh })}
                      style={{ padding: "7px 12px", borderRadius: "9px", border: "1.5px solid #E0E4F0", background: "#F4F6FF", color: "#4A5280", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                      ✏️ Изменить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>)}
      </main>

      {/* Modal create */}
      {showCreate && (
        <div style={s.overlay} onClick={() => setShowCreate(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={s.modalTitle}>Новый бот</h2>
            <form onSubmit={createBot} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>Название бота *</label>
                <input style={s.input} placeholder="Например: Бот поддержки" value={newName} onChange={(e) => setNewName(e.target.value)} required autoFocus />
              </div>
              <div style={s.field}>
                <label style={s.label}>Описание</label>
                <input style={s.input} placeholder="Для чего этот бот?" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
              </div>
              {error && <div style={s.error}>{error}</div>}
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={() => setShowCreate(false)}>Отмена</button>
                <button type="submit" style={{ ...s.createBtn, opacity: creating ? 0.7 : 1 }} disabled={creating}>
                  {creating ? "Создаю..." : "Создать и открыть →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { display: "flex", minHeight: "100vh", background: "#F4F6FF", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  sidebar: { width: "240px", background: "#0A0E27", display: "flex", flexDirection: "column", padding: "24px 16px", flexShrink: 0 },
  sidebarLogo: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "36px", padding: "0 8px" },
  logoIcon: { width: "32px", height: "32px", background: "linear-gradient(135deg,#0077FF,#7B61FF)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1rem" },
  logoText: { fontSize: "1.2rem", fontWeight: 800, color: "#fff" },
  nav: { display: "flex", flexDirection: "column", gap: "4px", flex: 1 },
  navItem: { padding: "10px 12px", borderRadius: "10px", color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s" },
  navActive: { background: "rgba(255,255,255,0.1)", color: "#fff" },
  navDivider: { height: "1px", background: "rgba(255,255,255,0.08)", margin: "8px 0" },
  sidebarBottom: { borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" },
  userInfo: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#0077FF,#7B61FF)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.95rem", flexShrink: 0 },
  userName: { color: "#fff", fontSize: "0.85rem", fontWeight: 600 },
  userEmail: { color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" },
  logoutBtn: { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.5)", padding: "8px", fontSize: "0.8rem", cursor: "pointer" },
  main: { flex: 1, padding: "32px", overflowY: "auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" },
  pageTitle: { fontSize: "1.75rem", fontWeight: 800, color: "#0A0E27", marginBottom: "4px" },
  pageSubtitle: { color: "#8B92B8", fontSize: "0.9rem" },
  createBtn: { background: "linear-gradient(135deg,#0077FF,#7B61FF)", color: "#fff", border: "none", borderRadius: "12px", padding: "12px 20px", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  stats: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "28px" },
  statCard: { background: "#fff", borderRadius: "16px", padding: "20px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  statIcon: { fontSize: "1.5rem", marginBottom: "8px" },
  statValue: { fontSize: "1.75rem", fontWeight: 800, color: "#0A0E27", lineHeight: 1 },
  statLabel: { fontSize: "0.78rem", color: "#8B92B8", marginTop: "4px" },
  botsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "20px" },
  botCard: { background: "#fff", borderRadius: "20px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "12px" },
  botCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  botIcon: { fontSize: "2rem" },
  statusBadge: { fontSize: "0.75rem", fontWeight: 700, padding: "4px 10px", borderRadius: "100px" },
  statusActive: { background: "rgba(0,212,170,0.12)", color: "#00A884" },
  statusInactive: { background: "rgba(139,146,184,0.12)", color: "#8B92B8" },
  botName: { fontSize: "1.1rem", fontWeight: 700, color: "#0A0E27" },
  botDesc: { fontSize: "0.85rem", color: "#8B92B8", flexGrow: 1 },
  botMeta: { display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#C8CEE0" },
  editBtn: { background: "linear-gradient(135deg,#0077FF,#7B61FF)", color: "#fff", border: "none", borderRadius: "10px", padding: "10px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" },
  empty: { color: "#8B92B8", textAlign: "center", padding: "60px" },
  emptyBox: { background: "#fff", borderRadius: "20px", padding: "60px 40px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  emptyTitle: { fontSize: "1.3rem", fontWeight: 700, color: "#0A0E27", marginBottom: "8px" },
  emptySub: { color: "#8B92B8", fontSize: "0.95rem", marginBottom: "24px" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "24px" },
  modal: { background: "#fff", borderRadius: "20px", padding: "36px", width: "100%", maxWidth: "460px", boxShadow: "0 30px 60px rgba(0,0,0,0.15)" },
  modalTitle: { fontSize: "1.4rem", fontWeight: 800, color: "#0A0E27", marginBottom: "24px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.85rem", fontWeight: 600, color: "#4A5280" },
  input: { padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #E0E4F0", fontSize: "0.95rem", outline: "none", color: "#0A0E27" },
  error: { background: "#fff0f0", border: "1px solid #ffd0d0", borderRadius: "10px", padding: "10px 14px", color: "#d63031", fontSize: "0.875rem" },
  modalActions: { display: "flex", gap: "12px", justifyContent: "flex-end" },
  cancelBtn: { background: "#F4F6FF", border: "none", borderRadius: "12px", padding: "12px 20px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", color: "#4A5280" },
};