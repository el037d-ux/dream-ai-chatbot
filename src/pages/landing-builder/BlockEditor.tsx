import Icon from "@/components/ui/icon";
import { Block } from "./blocks";

interface Props {
  block: Block;
  onChange: (data: Record<string, unknown>) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: "1.5px solid #E0E4F0", borderRadius: "9px",
  fontSize: "0.86rem", outline: "none", boxSizing: "border-box", background: "#FAFBFF",
};
const labelStyle: React.CSSProperties = {
  fontSize: "0.72rem", fontWeight: 700, color: "#8B92B8", textTransform: "uppercase",
  letterSpacing: "0.04em", display: "block", marginBottom: "5px",
};

function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {multiline ? (
        <textarea style={{ ...inputStyle, minHeight: "70px", resize: "vertical", fontFamily: "inherit" }} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

const s = (v: unknown, f = "") => (typeof v === "string" ? v : f);

export default function BlockEditor({ block, onChange }: Props) {
  const d = block.data;
  const set = (key: string, val: unknown) => onChange({ ...d, [key]: val });

  const setItem = (listKey: string, i: number, key: string, val: string) => {
    const list = Array.isArray(d[listKey]) ? [...(d[listKey] as Array<Record<string, unknown>>)] : [];
    list[i] = { ...list[i], [key]: val };
    set(listKey, list);
  };
  const addItem = (listKey: string, tpl: Record<string, unknown>) => {
    const list = Array.isArray(d[listKey]) ? [...(d[listKey] as Array<Record<string, unknown>>)] : [];
    set(listKey, [...list, tpl]);
  };
  const removeItem = (listKey: string, i: number) => {
    const list = Array.isArray(d[listKey]) ? [...(d[listKey] as Array<Record<string, unknown>>)] : [];
    set(listKey, list.filter((_, j) => j !== i));
  };

  const gap: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "12px" };

  if (block.type === "hero") {
    return (
      <div style={gap}>
        <Field label="Плашка" value={s(d.badge)} onChange={(v) => set("badge", v)} />
        <Field label="Заголовок" value={s(d.title)} onChange={(v) => set("title", v)} />
        <Field label="Подзаголовок" value={s(d.subtitle)} onChange={(v) => set("subtitle", v)} multiline />
        <Field label="Текст кнопки" value={s(d.button)} onChange={(v) => set("button", v)} />
      </div>
    );
  }

  if (block.type === "features") {
    const items = Array.isArray(d.items) ? (d.items as Array<Record<string, unknown>>) : [];
    return (
      <div style={gap}>
        <Field label="Заголовок" value={s(d.title)} onChange={(v) => set("title", v)} />
        {items.map((it, i) => (
          <div key={i} style={{ border: "1.5px solid #EEF0F8", borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
            <button onClick={() => removeItem("items", i)} style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", cursor: "pointer", color: "#C8CEE0" }}><Icon name="X" size={16} /></button>
            <Field label={`Пункт ${i + 1} · иконка`} value={s(it.icon)} onChange={(v) => setItem("items", i, "icon", v)} />
            <Field label="Заголовок" value={s(it.title)} onChange={(v) => setItem("items", i, "title", v)} />
            <Field label="Текст" value={s(it.text)} onChange={(v) => setItem("items", i, "text", v)} multiline />
          </div>
        ))}
        <button onClick={() => addItem("items", { icon: "Star", title: "Новое преимущество", text: "Описание" })}
          style={{ background: "#F4F6FF", border: "1.5px dashed #C8CEE0", borderRadius: "10px", padding: "10px", fontSize: "0.85rem", fontWeight: 600, color: "#0077FF", cursor: "pointer" }}>+ Добавить пункт</button>
      </div>
    );
  }

  if (block.type === "pricing") {
    const plans = Array.isArray(d.plans) ? (d.plans as Array<Record<string, unknown>>) : [];
    return (
      <div style={gap}>
        <Field label="Заголовок" value={s(d.title)} onChange={(v) => set("title", v)} />
        {plans.map((p, i) => (
          <div key={i} style={{ border: "1.5px solid #EEF0F8", borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
            <button onClick={() => removeItem("plans", i)} style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", cursor: "pointer", color: "#C8CEE0" }}><Icon name="X" size={16} /></button>
            <Field label={`Тариф ${i + 1} · название`} value={s(p.name)} onChange={(v) => setItem("plans", i, "name", v)} />
            <Field label="Цена" value={s(p.price)} onChange={(v) => setItem("plans", i, "price", v)} />
            <Field label="Что входит (каждый пункт с новой строки)" value={s(p.features)} onChange={(v) => setItem("plans", i, "features", v)} multiline />
            <Field label="Текст кнопки" value={s(p.button)} onChange={(v) => setItem("plans", i, "button", v)} />
          </div>
        ))}
        <button onClick={() => addItem("plans", { name: "Новый тариф", price: "0 ₽", features: "Пункт 1\nПункт 2", button: "Выбрать" })}
          style={{ background: "#F4F6FF", border: "1.5px dashed #C8CEE0", borderRadius: "10px", padding: "10px", fontSize: "0.85rem", fontWeight: 600, color: "#0077FF", cursor: "pointer" }}>+ Добавить тариф</button>
      </div>
    );
  }

  if (block.type === "text") {
    return (
      <div style={gap}>
        <Field label="Заголовок" value={s(d.title)} onChange={(v) => set("title", v)} />
        <Field label="Текст" value={s(d.text)} onChange={(v) => set("text", v)} multiline />
      </div>
    );
  }

  if (block.type === "form") {
    return (
      <div style={gap}>
        <Field label="Заголовок" value={s(d.title)} onChange={(v) => set("title", v)} />
        <Field label="Подзаголовок" value={s(d.subtitle)} onChange={(v) => set("subtitle", v)} />
        <Field label="Текст кнопки" value={s(d.button)} onChange={(v) => set("button", v)} />
      </div>
    );
  }

  if (block.type === "cta") {
    return (
      <div style={gap}>
        <Field label="Заголовок" value={s(d.title)} onChange={(v) => set("title", v)} />
        <Field label="Подзаголовок" value={s(d.subtitle)} onChange={(v) => set("subtitle", v)} />
        <Field label="Текст кнопки" value={s(d.button)} onChange={(v) => set("button", v)} />
      </div>
    );
  }

  if (block.type === "footer") {
    return (
      <div style={gap}>
        <Field label="Название компании" value={s(d.company)} onChange={(v) => set("company", v)} />
        <Field label="Текст" value={s(d.text)} onChange={(v) => set("text", v)} />
      </div>
    );
  }

  return null;
}
