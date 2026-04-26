import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/ef9ccef5-4bd7-4fe3-81e1-400d70465a9f/files/d00f5db1-1123-4f49-92fb-298f6714ea70.jpg";

// --- Stars Background ---
function Stars() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            "--duration": `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          } as React.CSSProperties}
        />
      ))}
      <div
        className="absolute w-96 h-96 rounded-full animate-orb-drift"
        style={{
          background: "radial-gradient(circle, hsl(270 60% 35% / 0.3), transparent 70%)",
          top: "10%", left: "20%",
          "--duration": "12s",
        } as React.CSSProperties}
      />
      <div
        className="absolute w-80 h-80 rounded-full animate-orb-drift"
        style={{
          background: "radial-gradient(circle, hsl(210 70% 35% / 0.25), transparent 70%)",
          top: "50%", right: "15%",
          "--duration": "9s",
          animationDelay: "3s",
        } as React.CSSProperties}
      />
      <div
        className="absolute w-64 h-64 rounded-full animate-orb-drift"
        style={{
          background: "radial-gradient(circle, hsl(240 80% 30% / 0.2), transparent 70%)",
          bottom: "20%", left: "40%",
          "--duration": "15s",
          animationDelay: "6s",
        } as React.CSSProperties}
      />
    </div>
  );
}

// --- Navigation ---
const navItems = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "chat", label: "Расшифровка", icon: "MessageCircle" },
  { id: "history", label: "История", icon: "ScrollText" },
  { id: "dictionary", label: "Словарь", icon: "BookOpen" },
  { id: "profile", label: "Профиль", icon: "User" },
  { id: "contact", label: "Контакты", icon: "Mail" },
];

function Navbar({ active, onNav }: { active: string; onNav: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "linear-gradient(to bottom, hsl(240 30% 5% / 0.95), transparent)" }}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => onNav("home")} className="flex items-center gap-3 group">
          <span className="text-2xl animate-moon-glow">🌙</span>
          <span className="font-cormorant text-2xl font-light tracking-widest text-shimmer">МОРФЕЙ</span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`nav-link text-sm tracking-wide font-golos ${active === item.id ? "active" : ""}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-foreground/70 hover:text-foreground">
          <Icon name={menuOpen ? "X" : "Menu"} size={22} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden glass-card mx-4 mb-4 rounded-2xl p-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNav(item.id); setMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${active === item.id ? "bg-primary/20 text-primary" : "text-foreground/70 hover:bg-white/5 hover:text-foreground"}`}
            >
              <Icon name={item.icon} size={16} />
              <span className="font-golos text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

// =====================
// SECTION: HOME
// =====================
function HomeSection({ onNav }: { onNav: (id: string) => void }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `url(${HERO_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(4px)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto section-enter">
        <div className="animate-float mb-8">
          <div className="relative inline-block">
            <span className="text-8xl md:text-9xl animate-moon-glow select-none">🌙</span>
          </div>
        </div>

        <h1 className="font-cormorant text-5xl md:text-7xl lg:text-8xl font-light mb-4 leading-none">
          <span className="text-shimmer">Расшифруй</span>
          <br />
          <span className="text-foreground/90 italic">свои сны</span>
        </h1>

        <p className="font-golos text-base md:text-lg text-foreground/60 max-w-xl mx-auto mb-12 leading-relaxed font-light">
          Погрузитесь в мир подсознания. ИИ раскроет скрытые послания ваших снов через призму теорий Фрейда и Юнга
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onNav("chat")}
            className="btn-mystical relative z-10 px-10 py-4 rounded-2xl font-golos text-sm tracking-widest uppercase font-medium text-white"
          >
            Начать расшифровку
          </button>
          <button
            onClick={() => onNav("dictionary")}
            className="glass-card px-10 py-4 rounded-2xl font-golos text-sm tracking-widest uppercase font-medium text-foreground/70 hover:text-foreground transition-all"
          >
            Словарь символов
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-24 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        {[
          { icon: "Brain", title: "Психоанализ", desc: "Методы Фрейда и Юнга для глубокой интерпретации", delay: "0.1s" },
          { icon: "Sparkles", title: "ИИ-анализ", desc: "Мгновенное толкование символов и образов", delay: "0.2s" },
          { icon: "BookMarked", title: "История снов", desc: "Сохраняйте и отслеживайте повторяющиеся образы", delay: "0.3s" },
        ].map((f) => (
          <div
            key={f.title}
            className="glass-card p-6 rounded-2xl text-center animate-fade-slide-up"
            style={{ animationDelay: f.delay, opacity: 0 }}
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(270 60% 40% / 0.4), hsl(210 70% 40% / 0.3))" }}>
              <Icon name={f.icon} size={22} className="text-primary" />
            </div>
            <h3 className="font-cormorant text-xl mb-2 text-foreground/90">{f.title}</h3>
            <p className="font-golos text-sm text-foreground/50 font-light leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-16 flex flex-col items-center gap-2 text-foreground/30">
        <span className="font-golos text-xs tracking-widest uppercase">Листайте вниз</span>
        <Icon name="ChevronDown" size={16} className="animate-bounce" />
      </div>
    </section>
  );
}

// =====================
// SECTION: CHAT
// =====================
const DEMO_MESSAGES = [
  {
    role: "ai",
    text: "Добро пожаловать в пространство снов. Опишите ваш сон подробно — каждая деталь имеет значение. Что вы видели, чувствовали, какие цвета и образы возникали?",
    time: "сейчас"
  }
];

function ChatSection() {
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input, time: "сейчас" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiResponses = [
        "Интересный сон. По теории Юнга, образ воды символизирует бессознательное, а её состояние — ваш эмоциональный мир. Бурное море указывает на внутренний конфликт, спокойное — на гармонию. Что вы чувствовали, глядя на воду?",
        "С точки зрения Фрейда, полёт во сне отражает желание свободы и освобождения от ограничений. Это архетипический образ трансформации. Расскажите — вы летели легко или с усилием?",
        "Ваш сон содержит несколько архетипических образов. Тень в вашем сне по Юнгу — это скрытые аспекты вашей личности. Возможно, вы подавляете часть своей натуры. Какой эта фигура была на ощупь — угрожающей или нейтральной?",
      ];
      const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      setMessages((prev) => [...prev, { role: "ai", text: response, time: "сейчас" }]);
      setIsTyping(false);
    }, 1800);
  };

  return (
    <section className="min-h-screen pt-24 pb-8 px-4 flex flex-col max-w-3xl mx-auto section-enter">
      <div className="mb-6 text-center">
        <h2 className="font-cormorant text-4xl md:text-5xl font-light mb-2">
          <span className="text-shimmer">Расшифровка сна</span>
        </h2>
        <p className="font-golos text-sm text-foreground/50">Психоанализ по Фрейду и Юнгу</p>
      </div>

      <div className="flex-1 glass-card rounded-3xl p-6 flex flex-col gap-4 mb-4 overflow-y-auto" style={{ maxHeight: "55vh" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {msg.role === "ai" && (
              <div className="w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center text-lg"
                style={{ background: "linear-gradient(135deg, hsl(270 60% 40%), hsl(210 70% 45%))" }}>
                🌙
              </div>
            )}
            <div className={`max-w-[80%] px-5 py-3 ${msg.role === "user" ? "chat-bubble-user text-white" : "chat-bubble-ai text-foreground/90"}`}>
              <p className="font-golos text-sm leading-relaxed font-light">{msg.text}</p>
              <span className="text-xs opacity-40 mt-1 block">{msg.time}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(270 60% 40%), hsl(210 70% 45%))" }}>🌙</div>
            <div className="chat-bubble-ai px-5 py-4">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="glass-card rounded-2xl p-3 flex gap-3 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Опишите ваш сон в деталях..."
          className="flex-1 bg-transparent resize-none outline-none font-golos text-sm text-foreground/90 placeholder:text-foreground/30 py-2 px-2 min-h-[44px] max-h-32 font-light"
          rows={2}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="btn-mystical relative z-10 w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed text-white"
        >
          <Icon name="Send" size={16} />
        </button>
      </div>

      <p className="text-center font-golos text-xs text-foreground/25 mt-3 font-light">
        Enter — отправить · Shift+Enter — новая строка
      </p>
    </section>
  );
}

