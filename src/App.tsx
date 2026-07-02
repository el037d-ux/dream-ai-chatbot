import { useEffect, useState } from "react";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import BotBuilder from "@/pages/BotBuilder";
import LandingBuilder from "@/pages/LandingBuilder";
import HelpPage from "@/pages/HelpPage";
import { api } from "@/api";
import LandingPage from "@/pages/LandingPage";

type Screen = "landing" | "auth" | "dashboard" | "builder" | "landingBuilder" | "help";
interface User { id: number; email: string; name: string; }

export default function App() {
  const [screen, setScreenState] = useState<Screen>("landing");
  const [user, setUser] = useState<User | null>(null);
  const [botId, setBotIdState] = useState<number | null>(() => {
    const v = localStorage.getItem("bf_bot_id");
    return v ? Number(v) : null;
  });
  const [landingId, setLandingId] = useState<number | null>(null);
  const [checking, setChecking] = useState(true);

  const setScreen = (s: Screen) => {
    setScreenState(s);
  };
  const setBotId = (id: number | null) => {
    if (id == null) localStorage.removeItem("bf_bot_id");
    else localStorage.setItem("bf_bot_id", String(id));
    setBotIdState(id);
  };

  useEffect(() => {
    const token = localStorage.getItem("bf_token");
    if (!token) {
      setChecking(false);
      return;
    }
    api.me().then((d) => {
      setUser(d.user);
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
    setBotId(null);
    setScreen("landing");
  };

  const onOpenBot = (id: number) => {
    setBotId(id);
    setScreen("builder");
  };

  const onOpenLanding = (id: number) => {
    setLandingId(id);
    setScreen("landingBuilder");
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
  if (screen === "landingBuilder" && landingId && user) {
    return <LandingBuilder landingId={landingId} onBack={() => setScreen("dashboard")} />;
  }
  if (screen === "help") {
    return <HelpPage onBack={() => setScreen(user ? "dashboard" : "landing")} />;
  }
  if (screen === "dashboard" && user) {
    return <Dashboard user={user} onLogout={onLogout} onOpenBot={onOpenBot} onOpenLanding={onOpenLanding} onOpenHelp={() => setScreen("help")} onGoHome={() => setScreen("landing")} />;
  }
  if (screen === "auth") {
    return <AuthPage onAuth={onAuth} />;
  }
  return <LandingPage onRegister={() => setScreen(user ? "dashboard" : "auth")} onLogin={() => setScreen(user ? "dashboard" : "auth")} />;
}