import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/api";

// ─── Types ────────────────────────────────────────────────────────
interface Node {
  id: string;
  type: "trigger" | "message" | "condition" | "action" | "ai" | "email";
  label: string;
  message: string;
  x: number;
  y: number;
}
interface Edge { id: string; source: string; target: string; }
interface Prompt {
  persona: string; goal: string; context: string;
  instructions: string; constraints: string; examples: string;
}
interface BotInfo {
  id: number; name: string; description: string; status: string;
  prompt_persona: string; prompt_goal: string; prompt_context: string;
  prompt_instructions: string; prompt_constraints: string; prompt_examples: string;
}

const NODE_TYPES = [
  { type: "trigger",   label: "Триггер",    icon: "💬", color: "#00D4AA", bg: "rgba(0,212,170,0.1)" },
  { type: "message",   label: "Сообщение",  icon: "📤", color: "#0077FF", bg: "rgba(0,119,255,0.1)" },
  { type: "email",     label: "Сбор email", icon: "📧", color: "#E040FB", bg: "rgba(224,64,251,0.1)" },
  { type: "condition", label: "Условие",    icon: "🔀", color: "#FFB800", bg: "rgba(255,184,0,0.1)" },
  { type: "action",    label: "Действие",   icon: "⚡", color: "#7B61FF", bg: "rgba(123,97,255,0.1)" },
  { type: "ai",        label: "AI-ответ",   icon: "🤖", color: "#FF6B6B", bg: "rgba(255,107,107,0.1)" },
] as const;

function getNodeStyle(type: Node["type"]) {
  return NODE_TYPES.find((t) => t.type === type) ?? NODE_TYPES[1];
}

let idCounter = Date.now();
const uid = () => `node_${++idCounter}`;
const eid = () => `edge_${++idCounter}`;

// ─── Node Card ─────────────────────────────────────────────────────
function NodeCard({ node, selected, connecting, connectingActive, onSelect, onMove, onEdit, onStartConnect }: {
  node: Node; selected: boolean; connecting: boolean; connectingActive: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onEdit: (node: Node) => void;
  onStartConnect: (id: string) => void;
}) {
  const nStyle = getNodeStyle(node.type);
  const dragging = useRef(false);
  const moved = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    // Если режим соединения — просто выбираем этот узел как цель
    if (connectingActive) {
      e.stopPropagation();
      onSelect(node.id);
      return;
    }
    e.stopPropagation();
    moved.current = false;
    dragging.current = true;
    offset.current = { x: e.clientX - node.x, y: e.clientY - node.y };
    const startX = e.clientX, startY = e.clientY;
    const onMv = (ev: MouseEvent) => {
      if (dragging.current && (Math.abs(ev.clientX - startX) > 4 || Math.abs(ev.clientY - startY) > 4)) {
        moved.current = true;
        onMove(node.id, ev.clientX - offset.current.x, ev.clientY - offset.current.y);
      }
    };
    const onUp = () => {
      dragging.current = false;
      if (!moved.current) onSelect(node.id);
      window.removeEventListener("mousemove", onMv);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMv);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      style={{
        position: "absolute", left: node.x, top: node.y,
        background: "#fff",
        border: `2px solid ${selected ? nStyle.color : connectingActive && !connecting ? "#0077FF66" : "#E0E4F0"}`,
        borderRadius: "14px", padding: "14px 16px", minWidth: "170px",
        boxShadow: selected ? `0 0 0 4px ${nStyle.color}22, 0 8px 24px rgba(0,0,0,0.1)` : connectingActive && !connecting ? "0 0 0 3px rgba(0,119,255,0.15)" : "0 4px 12px rgba(0,0,0,0.08)",
        cursor: connectingActive ? "cell" : "grab", userSelect: "none", zIndex: selected ? 10 : 5,
        transition: "border-color 0.15s, box-shadow 0.15s",
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={(e) => { e.stopPropagation(); onEdit(node); }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: node.message ? "8px" : 0 }}>
        <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: nStyle.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
          {nStyle.icon}
        </div>
        <div>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: nStyle.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{nStyle.label}</div>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0A0E27" }}>{node.label}</div>
        </div>
      </div>
      {node.message && (
        <div style={{ fontSize: "0.78rem", color: "#8B92B8", background: "#F8F9FF", borderRadius: "8px", padding: "6px 10px", maxWidth: "210px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {node.message}
        </div>
      )}
      {/* Нижняя точка — начало соединения */}
      <div
        title="Кликни, затем кликни на другой узел"
        onClick={(e) => { e.stopPropagation(); onStartConnect(node.id); }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ position: "absolute", bottom: "-8px", left: "50%", transform: "translateX(-50%)", width: "16px", height: "16px", borderRadius: "50%", background: nStyle.color, border: "3px solid #fff", cursor: "crosshair", zIndex: 20, boxShadow: "0 0 0 2px " + nStyle.color + "55" }}
      />
      {/* Верхняя точка — вход */}
      <div
        onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ position: "absolute", top: "-8px", left: "50%", transform: "translateX(-50%)", width: "16px", height: "16px", borderRadius: "50%", background: connecting ? "#0077FF" : "#C8CEE0", border: "3px solid #fff", cursor: connecting ? "cell" : "default", zIndex: 20 }}
      />
    </div>
  );
}

