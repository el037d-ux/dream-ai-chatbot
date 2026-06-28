import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/api";

// ─── Types ────────────────────────────────────────────────────────
interface Node {
  id: string;
  type: "trigger" | "message" | "condition" | "action" | "ai";
  label: string;
  message: string;
  x: number;
  y: number;
}
interface Edge { id: string; source: string; target: string; }
interface BotInfo { id: number; name: string; description: string; status: string; }

const NODE_TYPES = [
  { type: "trigger", label: "Триггер", icon: "💬", color: "#00D4AA", bg: "rgba(0,212,170,0.1)" },
  { type: "message", label: "Сообщение", icon: "📤", color: "#0077FF", bg: "rgba(0,119,255,0.1)" },
  { type: "condition", label: "Условие", icon: "🔀", color: "#FFB800", bg: "rgba(255,184,0,0.1)" },
  { type: "action", label: "Действие", icon: "⚡", color: "#7B61FF", bg: "rgba(123,97,255,0.1)" },
  { type: "ai", label: "AI-ответ", icon: "🤖", color: "#FF6B6B", bg: "rgba(255,107,107,0.1)" },
] as const;

function getNodeStyle(type: Node["type"]) {
  return NODE_TYPES.find((t) => t.type === type) ?? NODE_TYPES[1];
}

let idCounter = Date.now();
const uid = () => `node_${++idCounter}`;
const eid = () => `edge_${++idCounter}`;