// =====================
// SECTION: HISTORY
// =====================
const DEMO_DREAMS = [
  {
    id: 1, date: "24 апреля 2026", title: "Полёт над городом",
    preview: "Я летел над ночным городом, видел огни улиц...",
    tags: ["полёт", "свобода", "трансформация"], mood: "✨",
    interpretation: "Архетип трансформации — стремление к свободе и новым горизонтам"
  },
  {
    id: 2, date: "21 апреля 2026", title: "Тёмный лес",
    preview: "Шёл через густой лес, деревья становились выше...",
    tags: ["тень", "путь", "неизвестность"], mood: "🌑",
    interpretation: "По Юнгу — встреча с тенью, исследование бессознательного"
  },
  {
    id: 3, date: "18 апреля 2026", title: "Дом детства",
    preview: "Вернулся в старый дом, но комнаты были другие...",
    tags: ["прошлое", "идентичность", "память"], mood: "🏚",
    interpretation: "Символ «я» — поиск идентичности и связи с корнями"
  },
];

function HistorySection() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto section-enter">
      <div className="mb-10 text-center">
        <h2 className="font-cormorant text-4xl md:text-5xl font-light mb-2">
          <span className="text-shimmer">Книга снов</span>
        </h2>
        <p className="font-golos text-sm text-foreground/50">Ваши сны и их толкования</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { value: "12", label: "Снов записано" },
          { value: "8", label: "Расшифровано" },
          { value: "3", label: "Повторяющихся" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
            <div className="font-cormorant text-3xl text-primary font-light">{s.value}</div>
            <div className="font-golos text-xs text-foreground/40 mt-1 font-light">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {DEMO_DREAMS.map((dream) => (
          <div
            key={dream.id}
            onClick={() => setSelected(selected === dream.id ? null : dream.id)}
            className="glass-card rounded-2xl p-6 cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{dream.mood}</span>
                  <h3 className="font-cormorant text-xl font-light text-foreground/90">{dream.title}</h3>
                </div>
                <p className="font-golos text-sm text-foreground/50 font-light mb-3">{dream.preview}</p>
                <div className="flex flex-wrap gap-2">
                  {dream.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-golos font-light"
                      style={{ background: "hsl(270 60% 40% / 0.2)", color: "hsl(270 70% 75%)", border: "1px solid hsl(270 50% 35% / 0.3)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-golos text-xs text-foreground/30 font-light whitespace-nowrap">{dream.date}</span>
                <Icon name={selected === dream.id ? "ChevronUp" : "ChevronDown"} size={16} className="text-foreground/30" />
              </div>
            </div>

            {selected === dream.id && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ background: "hsl(270 60% 40% / 0.1)", border: "1px solid hsl(270 50% 35% / 0.2)" }}>
                  <span className="text-lg mt-0.5">🌙</span>
                  <p className="font-golos text-sm text-foreground/70 font-light leading-relaxed italic">{dream.interpretation}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="w-full mt-6 glass-card rounded-2xl py-4 font-golos text-sm text-foreground/50 hover:text-foreground transition-colors flex items-center justify-center gap-2">
        <Icon name="Plus" size={16} />
        Записать новый сон
      </button>
    </section>
  );
}

// =====================
// SECTION: DICTIONARY
// =====================
const SYMBOLS = [
  { emoji: "💧", name: "Вода", meaning: "Бессознательное, эмоции, жизненная сила. Спокойная вода — внутренняя гармония, бурная — конфликт.", school: "Юнг" },
  { emoji: "🌊", name: "Море / Океан", meaning: "Коллективное бессознательное, безграничный потенциал, первобытные инстинкты.", school: "Фрейд" },
  { emoji: "✈️", name: "Полёт", meaning: "Стремление к свободе, желание трансцендировать ограничения, духовный рост.", school: "Юнг" },
  { emoji: "🐍", name: "Змея", meaning: "Скрытая мудрость, трансформация, сексуальная энергия или страх. Двойственный символ.", school: "Фрейд" },
  { emoji: "🏚", name: "Дом", meaning: "Символ «я», психическое строение личности. Каждая комната — аспект подсознания.", school: "Юнг" },
  { emoji: "👁", name: "Глаз", meaning: "Самопознание, всевидение, надзор. Открытый глаз — осознанность, закрытый — отрицание.", school: "Юнг" },
  { emoji: "🌑", name: "Тень", meaning: "Вытесненные аспекты личности, страхи. Не зло, а неизученная часть себя.", school: "Юнг" },
  { emoji: "🌳", name: "Дерево", meaning: "Ось жизни, рост, связь с предками. Корни — прошлое, крона — будущие возможности.", school: "Юнг" },
  { emoji: "🔑", name: "Ключ / Замок", meaning: "Доступ к скрытому знанию или желание. Ключ — решение, замок — то, что ещё недоступно.", school: "Фрейд" },
  { emoji: "🪞", name: "Зеркало", meaning: "Самовосприятие, истинная природа, анима/анимус. Разбитое — искажённый образ себя.", school: "Юнг" },
  { emoji: "🌙", name: "Луна", meaning: "Архетип анимы, цикличность, интуиция, женское начало. Связь с бессознательным.", school: "Юнг" },
  { emoji: "⬇️", name: "Падение", meaning: "Страх провала, потери контроля. По Фрейду — тревога кастрации или потеря власти.", school: "Фрейд" },
];

function DictionarySection() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Все");

  const filtered = SYMBOLS.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.meaning.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Все" || s.school === filter;
    return matchSearch && matchFilter;
  });

  return (
    <section className="min-h-screen pt-24 pb-16 px-4 max-w-5xl mx-auto section-enter">
      <div className="mb-10 text-center">
        <h2 className="font-cormorant text-4xl md:text-5xl font-light mb-2">
          <span className="text-shimmer">Словарь символов</span>
        </h2>
        <p className="font-golos text-sm text-foreground/50">Архетипические образы и их психоаналитическое значение</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 glass-card rounded-xl px-4 py-3 flex items-center gap-3">
          <Icon name="Search" size={16} className="text-foreground/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск символа..."
            className="flex-1 bg-transparent outline-none font-golos text-sm text-foreground/80 placeholder:text-foreground/30 font-light"
          />
        </div>
        <div className="flex gap-2">
          {["Все", "Юнг", "Фрейд"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-3 rounded-xl font-golos text-sm font-light transition-all ${filter === f ? "btn-mystical relative z-10 text-white" : "glass-card text-foreground/60 hover:text-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div key={s.name} className="glass-card rounded-2xl p-5 hover:scale-[1.02] transition-transform cursor-default">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{s.emoji}</span>
              <div>
                <h3 className="font-cormorant text-xl font-light text-foreground/90">{s.name}</h3>
                <span className="font-golos text-xs px-2 py-0.5 rounded-full font-light"
                  style={{
                    background: s.school === "Юнг" ? "hsl(210 70% 40% / 0.25)" : "hsl(270 60% 40% / 0.25)",
                    color: s.school === "Юнг" ? "hsl(210 80% 75%)" : "hsl(270 70% 80%)"
                  }}>
                  {s.school}
                </span>
              </div>
            </div>
            <p className="font-golos text-sm text-foreground/55 font-light leading-relaxed">{s.meaning}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// =====================
// SECTION: PROFILE
// =====================
function ProfileSection() {
  const [activeTab, setActiveTab] = useState("saved");

  const savedDreams = [
    { title: "Полёт над морем", date: "24 апр", icon: "✨" },
    { title: "Встреча с тенью", date: "20 апр", icon: "🌑" },
    { title: "Белый дракон", date: "15 апр", icon: "🐉" },
  ];

  const settings = [
    { label: "Метод анализа по умолчанию", value: "Юнг + Фрейд", icon: "Brain" },
    { label: "Уведомления", value: "Включены", icon: "Bell" },
    { label: "Язык интерпретаций", value: "Русский", icon: "Languages" },
    { label: "Глубина анализа", value: "Расширенная", icon: "Layers" },
  ];

  return (
    <section className="min-h-screen pt-24 pb-16 px-4 max-w-3xl mx-auto section-enter">
      <div className="mb-10 text-center">
        <h2 className="font-cormorant text-4xl md:text-5xl font-light mb-2">
          <span className="text-shimmer">Личный кабинет</span>
        </h2>
      </div>

      <div className="glass-card rounded-3xl p-8 mb-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl flex-shrink-0"
          style={{ background: "linear-gradient(135deg, hsl(270 60% 40%), hsl(210 70% 45%))" }}>
          🌙
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-cormorant text-2xl font-light text-foreground/90 mb-1">Искатель снов</h3>
          <p className="font-golos text-sm text-foreground/40 font-light">С нами с апреля 2026</p>
          <div className="flex gap-4 mt-3 justify-center sm:justify-start">
            {[{ value: "12", label: "снов" }, { value: "8", label: "расшифровок" }, { value: "5", label: "дней подряд" }].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-cormorant text-xl text-primary">{s.value}</div>
                <div className="font-golos text-xs text-foreground/35 font-light">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <button className="btn-mystical relative z-10 px-6 py-2 rounded-xl font-golos text-sm text-white">Изменить</button>
      </div>

      <div className="flex gap-2 mb-6">
        {[{ id: "saved", label: "Сохранённые" }, { id: "settings", label: "Настройки" }].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 rounded-xl font-golos text-sm font-light transition-all ${activeTab === tab.id ? "btn-mystical relative z-10 text-white" : "glass-card text-foreground/60 hover:text-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "saved" && (
        <div className="flex flex-col gap-3">
          {savedDreams.map((d) => (
            <div key={d.title} className="glass-card rounded-2xl p-4 flex items-center gap-4">
              <span className="text-2xl">{d.icon}</span>
              <div className="flex-1">
                <h4 className="font-cormorant text-lg font-light text-foreground/90">{d.title}</h4>
                <p className="font-golos text-xs text-foreground/35 font-light">{d.date}</p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-foreground/30" />
            </div>
          ))}
          <button className="glass-card rounded-2xl py-4 font-golos text-sm text-foreground/40 flex items-center justify-center gap-2 mt-2">
            <Icon name="BookOpen" size={14} />
            Посмотреть все записи
          </button>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="flex flex-col gap-3">
          {settings.map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "hsl(270 50% 35% / 0.25)" }}>
                <Icon name={s.icon} size={16} className="text-primary/80" />
              </div>
              <div className="flex-1">
                <div className="font-golos text-sm text-foreground/70 font-light">{s.label}</div>
                <div className="font-golos text-xs text-primary/70 font-light mt-0.5">{s.value}</div>
              </div>
              <Icon name="ChevronRight" size={16} className="text-foreground/25" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// =====================
// SECTION: CONTACT
// =====================
function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section className="min-h-screen pt-24 pb-16 px-4 max-w-2xl mx-auto section-enter">
      <div className="mb-10 text-center">
        <h2 className="font-cormorant text-4xl md:text-5xl font-light mb-2">
          <span className="text-shimmer">Обратная связь</span>
        </h2>
        <p className="font-golos text-sm text-foreground/50">Вопросы, предложения, сотрудничество</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon: "Mail", label: "Email", value: "hello@morfey.ru" },
          { icon: "MessageSquare", label: "Telegram", value: "@morfey_dreams" },
          { icon: "Clock", label: "Ответ", value: "до 24 часов" },
        ].map((c) => (
          <div key={c.label} className="glass-card rounded-2xl p-5 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{ background: "hsl(270 50% 35% / 0.3)" }}>
              <Icon name={c.icon} size={18} className="text-primary/80" />
            </div>
            <div className="font-golos text-xs text-foreground/35 font-light mb-1">{c.label}</div>
            <div className="font-cormorant text-base text-foreground/80">{c.value}</div>
          </div>
        ))}
      </div>

      {sent ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <span className="text-6xl mb-6 block animate-float">🌙</span>
          <h3 className="font-cormorant text-3xl font-light text-foreground/90 mb-3">Сообщение отправлено</h3>
          <p className="font-golos text-sm text-foreground/50 font-light">Мы свяжемся с вами в течение суток</p>
          <button onClick={() => setSent(false)} className="mt-8 btn-mystical relative z-10 px-8 py-3 rounded-xl font-golos text-sm text-white">
            Написать снова
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="font-golos text-xs text-foreground/40 font-light uppercase tracking-wider mb-2 block">Ваше имя</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Александра"
                className="w-full bg-white/5 border border-border/50 rounded-xl px-4 py-3 font-golos text-sm text-foreground/80 placeholder:text-foreground/25 outline-none focus:border-primary/50 transition-colors font-light"
              />
            </div>
            <div>
              <label className="font-golos text-xs text-foreground/40 font-light uppercase tracking-wider mb-2 block">Email</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                type="email"
                className="w-full bg-white/5 border border-border/50 rounded-xl px-4 py-3 font-golos text-sm text-foreground/80 placeholder:text-foreground/25 outline-none focus:border-primary/50 transition-colors font-light"
              />
            </div>
          </div>
          <div>
            <label className="font-golos text-xs text-foreground/40 font-light uppercase tracking-wider mb-2 block">Сообщение</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Ваш вопрос или предложение..."
              rows={5}
              className="w-full bg-white/5 border border-border/50 rounded-xl px-4 py-3 font-golos text-sm text-foreground/80 placeholder:text-foreground/25 outline-none focus:border-primary/50 transition-colors resize-none font-light"
            />
          </div>
          <button type="submit" className="btn-mystical relative z-10 py-4 rounded-xl font-golos text-sm tracking-widest uppercase text-white font-medium">
            Отправить послание
          </button>
        </form>
      )}
    </section>
  );
}

// =====================
// MAIN APP
// =====================
export default function App() {
  const [section, setSection] = useState("home");

  const renderSection = () => {
    switch (section) {
      case "home": return <HomeSection onNav={setSection} />;
      case "chat": return <ChatSection />;
      case "history": return <HistorySection />;
      case "dictionary": return <DictionarySection />;
      case "profile": return <ProfileSection />;
      case "contact": return <ContactSection />;
      default: return <HomeSection onNav={setSection} />;
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "linear-gradient(160deg, hsl(240 35% 5%) 0%, hsl(250 40% 7%) 40%, hsl(235 30% 5%) 100%)" }}>
      <Stars />
      <Navbar active={section} onNav={setSection} />
      <main className="relative z-10">
        {renderSection()}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{ background: "linear-gradient(to top, hsl(240 35% 5% / 0.98), transparent)" }}>
        <div className="flex justify-around py-3 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${section === item.id ? "text-primary" : "text-foreground/30"}`}
            >
              <Icon name={item.icon} size={18} />
              <span className="font-golos text-[9px] font-light">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
