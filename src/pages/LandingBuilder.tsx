import { useState, useEffect } from "react";
import { api } from "@/api";
import Icon from "@/components/ui/icon";
import { Block, BlockType, Theme, DEFAULT_THEME, BLOCK_LIBRARY, makeBlock } from "./landing-builder/blocks";
import BlockRenderer from "./landing-builder/BlockRenderer";
import BlockEditor from "./landing-builder/BlockEditor";

interface Props {
  landingId: number;
  onBack: () => void;
}

const THEME_COLORS = ["#0077FF", "#7B61FF", "#00A884", "#FF6B6B", "#FF9800", "#E040FB", "#0A0E27"];

export default function LandingBuilder({ landingId, onBack }: Props) {
  const [name, setName] = useState("Мой лендинг");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rightTab, setRightTab] = useState<"block" | "theme">("block");

  useEffect(() => {
    api.getLanding(landingId).then((d) => {
      setName(d.name || "Мой лендинг");
      setBlocks(Array.isArray(d.blocks) ? d.blocks : []);
      setTheme({ ...DEFAULT_THEME, ...(d.theme || {}) });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [landingId]);

  const selected = blocks.find((b) => b.id === selectedId) || null;

  const addBlock = (type: BlockType) => {
    const b = makeBlock(type);
    setBlocks((prev) => [...prev, b]);
    setSelectedId(b.id);
    setRightTab("block");
  };

  const updateBlock = (id: string, data: Record<string, unknown>) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, data } : b)));

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.saveLanding(landingId, name, blocks, theme);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B92B8", fontFamily: "sans-serif" }}>Загрузка...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", background: "#F4F6FF" }}>
      {/* Топбар */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 20px", background: "#fff", borderBottom: "1px solid #E8EBF5", flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "#F4F6FF", border: "1.5px solid #E0E4F0", borderRadius: "9px", padding: "8px 12px", cursor: "pointer", color: "#4A5280", fontWeight: 600, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
          <Icon name="ArrowLeft" size={16} /> Назад
        </button>
        <input value={name} onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, maxWidth: "320px", padding: "8px 12px", border: "1.5px solid transparent", borderRadius: "9px", fontSize: "0.95rem", fontWeight: 700, color: "#0A0E27", outline: "none", background: "#F8F9FF" }} />
        <div style={{ flex: 1 }} />
        <button onClick={save} disabled={saving}
          style={{ background: saved ? "#00A884" : "linear-gradient(135deg,#0077FF,#00A8FF)", color: "#fff", border: "none", borderRadius: "10px", padding: "9px 20px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          <Icon name={saved ? "Check" : "Save"} size={16} /> {saving ? "Сохраняю..." : saved ? "Сохранено" : "Сохранить"}
        </button>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Палитра блоков */}
        <div style={{ width: "210px", background: "#fff", borderRight: "1px solid #E8EBF5", padding: "16px", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8B92B8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "12px" }}>Блоки</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {BLOCK_LIBRARY.map((b) => (
              <button key={b.type} onClick={() => addBlock(b.type)}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1.5px solid #E8EBF5", borderRadius: "10px", background: "#FAFBFF", cursor: "pointer", textAlign: "left", color: "#0A0E27", fontWeight: 600, fontSize: "0.85rem" }}>
                <Icon name={b.icon} size={18} fallback="Square" />
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Превью */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: "900px", background: theme.bg, borderRadius: "14px", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", minHeight: "200px" }}>
            {blocks.length === 0 ? (
              <div style={{ padding: "80px 20px", textAlign: "center", color: "#8B92B8" }}>
                <Icon name="MousePointerClick" size={40} />
                <div style={{ marginTop: "14px", fontWeight: 600 }}>Добавьте блоки слева, чтобы начать</div>
              </div>
            ) : (
              blocks.map((b) => (
                <div key={b.id} onClick={() => { setSelectedId(b.id); setRightTab("block"); }}
                  style={{ position: "relative", cursor: "pointer", outline: selectedId === b.id ? `3px solid ${theme.primary}` : "none", outlineOffset: "-3px" }}>
                  <BlockRenderer block={b} theme={theme} />
                  {selectedId === b.id && (
                    <div style={{ position: "absolute", top: "8px", right: "8px", display: "flex", gap: "4px", background: "#fff", borderRadius: "8px", padding: "4px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                      <button onClick={(e) => { e.stopPropagation(); moveBlock(b.id, -1); }} style={iconBtn}><Icon name="ChevronUp" size={16} /></button>
                      <button onClick={(e) => { e.stopPropagation(); moveBlock(b.id, 1); }} style={iconBtn}><Icon name="ChevronDown" size={16} /></button>
                      <button onClick={(e) => { e.stopPropagation(); removeBlock(b.id); }} style={{ ...iconBtn, color: "#d63031" }}><Icon name="Trash2" size={16} /></button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Правая панель */}
        <div style={{ width: "300px", background: "#fff", borderLeft: "1px solid #E8EBF5", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ display: "flex", borderBottom: "1px solid #E8EBF5" }}>
            {(["block", "theme"] as const).map((t) => (
              <button key={t} onClick={() => setRightTab(t)}
                style={{ flex: 1, padding: "12px", border: "none", background: rightTab === t ? "#F4F6FF" : "#fff", color: rightTab === t ? "#0077FF" : "#8B92B8", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", borderBottom: rightTab === t ? "2px solid #0077FF" : "2px solid transparent" }}>
                {t === "block" ? "Блок" : "Оформление"}
              </button>
            ))}
          </div>
          <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
            {rightTab === "block" ? (
              selected ? (
                <BlockEditor block={selected} onChange={(data) => updateBlock(selected.id, data)} />
              ) : (
                <div style={{ color: "#8B92B8", fontSize: "0.85rem", textAlign: "center", marginTop: "30px" }}>Выберите блок в превью, чтобы изменить его текст</div>
              )
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8B92B8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "10px" }}>Основной цвет</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {THEME_COLORS.map((c) => (
                      <button key={c} onClick={() => setTheme((t) => ({ ...t, primary: c }))}
                        style={{ width: "30px", height: "30px", borderRadius: "8px", background: c, border: theme.primary === c ? "3px solid #0A0E27" : "3px solid #fff", boxShadow: "0 0 0 1px #E0E4F0", cursor: "pointer" }} />
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8B92B8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "10px" }}>Цвет фона</div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {["#FFFFFF", "#F8F9FF", "#0A0E27"].map((c) => (
                      <button key={c} onClick={() => setTheme((t) => ({ ...t, bg: c, text: c === "#0A0E27" ? "#FFFFFF" : "#0A0E27" }))}
                        style={{ width: "30px", height: "30px", borderRadius: "8px", background: c, border: theme.bg === c ? "3px solid #0077FF" : "3px solid #fff", boxShadow: "0 0 0 1px #E0E4F0", cursor: "pointer" }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer", padding: "3px", color: "#4A5280", display: "flex", alignItems: "center",
};
