import { useState } from "react";
import { api } from "@/api";

interface Props {
  onAuth: (token: string, user: { id: number; email: string; name: string }) => void;
}

export default function AuthPage({ onAuth }: Props) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data =
        mode === "register"
          ? await api.register(email, password, name)
          : await api.login(email, password);
      localStorage.setItem("bf_token", data.token);
      onAuth(data.token, data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <a href="/" style={styles.logo}>
          <div style={styles.logoIcon}>⚡</div>
          <span style={styles.logoText}>BotFlow</span>
        </a>

        <h1 style={styles.title}>
          {mode === "register" ? "Создать аккаунт" : "Войти в кабинет"}
        </h1>
        <p style={styles.sub}>
          {mode === "register"
            ? "Начните создавать ботов бесплатно"
            : "Продолжите работу с вашими ботами"}
        </p>

        <form onSubmit={submit} style={styles.form}>
          {mode === "register" && (
            <div style={styles.field}>
              <label style={styles.label}>Ваше имя</label>
              <input
                style={styles.input}
                placeholder="Иван Иванов"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="ivan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Пароль</label>
            <input
              style={styles.input}
              type="password"
              placeholder={mode === "register" ? "Минимум 6 символов" : "Ваш пароль"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? "Подождите..." : mode === "register" ? "Зарегистрироваться →" : "Войти →"}
          </button>
        </form>

        <div style={styles.switch}>
          {mode === "register" ? (
            <>Уже есть аккаунт?{" "}
              <button style={styles.link} onClick={() => { setMode("login"); setError(""); }}>Войти</button>
            </>
          ) : (
            <>Нет аккаунта?{" "}
              <button style={styles.link} onClick={() => { setMode("register"); setError(""); }}>Зарегистрироваться</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: "24px",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
    marginBottom: "32px",
  },
  logoIcon: {
    width: "36px",
    height: "36px",
    background: "linear-gradient(135deg,#0077FF,#7B61FF)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "1.1rem",
  },
  logoText: { fontSize: "1.3rem", fontWeight: 800, color: "#0A0E27" },
  title: { fontSize: "1.75rem", fontWeight: 800, color: "#0A0E27", marginBottom: "8px" },
  sub: { color: "#8B92B8", fontSize: "0.95rem", marginBottom: "28px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.85rem", fontWeight: 600, color: "#4A5280" },
  input: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1.5px solid #E0E4F0",
    fontSize: "0.95rem",
    outline: "none",
    color: "#0A0E27",
    transition: "border 0.2s",
  },
  error: {
    background: "#fff0f0",
    border: "1px solid #ffd0d0",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "#d63031",
    fontSize: "0.875rem",
  },
  btn: {
    background: "linear-gradient(135deg,#0077FF,#7B61FF)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "14px",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "4px",
  },
  switch: { textAlign: "center", marginTop: "20px", color: "#8B92B8", fontSize: "0.9rem" },
  link: {
    background: "none",
    border: "none",
    color: "#0077FF",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
  },
};
