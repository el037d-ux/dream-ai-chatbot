import { useState, useRef } from "react";
import { api } from "@/api";
import Icon from "@/components/ui/icon";

interface Props {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  height?: number;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload({ value, onChange, label = "Изображение", height = 130 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (file.size > 6 * 1024 * 1024) {
      setError("Файл больше 6 МБ");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await fileToBase64(file);
      const res = await api.uploadImage(file.type, dataUrl);
      onChange(res.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      {label && (
        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8B92B8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>{label}</div>
      )}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" style={{ display: "none" }} onChange={onFile} />
      {value ? (
        <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", border: "1.5px solid #E0E4F0" }}>
          <img src={value} alt="" style={{ width: "100%", height: `${height}px`, objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", top: "6px", right: "6px", display: "flex", gap: "6px" }}>
            <button onClick={pick} disabled={uploading}
              style={{ background: "rgba(255,255,255,0.95)", border: "none", borderRadius: "8px", padding: "6px 8px", cursor: "pointer", color: "#0077FF", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: 700 }}>
              <Icon name="RefreshCw" size={14} /> Заменить
            </button>
            <button onClick={() => onChange("")} disabled={uploading}
              style={{ background: "rgba(255,255,255,0.95)", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", color: "#d63031", display: "flex", alignItems: "center" }}>
              <Icon name="Trash2" size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={pick} disabled={uploading}
          style={{ width: "100%", height: `${height}px`, border: "1.5px dashed #C8CEE0", borderRadius: "10px", background: "#FAFBFF", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", color: "#8B92B8" }}>
          <Icon name={uploading ? "Loader" : "ImagePlus"} size={26} />
          <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{uploading ? "Загружаю..." : "Загрузить изображение"}</span>
        </button>
      )}
      {error && <div style={{ color: "#d63031", fontSize: "0.78rem", marginTop: "6px" }}>{error}</div>}
    </div>
  );
}
