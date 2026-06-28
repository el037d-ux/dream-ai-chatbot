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

interface Props {
  user: { id: number; email: string; name: string };
  onLogout: () => void;
  onOpenBot: (id: number) => void;
}

export default function Dashboard({ user, onLogout, onOpenBot }: Props) {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

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
          <div style={{ ...s.navItem, ...s.navActive }}>🤖 Мои боты</div>
          <div style={s.navItem}>📊 Аналитика</div>
          <div style={s.navItem}>🔗 Интеграции</div>
          <div style={s.navItem}>⚙️ Настройки</div>
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
                <button style={s.editBtn} onClick={() => onOpenBot(bot.id)}>
                  Открыть конструктор →
                </button>
              </div>
            ))}
          </div>
        )}
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
