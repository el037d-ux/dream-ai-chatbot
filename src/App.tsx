import { useEffect, useState } from "react";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import BotBuilder from "@/pages/BotBuilder";
import { api } from "@/api";
import LandingPage from "@/pages/LandingPage";

type Screen = "landing" | "auth" | "dashboard" | "builder";
interface User { id: number; email: string; name: string; }

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [user, setUser] = useState<User | null>(null);
  const [botId, setBotId] = useState<number | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("bf_token");
    if (!token) { setChecking(false); return; }
    api.me().then((d) => {
      setUser(d.user);
      setScreen("dashboard");
    }).catch(() => {
      localStorage.removeItem("bf_token");
    }).finally(() => setChecking(false));
  }, []);

  const onAuth = (_token: string, u: User) => {
    setUser(u);
    setScreen("dashboard");
  };

  const onLogout = () => {
    setUser(null);
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
    return <Dashboard user={user} onLogout={onLogout} onOpenBot={onOpenBot} />;
  }
  if (screen === "auth") {
    return <AuthPage onAuth={onAuth} />;
  }
  return <LandingPage onRegister={() => setScreen("auth")} />;
}
