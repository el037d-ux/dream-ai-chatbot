import React from "react";

export interface Bot {
  id: number;
  name: string;
  description: string;
  status: string;
  dialogs_count: number;
  created_at: string;
}

export interface Lead {
  id: number; email: string; name: string; phone: string; created_at: string;
}

export interface Webhook {
  id: number; name: string; url: string; method: string;
  secret: string; events: string[]; active: boolean; created_at: string;
}

export interface VkStatus {
  connected: boolean;
  group_id?: number; group_name?: string;
  secret_key?: string; confirm_code?: string; active?: boolean;
}

export interface Landing {
  id: number; name: string; published: boolean; updated_at: string;
}

export type Tab = "bots" | "leads" | "webhooks" | "vk" | "landings";

export const s: Record<string, React.CSSProperties> = {
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