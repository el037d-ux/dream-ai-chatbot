import React from "react";
import { Bot, s } from "./types";

interface Props {
  bots: Bot[];
  loading: boolean;
  showCreate: boolean;
  newName: string;
  newDesc: string;
  creating: boolean;
  error: string;
  onOpenBot: (id: number) => void;
  onLoadLeads: (id: number) => void;
  onLoadWebhooks: (id: number) => void;
  onLoadVk: (id: number) => void;
  onShowCreate: (v: boolean) => void;
  onSetNewName: (v: string) => void;
  onSetNewDesc: (v: string) => void;
  onCreateBot: (e: React.FormEvent) => void;
}

export default function BotsTab({
  bots, loading, showCreate, newName, newDesc, creating, error,
  onOpenBot, onLoadLeads, onLoadWebhooks, onLoadVk,
  onShowCreate, onSetNewName, onSetNewDesc, onCreateBot,
}: Props) {
  return (
    <>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>Мои боты</h1>
          <p style={s.pageSubtitle}>Управляйте и настраивайте своих чат-ботов</p>
        </div>
        <button style={s.createBtn} onClick={() => onShowCreate(true)}>+ Создать бота</button>
      </div>

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

      {loading ? (
        <div style={s.empty}>Загружаю ботов...</div>
      ) : bots.length === 0 ? (
        <div style={s.emptyBox}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🤖</div>
          <h3 style={s.emptyTitle}>Ботов пока нет</h3>
          <p style={s.emptySub}>Создайте первого бота и начните автоматизировать общение с клиентами</p>
          <button style={s.createBtn} onClick={() => onShowCreate(true)}>+ Создать первого бота</button>
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
                <button style={{ background: "rgba(224,64,251,0.1)", border: "1px solid rgba(224,64,251,0.25)", color: "#C026D3", borderRadius: "10px", padding: "10px 10px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }} onClick={() => onLoadLeads(bot.id)}>📧 Лиды</button>
                <button style={{ background: "rgba(123,97,255,0.1)", border: "1px solid rgba(123,97,255,0.25)", color: "#7B61FF", borderRadius: "10px", padding: "10px 10px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }} onClick={() => onLoadWebhooks(bot.id)}>🔗</button>
                <button style={{ background: "rgba(0,119,255,0.1)", border: "1px solid rgba(0,119,255,0.25)", color: "#0077FF", borderRadius: "10px", padding: "10px 10px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }} onClick={() => onLoadVk(bot.id)}>💙</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div style={s.overlay} onClick={() => onShowCreate(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={s.modalTitle}>Новый бот</h2>
            <form onSubmit={onCreateBot} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>Название бота *</label>
                <input style={s.input} placeholder="Например: Бот поддержки" value={newName} onChange={(e) => onSetNewName(e.target.value)} required autoFocus />
              </div>
              <div style={s.field}>
                <label style={s.label}>Описание</label>
                <input style={s.input} placeholder="Для чего этот бот?" value={newDesc} onChange={(e) => onSetNewDesc(e.target.value)} />
              </div>
              {error && <div style={s.error}>{error}</div>}
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={() => onShowCreate(false)}>Отмена</button>
                <button type="submit" style={{ ...s.createBtn, opacity: creating ? 0.7 : 1 }} disabled={creating}>
                  {creating ? "Создаю..." : "Создать и открыть →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