// ─── Node Component ───────────────────────────────────────────────
function NodeCard({
  node, selected, onSelect, onMove, onEdit,
}: {
  node: Node; selected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onEdit: (node: Node) => void;
}) {
  const nStyle = getNodeStyle(node.type);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
    dragging.current = true;
    offset.current = { x: e.clientX - node.x, y: e.clientY - node.y };
    const onMove_ = (ev: MouseEvent) => {
      if (dragging.current) onMove(node.id, ev.clientX - offset.current.x, ev.clientY - offset.current.y);
    };
    const onUp = () => { dragging.current = false; window.removeEventListener("mousemove", onMove_); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove_);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      style={{
        position: "absolute", left: node.x, top: node.y,
        background: "#fff",
        border: `2px solid ${selected ? nStyle.color : "#E0E4F0"}`,
        borderRadius: "14px", padding: "14px 16px", minWidth: "160px",
        boxShadow: selected ? `0 0 0 4px ${nStyle.color}22, 0 8px 24px rgba(0,0,0,0.1)` : "0 4px 12px rgba(0,0,0,0.08)",
        cursor: "grab", userSelect: "none", zIndex: selected ? 10 : 5,
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={(e) => { e.stopPropagation(); onEdit(node); }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: nStyle.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>
          {nStyle.icon}
        </div>
        <div>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: nStyle.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>{nStyle.label}</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0A0E27" }}>{node.label}</div>
        </div>
      </div>
      {node.message && (
        <div style={{ fontSize: "0.78rem", color: "#8B92B8", background: "#F8F9FF", borderRadius: "8px", padding: "6px 8px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {node.message}
        </div>
      )}
      {/* Connection points */}
      <div style={{ position: "absolute", bottom: "-6px", left: "50%", transform: "translateX(-50%)", width: "12px", height: "12px", borderRadius: "50%", background: nStyle.color, border: "2px solid #fff", cursor: "crosshair" }} />
      <div style={{ position: "absolute", top: "-6px", left: "50%", transform: "translateX(-50%)", width: "12px", height: "12px", borderRadius: "50%", background: "#E0E4F0", border: "2px solid #fff" }} />
    </div>
  );
}

// ─── SVG Edges ────────────────────────────────────────────────────
function EdgesSVG({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  const nodesById = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#0077FF" />
        </marker>
      </defs>
      {edges.map((e) => {
        const s = nodesById[e.source];
        const t = nodesById[e.target];
        if (!s || !t) return null;
        const sx = s.x + 80, sy = s.y + 80;
        const tx = t.x + 80, ty = t.y + 6;
        const cy = (sy + ty) / 2;
        return (
          <path key={e.id}
            d={`M ${sx} ${sy} C ${sx} ${cy}, ${tx} ${cy}, ${tx} ${ty}`}
            stroke="#0077FF" strokeWidth="2" fill="none" strokeDasharray="6 3"
            markerEnd="url(#arrowhead)"
          />
        );
      })}
    </svg>
  );
}

// ─── Edit Panel ───────────────────────────────────────────────────
function EditPanel({ node, onSave, onClose, onDelete }: {
  node: Node; onSave: (n: Node) => void; onClose: () => void; onDelete: (id: string) => void;
}) {
  const [label, setLabel] = useState(node.label);
  const [message, setMessage] = useState(node.message);
  const [type, setType] = useState(node.type);

  return (
    <div style={ep.panel}>
      <div style={ep.header}>
        <span style={ep.title}>Редактировать узел</span>
        <button style={ep.close} onClick={onClose}>✕</button>
      </div>
      <div style={ep.body}>
        <div style={ep.field}>
          <label style={ep.label}>Тип узла</label>
          <select style={ep.select} value={type} onChange={(e) => setType(e.target.value as Node["type"])}>
            {NODE_TYPES.map((t) => <option key={t.type} value={t.type}>{t.icon} {t.label}</option>)}
          </select>
        </div>
        <div style={ep.field}>
          <label style={ep.label}>Название</label>
          <input style={ep.input} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Название узла" />
        </div>
        <div style={ep.field}>
          <label style={ep.label}>Текст сообщения</label>
          <textarea style={ep.textarea} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Введите текст ответа бота..." rows={4} />
        </div>
        <div style={ep.actions}>
          <button style={ep.deleteBtn} onClick={() => onDelete(node.id)}>🗑 Удалить</button>
          <button style={ep.saveBtn} onClick={() => onSave({ ...node, label, message, type })}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}

const ep: Record<string, React.CSSProperties> = {
  panel: { width: "280px", background: "#fff", borderLeft: "1px solid #E0E4F0", display: "flex", flexDirection: "column", flexShrink: 0 },
  header: { padding: "16px 20px", borderBottom: "1px solid #E0E4F0", display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { fontWeight: 700, color: "#0A0E27", fontSize: "0.95rem" },
  close: { background: "none", border: "none", cursor: "pointer", color: "#8B92B8", fontSize: "1rem" },
  body: { padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.8rem", fontWeight: 600, color: "#4A5280" },
  input: { padding: "10px 12px", border: "1.5px solid #E0E4F0", borderRadius: "10px", fontSize: "0.9rem", outline: "none", color: "#0A0E27" },
  select: { padding: "10px 12px", border: "1.5px solid #E0E4F0", borderRadius: "10px", fontSize: "0.9rem", outline: "none", color: "#0A0E27", background: "#fff" },
  textarea: { padding: "10px 12px", border: "1.5px solid #E0E4F0", borderRadius: "10px", fontSize: "0.9rem", outline: "none", resize: "vertical", color: "#0A0E27", fontFamily: "inherit" },
  actions: { display: "flex", gap: "8px" },
  deleteBtn: { flex: 1, background: "#fff0f0", border: "1px solid #ffd0d0", color: "#d63031", borderRadius: "10px", padding: "10px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" },
  saveBtn: { flex: 2, background: "linear-gradient(135deg,#0077FF,#7B61FF)", color: "#fff", border: "none", borderRadius: "10px", padding: "10px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" },
};

// ─── Main BotBuilder ──────────────────────────────────────────────
interface Props {
  botId: number;
  onBack: () => void;
}

export default function BotBuilder({ botId, onBack }: Props) {
  const [bot, setBot] = useState<BotInfo | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [editNode, setEditNode] = useState<Node | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getBot(botId).then((d) => {
      setBot(d.bot);
      setNodes(d.nodes.map((n: Node) => ({ ...n, x: n.x ?? 100, y: n.y ?? 100 })));
      setEdges(d.edges);
    });
  }, [botId]);

  const addNode = useCallback((type: Node["type"]) => {
    const nStyle = getNodeStyle(type);
    const newNode: Node = {
      id: uid(), type,
      label: nStyle.label,
      message: type === "message" ? "Введите текст ответа..." : type === "trigger" ? "Любое сообщение" : "",
      x: 160 + Math.random() * 200,
      y: 80 + nodes.length * 100,
    };
    setNodes((prev) => [...prev, newNode]);
    setSelected(newNode.id);
    setEditNode(newNode);
  }, [nodes.length]);

  const moveNode = useCallback((id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, x: Math.max(0, x), y: Math.max(0, y) } : n));
  }, []);

  const saveNode = (updated: Node) => {
    setNodes((prev) => prev.map((n) => n.id === updated.id ? updated : n));
    setEditNode(updated);
  };

  const deleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
    setEditNode(null);
    setSelected(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelected(null);
      if (connecting) setConnecting(null);
    }
  };

  const handleNodeSelect = (id: string) => {
    if (connecting && connecting !== id) {
      const alreadyExists = edges.some((e) => e.source === connecting && e.target === id);
      if (!alreadyExists) {
        setEdges((prev) => [...prev, { id: eid(), source: connecting, target: id }]);
      }
      setConnecting(null);
    } else {
      setSelected(id);
      const n = nodes.find((n) => n.id === id);
      if (n) setEditNode(n);
    }
  };

  const saveToServer = async () => {
    setSaving(true);
    try {
      await api.saveBot(botId, nodes, edges);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const selectedNode = editNode && nodes.find((n) => n.id === editNode.id) ? editNode : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont,'Segoe UI',sans-serif", background: "#F4F6FF" }}>
      {/* Top bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E0E4F0", padding: "0 20px", height: "56px", display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#4A5280", fontSize: "0.9rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }} onClick={onBack}>
          ← Назад
        </button>
        <div style={{ width: "1px", height: "24px", background: "#E0E4F0" }} />
        <div style={{ fontWeight: 800, color: "#0A0E27", fontSize: "1rem" }}>{bot?.name ?? "Загрузка..."}</div>
        <div style={{ flex: 1 }} />

        {/* Node palette */}
        <div style={{ display: "flex", gap: "8px" }}>
          {NODE_TYPES.map((t) => (
            <button key={t.type} onClick={() => addNode(t.type as Node["type"])}
              title={`Добавить: ${t.label}`}
              style={{ background: t.bg, border: `1px solid ${t.color}44`, borderRadius: "8px", padding: "6px 10px", fontSize: "0.78rem", fontWeight: 600, color: t.color, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div style={{ width: "1px", height: "24px", background: "#E0E4F0" }} />

        {/* Connect mode */}
        <button onClick={() => setConnecting(connecting ? null : (selected || null))}
          style={{ background: connecting ? "#0077FF" : "#F4F6FF", border: "1px solid #E0E4F0", borderRadius: "8px", padding: "8px 14px", fontSize: "0.82rem", fontWeight: 600, color: connecting ? "#fff" : "#4A5280", cursor: "pointer" }}>
          {connecting ? "✕ Отмена связи" : "🔗 Связать узлы"}
        </button>

        <button onClick={saveToServer} disabled={saving}
          style={{ background: saved ? "#00D4AA" : "linear-gradient(135deg,#0077FF,#7B61FF)", color: "#fff", border: "none", borderRadius: "10px", padding: "8px 18px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Сохраняю..." : saved ? "✓ Сохранено!" : "💾 Сохранить"}
        </button>
      </div>

      {/* Canvas + panel */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Canvas */}
        <div ref={canvasRef} onClick={handleCanvasClick}
          style={{
            flex: 1, position: "relative", overflow: "auto", cursor: connecting ? "crosshair" : "default",
            backgroundImage: "linear-gradient(rgba(0,119,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,119,255,0.05) 1px,transparent 1px)",
            backgroundSize: "28px 28px",
          }}>
          <div style={{ position: "relative", minWidth: "1400px", minHeight: "900px" }}>
            <EdgesSVG nodes={nodes} edges={edges} />
            {nodes.map((node) => (
              <NodeCard key={node.id} node={node} selected={selected === node.id || connecting === node.id}
                onSelect={handleNodeSelect} onMove={moveNode}
                onEdit={(n) => { setEditNode(n); setSelected(n.id); }} />
            ))}
            {connecting && (
              <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: "#0077FF", color: "#fff", padding: "10px 20px", borderRadius: "100px", fontSize: "0.85rem", fontWeight: 600, zIndex: 100 }}>
                Выберите узел для подключения...
              </div>
            )}
            {nodes.length === 0 && (
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🎯</div>
                <div style={{ fontWeight: 700, color: "#4A5280", marginBottom: "6px" }}>Холст пуст</div>
                <div style={{ color: "#8B92B8", fontSize: "0.85rem" }}>Добавьте узел из панели выше</div>
              </div>
            )}
          </div>
        </div>

        {/* Edit panel */}
        {selectedNode && (
          <EditPanel
            node={selectedNode}
            onSave={saveNode}
            onClose={() => { setEditNode(null); setSelected(null); }}
            onDelete={deleteNode}
          />
        )}
      </div>
    </div>
  );
}
