import { useEffect, useState } from "react";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import BotBuilder from "@/pages/BotBuilder";
import { api } from "@/api";
import LandingPage from "@/pages/LandingPage";

type Screen = "landing" | "auth" | "dashboard" | "builder";
interface User { id: number; email: string; name: string; }

export default function App() {
  const [screen, setScreenState] = useState<Screen>(
    () => (localStorage.getItem("bf_screen") as Screen) || "landing"
  );
  const [user, setUser] = useState<User | null>(null);
  const [botId, setBotIdState] = useState<number | null>(() => {
    const v = localStorage.getItem("bf_bot_id");
    return v ? Number(v) : null;
  });
  const [checking, setChecking] = useState(true);

  const setScreen = (s: Screen) => {
    localStorage.setItem("bf_screen", s);
    setScreenState(s);
  };
  const setBotId = (id: number | null) => {
    if (id == null) localStorage.removeItem("bf_bot_id");
    else localStorage.setItem("bf_bot_id", String(id));
    setBotIdState(id);
  };

  useEffect(() => {
    const token = localStorage.getItem("bf_token");
    const savedScreen = localStorage.getItem("bf_screen") as Screen | null;
    if (!token) {
      if (savedScreen && savedScreen !== "landing" && savedScreen !== "auth") setScreen("landing");
      setChecking(false);
      return;
    }
    api.me().then((d) => {
      setUser(d.user);
      if (!savedScreen || savedScreen === "landing" || savedScreen === "auth") {
        setScreen("dashboard");
      }
    }).catch(() => {
      localStorage.removeItem("bf_token");
      setScreen("landing");
    }).finally(() => setChecking(false));
  }, []);

  const onAuth = (_token: string, u: User) => {
    setUser(u);
    setScreen("dashboard");
  };

  const onLogout = () => {
    setUser(null);
    setBotId(null);
    setScreen("landing");
  };

  const onOpenBot = (id: number) => {
    setBotId(id);
    setScreen("builder");
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#8B92B8" }}>
        Загрузка...
      </div>
    );
  }

  if (screen === "builder" && botId && user) {
    return <BotBuilder botId={botId} onBack={() => setScreen("dashboard")} />;
  }
  if (screen === "dashboard" && user) {
    return <Dashboard user={user} onLogout={onLogout} onOpenBot={onOpenBot} onGoHome={() => setScreen("landing")} />;
  }
  if (screen === "auth") {
    return <AuthPage onAuth={onAuth} />;
  }
  return <LandingPage onRegister={() => setScreen("auth")} onLogin={() => setScreen("auth")} />;
}