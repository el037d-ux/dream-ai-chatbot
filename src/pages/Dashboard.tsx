import { useState, useEffect } from "react";
import { api } from "@/api";
import { Bot, Lead, Webhook, VkStatus, Landing, Tab, s } from "./dashboard/types";
import BotsTab from "./dashboard/BotsTab";
import LeadsTab from "./dashboard/LeadsTab";
import WebhooksTab from "./dashboard/WebhooksTab";
import VkTab from "./dashboard/VkTab";
import LandingsTab from "./dashboard/LandingsTab";

interface Props {
  user: { id: number; email: string; name: string };
  onLogout: () => void;
  onOpenBot: (id: number) => void;
  onOpenLanding: (id: number) => void;
  onGoHome: () => void;
}

export default function Dashboard({ user, onLogout, onOpenBot, onOpenLanding, onGoHome }: Props) {
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
  // VK
  const [selectedBotForVk, setSelectedBotForVk] = useState<number | null>(null);
  const [vkStatus, setVkStatus] = useState<VkStatus | null>(null);
  const [vkLoading, setVkLoading] = useState(false);
  const [vkForm, setVkForm] = useState({ accessToken: "", groupId: "", secretKey: "", confirmCode: "" });
  const [vkSaving, setVkSaving] = useState(false);
  const [vkError, setVkError] = useState("");
  // Landings
  const [landings, setLandings] = useState<Landing[]>([]);
  const [landingsLoading, setLandingsLoading] = useState(false);
  const [landingCreating, setLandingCreating] = useState(false);

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

  const loadVkStatus = async (botId: number) => {
    setSelectedBotForVk(botId);
    setVkLoading(true);
    setVkError("");
    setTab("vk");
    try {
      const d = await api.vkStatus(botId);
      setVkStatus(d);
    } finally {
      setVkLoading(false);
    }
  };

  const connectVk = async () => {
    if (!selectedBotForVk) return;
    if (!vkForm.accessToken || !vkForm.groupId) { setVkError("Заполните токен и ID группы"); return; }
    if (!vkForm.confirmCode) { setVkError("Укажите строку подтверждения из настроек ВК"); return; }
    setVkSaving(true);
    setVkError("");
    try {
      const gid = parseInt(vkForm.groupId);
      const d = await api.vkConnect(selectedBotForVk, vkForm.accessToken, gid, vkForm.secretKey, vkForm.confirmCode.trim());
      setVkStatus({ connected: true, group_id: gid, confirm_code: d.confirm_code, group_name: d.group_name, secret_key: vkForm.secretKey, active: true });
      setVkForm({ accessToken: "", groupId: "", secretKey: "", confirmCode: "" });
    } catch (e: unknown) {
      setVkError(e instanceof Error ? e.message : "Ошибка подключения");
    } finally {
      setVkSaving(false);
    }
  };

  const setVkConfirm = async (code: string) => {
    if (!selectedBotForVk || !code.trim()) return;
    await api.vkSetConfirm(selectedBotForVk, code.trim());
    setVkStatus((st) => st ? { ...st, confirm_code: code.trim() } : st);
  };

  const toggleVk = async () => {
    if (!selectedBotForVk || !vkStatus) return;
    await api.vkToggle(selectedBotForVk, !vkStatus.active);
    setVkStatus((s) => s ? { ...s, active: !s.active } : s);
  };

  const loadLandings = async () => {
    setTab("landings");
    setLandingsLoading(true);
    try {
      const d = await api.getLandings();
      setLandings(d.landings);
    } finally {
      setLandingsLoading(false);
    }
  };

  const createLanding = async () => {
    setLandingCreating(true);
    try {
      const d = await api.createLanding("Мой лендинг", [], {});
      onOpenLanding(d.id);
    } finally {
      setLandingCreating(false);
    }
  };

  const deleteLanding = async (id: number) => {
    if (!confirm("Удалить лендинг?")) return;
    await api.deleteLanding(id);
    setLandings((prev) => prev.filter((l) => l.id !== id));
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
          <div style={{ ...s.navItem, ...(tab === "vk" ? s.navActive : {}) }} onClick={() => { if (bots.length > 0) loadVkStatus(selectedBotForVk ?? bots[0].id); }}>💙 ВКонтакте</div>
          <div style={{ ...s.navItem, ...(tab === "landings" ? s.navActive : {}) }} onClick={loadLandings}>🖼 Лендинги</div>
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
        {tab === "bots" && (
          <BotsTab
            bots={bots}
            loading={loading}
            showCreate={showCreate}
            newName={newName}
            newDesc={newDesc}
            creating={creating}
            error={error}
            onOpenBot={onOpenBot}
            onLoadLeads={loadLeads}
            onLoadWebhooks={loadWebhooks}
            onLoadVk={loadVkStatus}
            onShowCreate={setShowCreate}
            onSetNewName={setNewName}
            onSetNewDesc={setNewDesc}
            onCreateBot={createBot}
          />
        )}

        {tab === "leads" && (
          <LeadsTab
            bots={bots}
            leads={leads}
            loading={leadsLoading}
            selectedBotId={selectedBotForLeads}
            onLoadLeads={loadLeads}
            onBack={() => setTab("bots")}
          />
        )}

        {tab === "webhooks" && (
          <WebhooksTab
            bots={bots}
            webhooks={webhooks}
            loading={whLoading}
            selectedBotId={selectedBotForWh}
            whForm={whForm}
            whSaving={whSaving}
            onLoadWebhooks={loadWebhooks}
            onBack={() => setTab("bots")}
            onSetWhForm={setWhForm}
            onSaveWebhook={saveWebhook}
            onToggleWebhook={toggleWebhook}
          />
        )}

        {tab === "vk" && (
          <VkTab
            bots={bots}
            vkStatus={vkStatus}
            vkLoading={vkLoading}
            vkForm={vkForm}
            vkSaving={vkSaving}
            vkError={vkError}
            selectedBotId={selectedBotForVk}
            onLoadVkStatus={loadVkStatus}
            onBack={() => setTab("bots")}
            onSetVkForm={setVkForm}
            onConnectVk={connectVk}
            onToggleVk={toggleVk}
            onSetVkConfirm={setVkConfirm}
          />
        )}

        {tab === "landings" && (
          <LandingsTab
            landings={landings}
            loading={landingsLoading}
            creating={landingCreating}
            onCreate={createLanding}
            onOpen={onOpenLanding}
            onDelete={deleteLanding}
          />
        )}
      </main>
    </div>
  );
}