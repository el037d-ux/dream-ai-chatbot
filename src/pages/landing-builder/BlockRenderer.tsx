import Icon from "@/components/ui/icon";
import { Block, Theme } from "./blocks";

interface Props {
  block: Block;
  theme: Theme;
}

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);

export default function BlockRenderer({ block, theme }: Props) {
  const d = block.data;
  const wrap: React.CSSProperties = { padding: "56px 32px", fontFamily: theme.font, color: theme.text };

  if (block.type === "hero") {
    return (
      <div style={{ ...wrap, textAlign: "center", background: `linear-gradient(180deg, ${theme.primary}14, transparent)` }}>
        {str(d.badge) && (
          <span style={{ display: "inline-block", background: `${theme.primary}1a`, color: theme.primary, fontWeight: 700, fontSize: "0.78rem", padding: "6px 14px", borderRadius: "20px", marginBottom: "18px" }}>
            {str(d.badge)}
          </span>
        )}
        <h1 style={{ fontSize: "2.6rem", fontWeight: 800, margin: "0 0 14px", lineHeight: 1.15 }}>{str(d.title)}</h1>
        <p style={{ fontSize: "1.1rem", opacity: 0.7, maxWidth: "620px", margin: "0 auto 26px" }}>{str(d.subtitle)}</p>
        {str(d.button) && (
          <button style={{ background: theme.primary, color: "#fff", border: "none", borderRadius: "12px", padding: "14px 30px", fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}>{str(d.button)}</button>
        )}
      </div>
    );
  }

  if (block.type === "features") {
    const items = Array.isArray(d.items) ? (d.items as Array<Record<string, unknown>>) : [];
    return (
      <div style={wrap}>
        <h2 style={{ fontSize: "1.9rem", fontWeight: 800, textAlign: "center", margin: "0 0 32px" }}>{str(d.title)}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", maxWidth: "960px", margin: "0 auto" }}>
          {items.map((it, i) => (
            <div key={i} style={{ background: "#F8F9FF", borderRadius: "16px", padding: "24px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `${theme.primary}1a`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px", color: theme.primary }}>
                <Icon name={str(it.icon, "Star")} size={22} />
              </div>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "6px" }}>{str(it.title)}</div>
              <div style={{ opacity: 0.7, fontSize: "0.9rem", lineHeight: 1.5 }}>{str(it.text)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "pricing") {
    const plans = Array.isArray(d.plans) ? (d.plans as Array<Record<string, unknown>>) : [];
    return (
      <div style={{ ...wrap, background: "#F8F9FF" }}>
        <h2 style={{ fontSize: "1.9rem", fontWeight: 800, textAlign: "center", margin: "0 0 32px" }}>{str(d.title)}</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
          {plans.map((p, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "18px", padding: "28px", minWidth: "240px", border: `1.5px solid ${theme.primary}22`, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "8px" }}>{str(p.name)}</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: theme.primary, marginBottom: "16px" }}>{str(p.price)}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                {str(p.features).split("\n").filter(Boolean).map((f, j) => (
                  <div key={j} style={{ fontSize: "0.88rem", opacity: 0.75, display: "flex", gap: "8px", alignItems: "center" }}>
                    <Icon name="Check" size={16} /> {f}
                  </div>
                ))}
              </div>
              <button style={{ width: "100%", background: theme.primary, color: "#fff", border: "none", borderRadius: "10px", padding: "12px", fontWeight: 700, cursor: "pointer" }}>{str(p.button)}</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "text") {
    return (
      <div style={{ ...wrap, maxWidth: "760px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "1.7rem", fontWeight: 800, margin: "0 0 16px" }}>{str(d.title)}</h2>
        <p style={{ fontSize: "1rem", lineHeight: 1.7, opacity: 0.8, whiteSpace: "pre-wrap" }}>{str(d.text)}</p>
      </div>
    );
  }

  if (block.type === "form") {
    return (
      <div style={{ ...wrap, textAlign: "center" }}>
        <h2 style={{ fontSize: "1.9rem", fontWeight: 800, margin: "0 0 10px" }}>{str(d.title)}</h2>
        <p style={{ opacity: 0.7, margin: "0 0 24px" }}>{str(d.subtitle)}</p>
        <div style={{ maxWidth: "400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>
          <input placeholder="Ваше имя" style={{ padding: "13px 16px", borderRadius: "10px", border: "1.5px solid #E0E4F0", fontSize: "0.95rem" }} />
          <input placeholder="Телефон или email" style={{ padding: "13px 16px", borderRadius: "10px", border: "1.5px solid #E0E4F0", fontSize: "0.95rem" }} />
          <button style={{ background: theme.primary, color: "#fff", border: "none", borderRadius: "10px", padding: "14px", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>{str(d.button)}</button>
        </div>
      </div>
    );
  }

  if (block.type === "cta") {
    return (
      <div style={{ ...wrap, textAlign: "center", background: theme.primary, color: "#fff", borderRadius: "0" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 10px" }}>{str(d.title)}</h2>
        <p style={{ opacity: 0.9, margin: "0 0 24px" }}>{str(d.subtitle)}</p>
        <button style={{ background: "#fff", color: theme.primary, border: "none", borderRadius: "12px", padding: "14px 30px", fontWeight: 800, fontSize: "1rem", cursor: "pointer" }}>{str(d.button)}</button>
      </div>
    );
  }

  if (block.type === "footer") {
    return (
      <div style={{ ...wrap, background: "#0A0E27", color: "#fff", textAlign: "center", padding: "40px 32px" }}>
        <div style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: "8px" }}>{str(d.company)}</div>
        <div style={{ opacity: 0.6, fontSize: "0.85rem" }}>{str(d.text)}</div>
      </div>
    );
  }

  return null;
}