// ─── Edges SVG ─────────────────────────────────────────────────────
function EdgesSVG({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  const map = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
      <defs>
        <marker id="arr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#0077FF" />
        </marker>
      </defs>
      {edges.map((e) => {
        const s = map[e.source], t = map[e.target];
        if (!s || !t) return null;
        const sx = s.x + 85, sy = s.y + 82, tx = t.x + 85, ty = t.y + 6, cy = (sy + ty) / 2;
        return <path key={e.id} d={`M${sx} ${sy} C${sx} ${cy},${tx} ${cy},${tx} ${ty}`} stroke="#0077FF" strokeWidth="2" fill="none" strokeDasharray="6 3" markerEnd="url(#arr)" />;
      })}
    </svg>
  );
}

// ─── Node Edit Panel ───────────────────────────────────────────────
function NodePanel({ node, onSave, onClose, onDelete }: {
  node: Node; onSave: (n: Node) => void; onClose: () => void; onDelete: (id: string) => void;
}) {
  const [label, setLabel] = useState(node.label);
  const [message, setMessage] = useState(node.message);
  const [type, setType] = useState(node.type);

  useEffect(() => { setLabel(node.label); setMessage(node.message); setType(node.type); }, [node.id]);

  const nStyle = getNodeStyle(type);

  return (
    <div style={p.panel}>
      <div style={{ ...p.panelHeader, borderBottom: `3px solid ${nStyle.color}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", background: nStyle.bg, borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center" }}>{nStyle.icon}</div>
          <span style={p.panelTitle}>Узел сценария</span>
        </div>
        <button style={p.closeBtn} onClick={onClose}>✕</button>
      </div>
      <div style={p.panelBody}>
        <Field label="Тип узла">
          <select style={p.select} value={type} onChange={(e) => setType(e.target.value as Node["type"])}>
            {NODE_TYPES.map((t) => <option key={t.type} value={t.type}>{t.icon} {t.label}</option>)}
          </select>
        </Field>
        <Field label="Название">
          <input style={p.input} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Название узла" />
        </Field>
        <Field label="Текст сообщения">
          <textarea style={p.textarea} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Введите текст ответа бота..." rows={5} />
        </Field>
        <div style={p.actions}>
          <button style={p.deleteBtn} onClick={() => onDelete(node.id)}>🗑 Удалить</button>
          <button style={p.saveBtn} onClick={() => onSave({ ...node, label, message, type })}>Применить</button>
        </div>
      </div>
    </div>
  );
}

// ─── AI Prompt Panel ───────────────────────────────────────────────
const PROMPT_FIELDS: { key: keyof Prompt; label: string; icon: string; placeholder: string; hint: string }[] = [
  { key: "persona",      icon: "🎭", label: "Роль (Persona)",           placeholder: "Ты — дружелюбный помощник интернет-магазина...",     hint: "Кто этот бот? Тон, стиль, уровень экспертизы." },
  { key: "goal",         icon: "🎯", label: "Цель (Goal)",              placeholder: "Главная задача — помочь клиенту выбрать товар...",    hint: "Какую главную задачу решает бот?" },
  { key: "context",      icon: "🌍", label: "Контекст (Context)",       placeholder: "Работаю в магазине электроники. Клиенты — люди 25-45 лет...", hint: "Для кого работает? Какая предыстория?" },
  { key: "instructions", icon: "📋", label: "Инструкции (Instructions)", placeholder: "1. Всегда здоровайся по имени\n2. Предлагай максимум 3 варианта...", hint: "Пошаговые правила: что делать, чего не делать." },
  { key: "constraints",  icon: "🚫", label: "Ограничения (Constraints)", placeholder: "Отвечай только на русском. Длина ответа — до 3 предложений...", hint: "Формат, длина ответов, запрещённые темы, язык." },
  { key: "examples",     icon: "💡", label: "Примеры (Few-Shot)",        placeholder: "Q: Какой телефон лучше?\nA: Зависит от бюджета...",   hint: "Примеры идеальных вопросов и ответов." },
];

function AIPromptPanel({ prompt, onChange }: { prompt: Prompt; onChange: (p: Prompt) => void }) {
  const [open, setOpen] = useState<keyof Prompt | null>("persona");

  return (
    <div style={p.panel}>
      <div style={{ ...p.panelHeader, borderBottom: "3px solid #FF6B6B" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", background: "rgba(255,107,107,0.12)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center" }}>🤖</div>
          <span style={p.panelTitle}>Настройка AI-промпта</span>
        </div>
      </div>
      <div style={{ ...p.panelBody, gap: "8px" }}>
        <div style={{ fontSize: "0.78rem", color: "#8B92B8", background: "#F8F9FF", borderRadius: "10px", padding: "10px 12px", lineHeight: 1.5 }}>
          Заполните разделы ниже — они формируют системный промпт для вашего AI-бота. Чем подробнее, тем точнее ответы.
        </div>
        {PROMPT_FIELDS.map((f) => {
          const isOpen = open === f.key;
          const filled = !!(prompt[f.key] || "").trim();
          return (
            <div key={f.key} style={{ border: `1.5px solid ${isOpen ? "#FF6B6B" : filled ? "#00D4AA44" : "#E0E4F0"}`, borderRadius: "12px", overflow: "hidden", transition: "border-color 0.2s" }}>
              <button
                style={{ width: "100%", background: isOpen ? "rgba(255,107,107,0.05)" : filled ? "rgba(0,212,170,0.04)" : "#fff", border: "none", padding: "11px 14px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", textAlign: "left" }}
                onClick={() => setOpen(isOpen ? null : f.key)}
              >
                <span style={{ fontSize: "1rem" }}>{f.icon}</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0A0E27", flex: 1 }}>{f.label}</span>
                {filled && <span style={{ fontSize: "0.68rem", background: "rgba(0,212,170,0.15)", color: "#00A884", borderRadius: "100px", padding: "2px 7px", fontWeight: 700 }}>✓</span>}
                <span style={{ color: "#8B92B8", fontSize: "0.7rem", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
              </button>
              {isOpen && (
                <div style={{ padding: "0 12px 12px" }}>
                  <div style={{ fontSize: "0.75rem", color: "#8B92B8", marginBottom: "8px" }}>{f.hint}</div>
                  <textarea
                    style={{ ...p.textarea, minHeight: "100px", fontSize: "0.82rem" }}
                    value={prompt[f.key]}
                    onChange={(e) => onChange({ ...prompt, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    rows={4}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Preview */}
        {Object.values(prompt).some((v) => v.trim()) && (
          <div style={{ marginTop: "4px", border: "1.5px solid #E0E4F0", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", background: "#F8F9FF", fontSize: "0.78rem", fontWeight: 700, color: "#4A5280", display: "flex", alignItems: "center", gap: "6px" }}>
              👁 Превью системного промпта
            </div>
            <div style={{ padding: "12px 14px", fontSize: "0.78rem", color: "#4A5280", lineHeight: 1.6, fontFamily: "monospace", whiteSpace: "pre-wrap", maxHeight: "180px", overflowY: "auto", background: "#fff" }}>
              {buildPromptPreview(prompt)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function buildPromptPreview(pr: Prompt): string {
  const parts: string[] = [];
  if (pr.persona)      parts.push(`## Роль\n${pr.persona}`);
  if (pr.goal)         parts.push(`## Цель\n${pr.goal}`);
  if (pr.context)      parts.push(`## Контекст\n${pr.context}`);
  if (pr.instructions) parts.push(`## Инструкции\n${pr.instructions}`);
  if (pr.constraints)  parts.push(`## Ограничения\n${pr.constraints}`);
  if (pr.examples)     parts.push(`## Примеры\n${pr.examples}`);
  return parts.join("\n\n");
}

// ─── Helpers ────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4A5280" }}>{label}</label>
      {children}
    </div>
  );
}

const p: Record<string, React.CSSProperties> = {
  panel: { width: "300px", background: "#fff", borderLeft: "1px solid #E0E4F0", display: "flex", flexDirection: "column", flexShrink: 0, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" },
  panelHeader: { padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  panelTitle: { fontWeight: 700, color: "#0A0E27", fontSize: "0.92rem" },
  closeBtn: { background: "none", border: "none", cursor: "pointer", color: "#8B92B8", fontSize: "1rem" },
  panelBody: { padding: "14px", display: "flex", flexDirection: "column", gap: "14px", overflowY: "auto", flex: 1 },
  select: { padding: "9px 12px", border: "1.5px solid #E0E4F0", borderRadius: "10px", fontSize: "0.88rem", outline: "none", color: "#0A0E27", background: "#fff", width: "100%" },
  input: { padding: "9px 12px", border: "1.5px solid #E0E4F0", borderRadius: "10px", fontSize: "0.88rem", outline: "none", color: "#0A0E27", width: "100%", boxSizing: "border-box" },
  textarea: { padding: "9px 12px", border: "1.5px solid #E0E4F0", borderRadius: "10px", fontSize: "0.88rem", outline: "none", resize: "vertical", color: "#0A0E27", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  actions: { display: "flex", gap: "8px", marginTop: "4px" },
  deleteBtn: { flex: 1, background: "#fff0f0", border: "1px solid #ffd0d0", color: "#d63031", borderRadius: "10px", padding: "9px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" },
  saveBtn: { flex: 2, background: "linear-gradient(135deg,#0077FF,#7B61FF)", color: "#fff", border: "none", borderRadius: "10px", padding: "9px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" },
};

// ─── Chat Test Panel ───────────────────────────────────────────────
interface ChatMsg { from: "user" | "bot"; text: string; nodeId?: string; special?: "email_saved" | "email_error"; }

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function ChatTestPanel({ nodes, edges, botName, botId, onClose }: {
  nodes: Node[]; edges: Edge[]; botName: string; botId: number; onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  // Когда бот ожидает email от пользователя
  const [awaitingEmail, setAwaitingEmail] = useState(false);
  const [collectedName, setCollectedName] = useState("");
  const [leadsCount, setLeadsCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const startNode = nodes.find((n) => n.type === "trigger");

  const addBotMsg = (text: string, nodeId?: string, special?: ChatMsg["special"]) =>
    setMessages((prev) => [...prev, { from: "bot", text, nodeId, special }]);

  const reset = () => {
    setMessages([]);
    setCurrentNodeId(null);
    setInput("");
    setAwaitingEmail(false);
    setCollectedName("");
    if (startNode) {
      setTimeout(() => {
        addBotMsg(startNode.message || "Привет! Чем могу помочь?", startNode.id);
        setCurrentNodeId(startNode.id);
      }, 300);
    }
  };

  useEffect(() => { reset(); }, [nodes.length]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  const getNextNode = (fromId: string): Node | null => {
    const edge = edges.find((e) => e.source === fromId);
    if (!edge) return null;
    return nodes.find((n) => n.id === edge.target) ?? null;
  };

  const findMatchingNode = (userText: string, fromId: string | null): Node | null => {
    const text = userText.toLowerCase();
    if (fromId) {
      const directEdges = edges.filter((e) => e.source === fromId);
      for (const edge of directEdges) {
        const candidate = nodes.find((n) => n.id === edge.target);
        if (!candidate) continue;
        if (candidate.type === "condition" && candidate.label.toLowerCase().split(/[,;]/).some((kw) => text.includes(kw.trim()))) return candidate;
        if (candidate.type !== "condition") return candidate;
      }
      if (directEdges.length > 0) {
        const first = nodes.find((n) => n.id === directEdges[0].target);
        if (first) return first;
      }
    }
    const match = nodes.find((n) => n.type !== "trigger" && n.label.toLowerCase().split(/[,;]/).some((kw) => text.includes(kw.trim())));
    return match ?? null;
  };

  // Обработка узла email — запускаем сбор данных
  const handleEmailNode = (emailNode: Node) => {
    addBotMsg(emailNode.message || "Пожалуйста, введите ваш email:", emailNode.id);
    setCurrentNodeId(emailNode.id);
    setAwaitingEmail(true);
  };

  // Сохранение лида после получения email
  const handleEmailInput = async (userText: string) => {
    const email = userText.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      setThinking(false);
      addBotMsg("Это не похоже на email. Попробуйте ещё раз — например: ivan@example.com");
      return;
    }
    try {
      const res = await api.saveLead(botId, email, collectedName);
      setThinking(false);
      setAwaitingEmail(false);
      if (res.duplicate) {
        addBotMsg("Этот email уже зарегистрирован. Продолжаем!", undefined, "email_saved");
      } else {
        setLeadsCount((c) => c + 1);
        addBotMsg(`✅ Email сохранён! Спасибо, мы свяжемся с вами.`, undefined, "email_saved");
      }
      // Переходим к следующему узлу после email-узла
      const afterEmail = getNextNode(currentNodeId!);
      if (afterEmail) {
        setTimeout(() => {
          addBotMsg(afterEmail.message || `[${afterEmail.label}]`, afterEmail.id);
          setCurrentNodeId(afterEmail.id);
        }, 600);
      }
    } catch {
      setThinking(false);
      addBotMsg("Не удалось сохранить email. Попробуйте ещё раз.", undefined, "email_error");
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setThinking(true);

    // Если ожидаем email — обрабатываем как email
    if (awaitingEmail) {
      setTimeout(() => handleEmailInput(userText), 500);
      return;
    }

    // Запоминаем имя если это первое сообщение пользователя
    if (!collectedName && messages.filter((m) => m.from === "user").length === 0) {
      setCollectedName(userText);
    }

    setTimeout(() => {
      setThinking(false);
      const next = findMatchingNode(userText, currentNodeId);
      if (next) {
        if (next.type === "email") {
          handleEmailNode(next);
          return;
        }
        addBotMsg(next.message || `[${next.label}]`, next.id);
        setCurrentNodeId(next.id);
        const afterNext = getNextNode(next.id);
        if (afterNext && afterNext.type !== "trigger" && afterNext.type !== "condition") {
          setTimeout(() => {
            if (afterNext.type === "email") { handleEmailNode(afterNext); return; }
            addBotMsg(afterNext.message || `[${afterNext.label}]`, afterNext.id);
            setCurrentNodeId(afterNext.id);
          }, 600);
        }
      } else {
        addBotMsg("Не совсем понял. Попробуйте переформулировать.");
      }
    }, 700 + Math.random() * 300);
  };

  const noNodes = nodes.length === 0;

  return (
    <div style={{ width: "320px", background: "#fff", borderLeft: "1px solid #E0E4F0", display: "flex", flexDirection: "column", flexShrink: 0, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: "3px solid #00D4AA", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#00D4AA,#0077FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🤖</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#0A0E27", fontSize: "0.9rem" }}>{botName}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.72rem", color: "#00A884", fontWeight: 600 }}>● Тест-режим</span>
            {leadsCount > 0 && <span style={{ fontSize: "0.68rem", background: "rgba(224,64,251,0.12)", color: "#C026D3", borderRadius: "100px", padding: "1px 7px", fontWeight: 700 }}>📧 {leadsCount} лид{leadsCount > 1 ? "а" : ""}</span>}
          </div>
        </div>
        <button onClick={reset} title="Сбросить чат" style={{ background: "#F4F6FF", border: "none", borderRadius: "8px", padding: "6px 8px", cursor: "pointer", fontSize: "0.8rem", color: "#4A5280" }}>↺</button>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8B92B8", fontSize: "1rem" }}>✕</button>
      </div>

      {/* Email mode banner */}
      {awaitingEmail && (
        <div style={{ padding: "8px 14px", background: "rgba(224,64,251,0.08)", borderBottom: "1px solid rgba(224,64,251,0.2)", fontSize: "0.75rem", color: "#C026D3", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
          📧 Ожидаю email-адрес...
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px", background: "#F8F9FF" }}>
        {noNodes && (
          <div style={{ textAlign: "center", color: "#8B92B8", fontSize: "0.85rem", marginTop: "40px" }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🎯</div>
            Добавьте узлы в сценарий, чтобы протестировать бота
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", flexDirection: msg.from === "user" ? "row-reverse" : "row", gap: "8px", alignItems: "flex-end" }}>
            {msg.from === "bot" && (
              <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: msg.special === "email_saved" ? "linear-gradient(135deg,#E040FB,#7B61FF)" : "linear-gradient(135deg,#00D4AA,#0077FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", flexShrink: 0 }}>
                {msg.special === "email_saved" ? "📧" : "🤖"}
              </div>
            )}
            <div style={{ maxWidth: "76%", display: "flex", flexDirection: "column", gap: "3px", alignItems: msg.from === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                background: msg.from === "user"
                  ? "linear-gradient(135deg,#0077FF,#7B61FF)"
                  : msg.special === "email_saved" ? "rgba(224,64,251,0.08)" : msg.special === "email_error" ? "#fff0f0" : "#fff",
                color: msg.from === "user" ? "#fff" : msg.special === "email_saved" ? "#C026D3" : msg.special === "email_error" ? "#d63031" : "#0A0E27",
                border: msg.special === "email_saved" ? "1.5px solid rgba(224,64,251,0.25)" : msg.special === "email_error" ? "1.5px solid #ffd0d0" : "none",
                borderRadius: msg.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                padding: "9px 13px", fontSize: "0.86rem", lineHeight: 1.5,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}>
                {msg.text}
              </div>
              {msg.nodeId && (
                <div style={{ fontSize: "0.65rem", color: "#C8CEE0", paddingLeft: "4px" }}>
                  узел: {nodes.find((n) => n.id === msg.nodeId)?.label}
                </div>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "linear-gradient(135deg,#00D4AA,#0077FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>🤖</div>
            <div style={{ background: "#fff", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C8CEE0", animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Подсказка */}
      {currentNodeId && !awaitingEmail && (() => {
        const next = getNextNode(currentNodeId);
        return next ? (
          <div style={{ padding: "6px 14px", background: "#F0F4FF", borderTop: "1px solid #E0E4F0", fontSize: "0.72rem", color: "#8B92B8" }}>
            Следующий: <span style={{ color: "#0077FF", fontWeight: 600 }}>{next.label}</span>
            {next.type === "email" && <span style={{ color: "#C026D3", marginLeft: "4px" }}>📧</span>}
          </div>
        ) : null;
      })()}

      {/* Input */}
      <div style={{ padding: "12px", borderTop: "1px solid #E0E4F0", display: "flex", gap: "8px" }}>
        <input
          style={{ flex: 1, padding: "9px 13px", border: `1.5px solid ${awaitingEmail ? "#E040FB" : "#E0E4F0"}`, borderRadius: "22px", fontSize: "0.88rem", outline: "none", color: "#0A0E27", background: awaitingEmail ? "rgba(224,64,251,0.04)" : "#F8F9FF", transition: "border 0.2s" }}
          placeholder={awaitingEmail ? "Введите email (например: ivan@mail.ru)" : "Написать сообщение..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={noNodes}
          type={awaitingEmail ? "email" : "text"}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || noNodes}
          style={{ width: "38px", height: "38px", borderRadius: "50%", background: input.trim() ? (awaitingEmail ? "linear-gradient(135deg,#E040FB,#7B61FF)" : "linear-gradient(135deg,#0077FF,#7B61FF)") : "#E0E4F0", border: "none", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0, transition: "background 0.2s" }}>
          {awaitingEmail ? "📧" : "➤"}
        </button>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}

// ─── Main BotBuilder ───────────────────────────────────────────────
type RightPanel = "node" | "prompt" | "test" | null;

interface Props { botId: number; onBack: () => void; }

export default function BotBuilder({ botId, onBack }: Props) {
  const [bot, setBot] = useState<BotInfo | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [editNode, setEditNode] = useState<Node | null>(null);
  const [rightPanel, setRightPanel] = useState<RightPanel>(null);
  const [prompt, setPrompt] = useState<Prompt>({ persona: "", goal: "", context: "", instructions: "", constraints: "", examples: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getBot(botId).then((d) => {
      setBot(d.bot);
      setNodes(d.nodes.map((n: Node) => ({ ...n, x: n.x ?? 100, y: n.y ?? 100 })));
      setEdges(d.edges);
      setPrompt({
        persona: d.bot.prompt_persona || "",
        goal: d.bot.prompt_goal || "",
        context: d.bot.prompt_context || "",
        instructions: d.bot.prompt_instructions || "",
        constraints: d.bot.prompt_constraints || "",
        examples: d.bot.prompt_examples || "",
      });
    });
  }, [botId]);

  const addNode = useCallback((type: Node["type"]) => {
    const nStyle = getNodeStyle(type);
    const n: Node = { id: uid(), type, label: nStyle.label, message: type === "message" ? "Введите текст..." : type === "trigger" ? "Любое сообщение" : "", x: 160 + Math.random() * 180, y: 80 + nodes.length * 110 };
    setNodes((prev) => [...prev, n]);
    setSelected(n.id);
    setEditNode(n);
    setRightPanel("node");
  }, [nodes.length]);

  const moveNode = useCallback((id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, x: Math.max(0, x), y: Math.max(0, y) } : n));
  }, []);

  // Ref чтобы handleNodeSelect всегда видел актуальный connecting
  const connectingRef = useRef<string | null>(null);
  connectingRef.current = connecting;

  const handleNodeSelect = (id: string) => {
    const cur = connectingRef.current;
    if (cur && cur !== id) {
      setEdges((prev) => {
        if (prev.some((e) => e.source === cur && e.target === id)) return prev;
        return [...prev, { id: eid(), source: cur, target: id }];
      });
      setConnecting(null);
      return;
    }
    setSelected(id);
    const n = nodes.find((n) => n.id === id);
    if (n) { setEditNode(n); setRightPanel("node"); }
  };

  const handleStartConnect = (id: string) => {
    setConnecting(id);
    setSelected(id);
  };

  const saveNode = (updated: Node) => {
    setNodes((prev) => prev.map((n) => n.id === updated.id ? updated : n));
    setEditNode(updated);
  };

  const deleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
    setEditNode(null); setSelected(null); setRightPanel(null);
  };

  const saveToServer = async () => {
    setSaving(true);
    try {
      await api.saveBot(botId, nodes, edges, prompt);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const promptFilled = Object.values(prompt).filter((v) => v.trim()).length;
  const currentNode = editNode && nodes.find((n) => n.id === editNode.id) ? editNode : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", background: "#F4F6FF" }}>
      {/* Top bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E0E4F0", padding: "0 16px", height: "54px", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#4A5280", fontSize: "0.88rem", fontWeight: 600, padding: "6px 10px", borderRadius: "8px" }} onClick={onBack}>← Назад</button>
        <div style={{ width: "1px", height: "24px", background: "#E0E4F0" }} />
        <div style={{ fontWeight: 800, color: "#0A0E27", fontSize: "0.95rem" }}>{bot?.name ?? "..."}</div>
        <div style={{ flex: 1 }} />

        {/* Node palette */}
        <div style={{ display: "flex", gap: "6px" }}>
          {NODE_TYPES.map((t) => (
            <button key={t.type} onClick={() => addNode(t.type as Node["type"])} title={`Добавить: ${t.label}`}
              style={{ background: t.bg, border: `1px solid ${t.color}44`, borderRadius: "8px", padding: "5px 10px", fontSize: "0.75rem", fontWeight: 600, color: t.color, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div style={{ width: "1px", height: "24px", background: "#E0E4F0" }} />

        {/* AI Prompt button */}
        <button
          onClick={() => setRightPanel(rightPanel === "prompt" ? null : "prompt")}
          style={{ background: rightPanel === "prompt" ? "rgba(255,107,107,0.12)" : "#F4F6FF", border: `1.5px solid ${rightPanel === "prompt" ? "#FF6B6B" : "#E0E4F0"}`, borderRadius: "9px", padding: "7px 13px", fontSize: "0.82rem", fontWeight: 700, color: rightPanel === "prompt" ? "#FF6B6B" : "#4A5280", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          🤖 AI-промпт
          {promptFilled > 0 && <span style={{ background: "#FF6B6B", color: "#fff", borderRadius: "100px", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800 }}>{promptFilled}</span>}
        </button>

        {/* Test button */}
        <button
          onClick={() => setRightPanel(rightPanel === "test" ? null : "test")}
          style={{ background: rightPanel === "test" ? "rgba(0,212,170,0.12)" : "#F4F6FF", border: `1.5px solid ${rightPanel === "test" ? "#00D4AA" : "#E0E4F0"}`, borderRadius: "9px", padding: "7px 13px", fontSize: "0.82rem", fontWeight: 700, color: rightPanel === "test" ? "#00A884" : "#4A5280", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          ▶ Тестировать
        </button>

        {/* Cancel connect */}
        {connecting && (
          <button onClick={() => setConnecting(null)}
            style={{ background: "#0077FF", border: "none", borderRadius: "9px", padding: "7px 13px", fontSize: "0.82rem", fontWeight: 600, color: "#fff", cursor: "pointer" }}>
            ✕ Отмена связи
          </button>
        )}

        {/* Save */}
        <button onClick={saveToServer} disabled={saving}
          style={{ background: saved ? "#00D4AA" : "linear-gradient(135deg,#0077FF,#7B61FF)", color: "#fff", border: "none", borderRadius: "10px", padding: "8px 18px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Сохраняю..." : saved ? "✓ Сохранено!" : "💾 Сохранить"}
        </button>
      </div>

      {/* Canvas + right panel */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Canvas */}
        <div ref={canvasRef}
          onClick={(e) => { if (e.target === canvasRef.current) { setSelected(null); setConnecting(null); } }}
          style={{
            flex: 1, position: "relative", overflow: "auto",
            cursor: connecting ? "crosshair" : "default",
            backgroundImage: "linear-gradient(rgba(0,119,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,119,255,0.05) 1px,transparent 1px)",
            backgroundSize: "28px 28px",
          }}>
          <div style={{ position: "relative", minWidth: "1600px", minHeight: "1000px" }}>
            <EdgesSVG nodes={nodes} edges={edges} />
            {nodes.map((node) => (
              <NodeCard key={node.id} node={node}
                selected={selected === node.id}
                connecting={connecting === node.id}
                connectingActive={!!connecting}
                onSelect={handleNodeSelect}
                onMove={moveNode}
                onEdit={(n) => { setEditNode(n); setSelected(n.id); setRightPanel("node"); }}
                onStartConnect={handleStartConnect}
              />
            ))}
            {nodes.length === 0 && (
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
                <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🎯</div>
                <div style={{ fontWeight: 700, color: "#4A5280", marginBottom: "5px" }}>Холст пуст</div>
                <div style={{ color: "#8B92B8", fontSize: "0.85rem" }}>Добавьте узел из панели выше</div>
              </div>
            )}
          </div>
          {connecting && (
            <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: "#0077FF", color: "#fff", padding: "10px 22px", borderRadius: "100px", fontSize: "0.85rem", fontWeight: 600, zIndex: 100, boxShadow: "0 8px 20px rgba(0,119,255,0.4)" }}>
              Кликните на узел-получатель...
            </div>
          )}
        </div>

        {/* Right panel: node editor */}
        {rightPanel === "node" && currentNode && (
          <NodePanel
            node={currentNode}
            onSave={saveNode}
            onClose={() => { setRightPanel(null); setEditNode(null); setSelected(null); }}
            onDelete={deleteNode}
          />
        )}

        {/* Right panel: AI prompt */}
        {rightPanel === "prompt" && (
          <AIPromptPanel prompt={prompt} onChange={setPrompt} />
        )}

        {/* Right panel: Chat test */}
        {rightPanel === "test" && (
          <ChatTestPanel
            nodes={nodes}
            edges={edges}
            botName={bot?.name ?? "Бот"}
            botId={botId}
            onClose={() => setRightPanel(null)}
          />
        )}
      </div>
    </div>
  );
}