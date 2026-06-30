import { Bot, VkStatus, s } from "./types";
import { VK_BOT_URL } from "@/api";

interface Props {
  bots: Bot[];
  vkStatus: VkStatus | null;
  vkLoading: boolean;
  vkForm: { accessToken: string; groupId: string; secretKey: string };
  vkSaving: boolean;
  vkError: string;
  selectedBotId: number | null;
  onLoadVkStatus: (id: number) => void;
  onBack: () => void;
  onSetVkForm: (v: { accessToken: string; groupId: string; secretKey: string }) => void;
  onConnectVk: () => void;
  onToggleVk: () => void;
}

export default function VkTab({
  bots, vkStatus, vkLoading, vkForm, vkSaving, vkError, selectedBotId,
  onLoadVkStatus, onBack, onSetVkForm, onConnectVk, onToggleVk,
}: Props) {
  return (
    <>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>💙 ВКонтакте</h1>
          <p style={s.pageSubtitle}>
            Бот: <strong>{bots.find((b) => b.id === selectedBotId)?.name ?? "—"}</strong>
            {" · "}
            <button style={{ background: "none", border: "none", color: "#0077FF", cursor: "pointer", fontSize: "0.88rem", padding: 0 }} onClick={onBack}>← Назад</button>
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {bots.map((b) => (
            <button key={b.id}
              style={{ background: b.id === selectedBotId ? "linear-gradient(135deg,#0077FF,#00A8FF)" : "#F4F6FF", color: b.id === selectedBotId ? "#fff" : "#4A5280", border: "1.5px solid #E0E4F0", borderRadius: "10px", padding: "8px 14px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
              onClick={() => onLoadVkStatus(b.id)}>{b.name}</button>
          ))}
        </div>
      </div>

      {vkLoading ? (
        <div style={s.empty}>Загружаю...</div>
      ) : (<>

        {vkStatus?.connected ? (
          <div style={{ background: "#fff", borderRadius: "20px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1.5px solid rgba(0,119,255,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg,#0077FF,#00A8FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>💙</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#0A0E27", fontSize: "1rem" }}>{vkStatus.group_name || `Группа #${vkStatus.group_id}`}</div>
                <div style={{ fontSize: "0.8rem", color: vkStatus.active ? "#00A884" : "#8B92B8", fontWeight: 600 }}>
                  {vkStatus.active ? "● Активна" : "○ Отключена"} · ID {vkStatus.group_id}
                </div>
              </div>
              <button onClick={onToggleVk}
                style={{ padding: "8px 16px", borderRadius: "10px", border: "1.5px solid #E0E4F0", background: vkStatus.active ? "#fff0f0" : "#f0fff8", color: vkStatus.active ? "#d63031" : "#00A884", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
                {vkStatus.active ? "Отключить" : "Включить"}
              </button>
            </div>

            <div style={{ background: "#F8F9FF", borderRadius: "14px", padding: "18px 20px" }}>
              <div style={{ fontWeight: 700, color: "#0A0E27", fontSize: "0.9rem", marginBottom: "14px" }}>📋 Настройка Callback API в ВКонтакте</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { n: 1, text: "Открой свою группу ВК → Управление → Работа с API → Callback API" },
                  { n: 2, text: "Версия API: 5.131" },
                  { n: 3, label: "URL сервера:", code: VK_BOT_URL },
                  { n: 4, label: "Строка подтверждения:", code: vkStatus.confirm_code || "—" },
                  { n: 5, text: 'Нажми "Подтвердить". После подтверждения включи событие "Входящее сообщение"' },
                ].map((step) => (
                  <div key={step.n} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#0077FF", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 800, flexShrink: 0, marginTop: "1px" }}>{step.n}</div>
                    <div style={{ fontSize: "0.84rem", color: "#4A5280", lineHeight: 1.5, flex: 1 }}>
                      {step.text && <span>{step.text}</span>}
                      {step.label && <span style={{ color: "#8B92B8" }}>{step.label} </span>}
                      {step.code && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <code style={{ background: "#0A0E27", color: "#00D4AA", padding: "6px 12px", borderRadius: "8px", fontSize: "0.78rem", flex: 1, wordBreak: "break-all" }}>{step.code}</code>
                          <button onClick={() => navigator.clipboard.writeText(step.code!)}
                            style={{ background: "#F4F6FF", border: "1.5px solid #E0E4F0", borderRadius: "8px", padding: "6px 10px", fontSize: "0.75rem", cursor: "pointer", flexShrink: 0, color: "#4A5280", fontWeight: 600 }}>Копировать</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {vkStatus.secret_key && (
                <div style={{ marginTop: "14px", padding: "10px 14px", background: "rgba(255,184,0,0.08)", borderRadius: "10px", fontSize: "0.78rem", color: "#8B92B8" }}>
                  🔑 Секретный ключ настроен — укажи его в поле «Секретный ключ» в настройках Callback API ВК
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1.5px solid #E0E4F0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg,#0077FF,#00A8FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>💙</div>
              <div>
                <div style={{ fontWeight: 700, color: "#0A0E27", fontSize: "1rem" }}>Подключить ВКонтакте</div>
                <div style={{ fontSize: "0.8rem", color: "#8B92B8" }}>Бот будет отвечать на сообщения в вашем сообществе ВК</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8B92B8", textTransform: "uppercase" as const, letterSpacing: "0.04em", display: "block", marginBottom: "6px" }}>
                  Токен сообщества (Ключ доступа)
                </label>
                <input
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E0E4F0", borderRadius: "10px", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" as const, background: "#FAFBFF" }}
                  placeholder="vk1.a.xxxxxx..."
                  value={vkForm.accessToken}
                  onChange={(e) => onSetVkForm({ ...vkForm, accessToken: e.target.value })}
                />
                <div style={{ fontSize: "0.72rem", color: "#8B92B8", marginTop: "4px" }}>Управление → Работа с API → Ключи доступа → Создать ключ</div>
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8B92B8", textTransform: "uppercase" as const, letterSpacing: "0.04em", display: "block", marginBottom: "6px" }}>
                  ID сообщества
                </label>
                <input
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E0E4F0", borderRadius: "10px", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" as const, background: "#FAFBFF" }}
                  placeholder="123456789"
                  type="number"
                  value={vkForm.groupId}
                  onChange={(e) => onSetVkForm({ ...vkForm, groupId: e.target.value })}
                />
                <div style={{ fontSize: "0.72rem", color: "#8B92B8", marginTop: "4px" }}>Найди в адресной строке: vk.com/club<strong>123456789</strong></div>
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8B92B8", textTransform: "uppercase" as const, letterSpacing: "0.04em", display: "block", marginBottom: "6px" }}>
                  Секретный ключ (необязательно)
                </label>
                <input
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E0E4F0", borderRadius: "10px", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" as const, background: "#FAFBFF" }}
                  placeholder="Для дополнительной защиты"
                  type="password"
                  value={vkForm.secretKey}
                  onChange={(e) => onSetVkForm({ ...vkForm, secretKey: e.target.value })}
                />
              </div>

              {vkError && <div style={{ padding: "10px 14px", background: "#fff0f0", borderRadius: "10px", color: "#d63031", fontSize: "0.84rem" }}>⚠️ {vkError}</div>}

              <button onClick={onConnectVk} disabled={vkSaving || !vkForm.accessToken || !vkForm.groupId}
                style={{ background: vkSaving || !vkForm.accessToken || !vkForm.groupId ? "#E0E4F0" : "linear-gradient(135deg,#0077FF,#00A8FF)", color: "#fff", border: "none", borderRadius: "12px", padding: "12px", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}>
                {vkSaving ? "Подключаю..." : "💙 Подключить сообщество"}
              </button>
            </div>
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginTop: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ fontWeight: 700, color: "#0A0E27", fontSize: "0.88rem", marginBottom: "12px" }}>Как работает интеграция с ВК</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              ["💬", "Пользователь пишет сообщение в группу ВКонтакте"],
              ["🤖", "Бот обрабатывает его по сценарию из конструктора"],
              ["📧", "Если в сценарии есть узел «Сбор email» — данные сохраняются в лиды"],
              ["⚡", "Action-узел отправляет webhook на ваш сервер"],
              ["🔄", "AI-узел подключает GPT для свободного диалога"],
            ].map(([icon, text]) => (
              <div key={text as string} style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "0.84rem", color: "#4A5280" }}>
                <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                <span>{text as string}</span>
              </div>
            ))}
          </div>
        </div>
      </>)}
    </>
  );
}
