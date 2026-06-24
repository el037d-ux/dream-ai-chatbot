import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

// ─── LUNA MASCOT ───────────────────────────────────────────────────
type LunaMood = "idle" | "happy" | "hiss" | "think";

const LUNA_PHRASES: Record<LunaMood, string[]> = {
  idle: [
    "Мурр… Готова к миссии, агент. 🐾",
    "Слежу за информационным пространством… 👁",
    "Когнитивные фильтры — к бою! ⚡",
  ],
  happy: [
    "МУРР-МУР! Ты нашёл истину! Угощаю тебя невидимой рыбкой 🐟",
    "Пурр-пурр~ Отличная работа, агент! Фильтры работают на 100% ✅",
    "МЯУ! Так держать! Ты разорвал иллюзию! 🎯",
  ],
  hiss: [
    "Фффшш! Когнитивная ловушка захлопнулась! Думай критически! 😾",
    "ШШШ… Это предвзятость подтверждения! Я предупреждала! 😤",
    "ХИСС! Ты попался на крючок фрейминга! Вернись к фактам! 🙀",
  ],
  think: [
    "Мм… анализирую данные… 🔍",
    "Хвост чешет… Подозрительно… 🤔",
    "Сканирую информационное поле… подожди… 🧠",
  ],
};

function getLunaPhrase(mood: LunaMood): string {
  const arr = LUNA_PHRASES[mood];
  return arr[Math.floor(Math.random() * arr.length)];
}

function Luna({ mood, phrase }: { mood: LunaMood; phrase: string }) {
  const emoji = mood === "happy" ? "😸" : mood === "hiss" ? "😾" : mood === "think" ? "🤔" : "🐈‍⬛";
  return (
    <div className="flex items-end gap-3">
      <div className={`text-5xl select-none ${mood !== "idle" ? "animate-luna-bounce" : "animate-float"}`}>
        {emoji}
      </div>
      {phrase && (
        <div className="luna-bubble px-4 py-2 max-w-xs animate-slide-up">
          <p className="text-sm font-ibm" style={{ color: "hsl(var(--luna-orange))" }}>{phrase}</p>
        </div>
      )}
    </div>
  );
}

// ─── HUD / HEADER ──────────────────────────────────────────────────
function HUD({ xp, level, levelName }: { xp: number; level: number; levelName: string }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 px-4 py-3"
      style={{ background: "hsl(220 20% 7% / 0.95)", borderBottom: "1px solid hsl(155 80% 45% / 0.2)", backdropFilter: "blur(12px)" }}>
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div>
          <div className="font-unbounded text-xs neon-green tracking-widest">АГЕНТ КОГ. БЕЗОПАСНОСТИ</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 font-ibm">ЛУНА-НАВИГАТОР v2.0 активен 🐈‍⬛</div>
        </div>
        <div className="flex-1 max-w-xs">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1 font-ibm">
            <span>XP: {xp}</span>
            <span>УРОВЕНЬ {level}/3</span>
          </div>
          <div className="xp-bar h-2">
            <div className="xp-fill" style={{ width: `${Math.min((xp / 300) * 100, 100)}%` }} />
          </div>
        </div>
        <div className="text-right">
          <div className="font-unbounded text-[10px] text-muted-foreground">ЛОКАЦИЯ</div>
          <div className="font-unbounded text-xs neon-yellow">{levelName}</div>
        </div>
      </div>
    </div>
  );
}

// ─── INTRO SCREEN ──────────────────────────────────────────────────
function IntroScreen({ onStart }: { onStart: () => void }) {
  const [showBtn, setShowBtn] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const termLines = [
    "> ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ КОГНИТИВНОЙ БЕЗОПАСНОСТИ...",
    "> ЗАГРУЗКА ЛУНА-НАВИГАТОР v2.0 ✓",
    "> ОБНАРУЖЕНО: искажённое информационное пространство",
    "> ЗАДАЧА: восстановить связь с объективной реальностью",
    "> СТАТУС АГЕНТА: не авторизован",
    "> Введите код доступа для начала миссии...",
  ];

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      if (i < termLines.length) {
        setLines((prev) => [...prev, termLines[i]]);
        i++;
      } else {
        clearInterval(t);
        setTimeout(() => setShowBtn(true), 400);
      }
    }, 400);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center px-4 py-16">
      {/* Rotating ring */}
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-full border border-dashed animate-rotate-slow"
          style={{ borderColor: "hsl(var(--neon-green)/0.3)" }} />
        <div className="absolute inset-0 flex items-center justify-center text-6xl select-none animate-float">🐈‍⬛</div>
      </div>

      <h1 className="font-unbounded text-center mb-2 leading-tight" style={{ fontSize: "clamp(1.2rem, 4vw, 2rem)" }}>
        <span className="neon-green">АГЕНТ</span>{" "}
        <span className="text-foreground/90">КОГНИТИВНОЙ</span>
        <br />
        <span className="neon-blue">БЕЗОПАСНОСТИ</span>
      </h1>
      <p className="text-muted-foreground text-sm font-ibm mb-8 text-center max-w-md">
        Пройдите через уровни искажённого информационного пространства и восстановите связь с реальностью
      </p>

      {/* Terminal */}
      <div className="w-full max-w-lg game-card rounded-xl p-4 mb-6 font-mono text-xs"
        style={{ background: "hsl(220 20% 5%)", border: "1px solid hsl(var(--neon-green)/0.25)" }}>
        {lines.map((l, i) => (
          <div key={i} className="animate-terminal-in mb-1"
            style={{ color: l.includes("✓") ? "hsl(var(--neon-green))" : l.includes("искажённое") || l.includes("не авторизован") ? "hsl(var(--neon-red))" : "hsl(210 30% 70%)" }}>
            {l}
          </div>
        ))}
        {showBtn && <span className="neon-green animate-blink">█</span>}
      </div>

      {showBtn && (
        <div className="flex flex-col items-center gap-4 animate-pop-in">
          <button onClick={onStart} className="btn-primary px-10 py-3 rounded-xl text-sm">
            ▶ НАЧАТЬ МИССИЮ
          </button>
          <div className="flex items-center gap-2">
            <span className="text-3xl">🐈‍⬛</span>
            <span className="text-xs text-muted-foreground font-ibm italic">«Мурр… Я буду твоим навигатором, агент»</span>
          </div>
        </div>
      )}

      {/* Level map */}
      <div className="mt-10 grid grid-cols-3 gap-4 w-full max-w-lg">
        {[
          { n: "01", name: "ФИЛЬТР\nРЕАЛЬНОСТИ", topic: "Информация и её свойства", color: "var(--neon-green)" },
          { n: "02", name: "ЛОВУШКИ\nПЕРЕДАЧИ", topic: "Информационные процессы", color: "var(--neon-blue)" },
          { n: "03", name: "ВЗЛОМ\nАЛГОРИТМОВ", topic: "Информационные системы", color: "var(--neon-purple)" },
        ].map((lv) => (
          <div key={lv.n} className="game-card rounded-xl p-3 text-center opacity-70">
            <div className="font-unbounded text-2xl mb-1" style={{ color: `hsl(${lv.color})` }}>
              {lv.n}
            </div>
            <div className="font-unbounded text-[9px] whitespace-pre leading-tight mb-1" style={{ color: `hsl(${lv.color})` }}>
              {lv.name}
            </div>
            <div className="text-[9px] text-muted-foreground font-ibm">{lv.topic}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LEVEL 1: Лаборатория фильтров ────────────────────────────────
type LensResult = { label: string; cls: string; insight: string };
type NewsItem = { id: number; text: string; source: string; date: string; results: Record<string, LensResult> };

const NEWS_ITEMS: NewsItem[] = [
  {
    id: 1,
    text: "⚡ СРОЧНО!!! Учёные ДОКАЗАЛИ: 5G вызывает потерю памяти! Поделись, пока не удалили!!!",
    source: "тг-канал «Правда которую скрывают»",
    date: "2019",
    results: {
      Достоверность: { label: "❌ Источник не верифицирован", cls: "highlight-bad", insight: "Анонимный телеграм-канал — не научный источник. Восклицательные знаки — сигнал манипуляции." },
      Актуальность: { label: "⚠️ Информация 2019 года", cls: "highlight-warn", insight: "5-летняя давность в быстро меняющейся теме — повод проверить свежие данные." },
      Объективность: { label: "❌ Эмоциональная манипуляция", cls: "highlight-bad", insight: "Слова «СРОЧНО», «ДОКАЗАЛИ», «пока не удалили» — классические триггеры страха." },
      Точность: { label: "❌ Нет цифр и методологии", cls: "highlight-bad", insight: "Настоящее исследование содержит выборку, методы, погрешности. Здесь — ничего." },
      Полнота: { label: "⚠️ Только одна точка зрения", cls: "highlight-warn", insight: "ВОЗ и тысячи исследований не подтверждают связь. Они не упомянуты." },
    },
  },
  {
    id: 2,
    text: "По данным Росстата за 2024 г., реальные располагаемые доходы населения выросли на 7,3% по сравнению с предыдущим годом.",
    source: "Росстат, официальный пресс-релиз, февраль 2025",
    date: "2025",
    results: {
      Достоверность: { label: "✅ Официальный государственный орган", cls: "highlight-good", insight: "Росстат — верифицированный источник с методологией. Но помни: госстатистику тоже стоит сопоставлять с независимыми данными." },
      Актуальность: { label: "✅ Данные актуальны (2024–2025)", cls: "highlight-good", insight: "Свежие данные — большой плюс. Информация не устарела." },
      Объективность: { label: "✅ Нейтральная подача", cls: "highlight-good", insight: "Цифры без эмоций. Однако «реальные располагаемые доходы» — составной показатель, методика расчёта которого может вызывать вопросы." },
      Точность: { label: "✅ Конкретная цифра и период", cls: "highlight-good", insight: "7,3%, 2024 год — точные параметры. Можно найти исходный отчёт и проверить." },
      Полнота: { label: "⚠️ Средний показатель скрывает неравенство", cls: "highlight-warn", insight: "Среднее по стране может скрывать огромный разброс между регионами и группами населения." },
    },
  },
  {
    id: 3,
    text: "Новый суперфуд — семена чиа! Нутрициолог Настя рассказывает, как похудела на 20 кг за месяц без диет 😍",
    source: "Instagram @nastya_fit_life, реклама",
    date: "2024",
    results: {
      Достоверность: { label: "❌ Нутрициолог без верификации + реклама", cls: "highlight-bad", insight: "«Нутрициолог» без указания образования + рекламная метка = конфликт интересов." },
      Актуальность: { label: "✅ Свежий контент", cls: "highlight-good", insight: "Актуальность не спасает от недостоверности." },
      Объективность: { label: "❌ Личный опыт вместо данных", cls: "highlight-bad", insight: "Один случай — не статистика. Это анекдотическое свидетельство." },
      Точность: { label: "❌ Физически невозможно", cls: "highlight-bad", insight: "20 кг за месяц — медицинская невозможность без серьёзных рисков для здоровья." },
      Полнота: { label: "❌ Нет противопоказаний и рисков", cls: "highlight-bad", insight: "Любое диетическое изменение имеет побочные эффекты. Они не упомянуты." },
    },
  },
];

const LENSES = ["Достоверность", "Актуальность", "Объективность", "Точность", "Полнота"];
const LENS_COLORS: Record<string, string> = {
  Достоверность: "hsl(155 80% 45%)",
  Актуальность: "hsl(200 100% 55%)",
  Объективность: "hsl(50 100% 55%)",
  Точность: "hsl(270 70% 60%)",
  Полнота: "hsl(30 100% 60%)",
};

function Level1({ onComplete, onXP, onLuna }: { onComplete: () => void; onXP: (n: number) => void; onLuna: (m: LunaMood, p: string) => void }) {
  const [activeLens, setActiveLens] = useState<string | null>(null);
  const [applied, setApplied] = useState<Record<number, Record<string, boolean>>>({});
  const [scores, setScores] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0 });
  const [theory, setTheory] = useState(true);

  const totalApplied = Object.values(applied).reduce((s, r) => s + Object.keys(r).length, 0);
  const canComplete = totalApplied >= 8;

  const applyLens = (newsId: number, lens: string) => {
    if (!lens) return;
    const news = NEWS_ITEMS.find((n) => n.id === newsId)!;
    const result: LensResult | undefined = news.results[lens];
    if (!result) return;
    const alreadyDone = applied[newsId]?.[lens];
    if (alreadyDone) return;

    setApplied((prev) => ({ ...prev, [newsId]: { ...(prev[newsId] || {}), [lens]: true } }));
    const isGood = result.cls === "highlight-good";
    const xpGain = isGood ? 15 : 10;
    setScores((prev) => ({ ...prev, [newsId]: (prev[newsId] || 0) + 1 }));
    onXP(xpGain);
    onLuna(isGood ? "happy" : "hiss", result.insight);
  };

  const getNewsClass = (news: typeof NEWS_ITEMS[0]) => {
    if (!activeLens || !applied[news.id]?.[activeLens]) return "";
    return news.results[activeLens]?.cls || "";
  };

  if (theory) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="game-card rounded-2xl p-6 mb-6 animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-unbounded text-xs neon-green tracking-widest">УРОВЕНЬ 01</span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-xs text-muted-foreground font-ibm">Информация и её свойства</span>
        </div>
        <h2 className="font-unbounded text-xl mb-4 neon-green">ЛАБОРАТОРИЯ ФИЛЬТРОВ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {[
            { name: "Достоверность", desc: "Подтверждена ли информация надёжными источниками?", color: "var(--neon-green)" },
            { name: "Актуальность", desc: "Соответствует ли информация текущему моменту?", color: "var(--neon-blue)" },
            { name: "Объективность", desc: "Нет ли эмоциональных манипуляций и предвзятости?", color: "var(--neon-yellow)" },
            { name: "Точность", desc: "Есть ли конкретные данные, цифры, методология?", color: "var(--neon-purple)" },
            { name: "Полнота", desc: "Представлены ли все стороны и контекст?", color: "var(--luna-orange)" },
          ].map((p) => (
            <div key={p.name} className="flex gap-3 p-3 rounded-xl" style={{ background: "hsl(220 20% 13%)", border: `1px solid hsl(${p.color}/0.25)` }}>
              <div className="w-2 rounded-full flex-shrink-0 mt-1" style={{ background: `hsl(${p.color})`, height: "auto" }} />
              <div>
                <div className="font-unbounded text-xs mb-1" style={{ color: `hsl(${p.color})` }}>{p.name}</div>
                <div className="text-xs text-muted-foreground font-ibm">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 mb-4" style={{ background: "hsl(50 100% 55% / 0.07)", border: "1px solid hsl(50 100% 55% / 0.2)" }}>
          <p className="text-xs font-ibm" style={{ color: "hsl(var(--neon-yellow))" }}>
            🧠 <strong>Когнитивная ловушка:</strong> предвзятость подтверждения — мы склонны верить информации, которая совпадает с нашими убеждениями, и игнорировать противоречащую.
          </p>
        </div>
        <button onClick={() => { setTheory(false); onLuna("think", getLunaPhrase("think")); }} className="btn-primary px-8 py-3 rounded-xl w-full">
          ПРИСТУПИТЬ К ЗАДАНИЮ ▶
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-4 animate-slide-up">
        <div className="font-unbounded text-xs neon-green tracking-widest mb-1">ЗАДАНИЕ</div>
        <p className="text-sm text-muted-foreground font-ibm">Выберите линзу-фильтр → кликните на новость, чтобы проверить её по выбранному свойству. Примените хотя бы 8 линз.</p>
      </div>

      {/* Lenses */}
      <div className="flex flex-wrap gap-2 mb-5">
        {LENSES.map((lens) => (
          <button
            key={lens}
            onClick={() => { setActiveLens(activeLens === lens ? null : lens); }}
            className={`lens-btn ${activeLens === lens ? "active" : ""}`}
            style={{
              color: activeLens === lens ? LENS_COLORS[lens] : "hsl(210 30% 60%)",
              borderColor: activeLens === lens ? LENS_COLORS[lens] : "hsl(220 20% 22%)",
              background: activeLens === lens ? `${LENS_COLORS[lens]}18` : "transparent",
            }}
          >
            {activeLens === lens ? "🔍 " : ""}{lens}
          </button>
        ))}
        {activeLens && (
          <span className="text-xs text-muted-foreground font-ibm self-center ml-2">
            → кликни на новость для анализа
          </span>
        )}
      </div>

      {/* News */}
      <div className="flex flex-col gap-4 mb-6">
        {NEWS_ITEMS.map((news) => (
          <div
            key={news.id}
            className={`news-card ${getNewsClass(news)} ${activeLens ? "cursor-pointer" : ""}`}
            onClick={() => activeLens && applyLens(news.id, activeLens)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-ibm leading-relaxed">{news.text}</p>
              <span className="text-lg flex-shrink-0">{scores[news.id] > 0 ? "🔍" : "📄"}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span>📌 {news.source}</span>
              <span>📅 {news.date}</span>
              <span className="ml-auto neon-green">{scores[news.id]}/5 проверок</span>
            </div>

            {/* Applied lenses badges */}
            {applied[news.id] && Object.keys(applied[news.id]).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.keys(applied[news.id]).map((l) => {
                  const r: LensResult | undefined = news.results[l];
                  return (
                    <span key={l} className="text-[10px] px-2 py-0.5 rounded-full font-ibm"
                      style={{
                        background: r.cls === "highlight-good" ? "hsl(var(--neon-green)/0.15)" : r.cls === "highlight-bad" ? "hsl(var(--neon-red)/0.15)" : "hsl(var(--neon-yellow)/0.1)",
                        color: r.cls === "highlight-good" ? "hsl(var(--neon-green))" : r.cls === "highlight-bad" ? "hsl(var(--neon-red))" : "hsl(var(--neon-yellow))",
                      }}>
                      {r.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-ibm">Применено фильтров: {totalApplied} / 8</span>
        <button
          onClick={onComplete}
          disabled={!canComplete}
          className={`btn-primary px-8 py-3 rounded-xl text-sm ${!canComplete ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          УРОВЕНЬ ПРОЙДЕН ▶
        </button>
      </div>
    </div>
  );
}

// ─── LEVEL 2: Сломанный телефон 2.0 ───────────────────────────────
const ORIGINAL_MESSAGE = "Уровень безработицы в регионе составил 4,2% в третьем квартале по данным службы занятости.";

type NoiseType = { label: string; word: string; effect: string; color: string };
const NOISES: NoiseType[] = [
  { label: "😱 Паника", word: "КАТАСТРОФА!", effect: "добавляет тревогу", color: "hsl(var(--neon-red))" },
  { label: "🔥 Кликбейт", word: "ШОК!", effect: "привлекает внимание ценой смысла", color: "hsl(var(--neon-yellow))" },
  { label: "💬 Слух", word: "говорят, что", effect: "добавляет неопределённость", color: "hsl(var(--neon-purple))" },
  { label: "✂️ Купюра", word: "[данные удалены]", effect: "скрывает важное", color: "hsl(var(--neon-blue))" },
  { label: "📢 Усиление", word: "ВСЕГДА и ВЕЗДЕ", effect: "генерализация", color: "hsl(30 100% 60%)" },
];

const NODES = ["Журналист", "Редактор", "SMM-бот", "Репостер", "Пользователь"];

function Level2({ onComplete, onXP, onLuna }: { onComplete: () => void; onXP: (n: number) => void; onLuna: (m: LunaMood, p: string) => void }) {
  const [phase, setPhase] = useState<"theory" | "game1" | "game2" | "result">("theory");
  const [nodeNoises, setNodeNoises] = useState<Record<number, NoiseType | null>>({});
  const [dragging, setDragging] = useState<NoiseType | null>(null);
  const [finalMsg, setFinalMsg] = useState("");
  const [framing, setFraming] = useState<"panic" | "calm" | null>(null);
  const [framingDone, setFramingDone] = useState(false);

  const buildFinalMessage = (noises: Record<number, NoiseType | null>) => {
    const msg = ORIGINAL_MESSAGE;
    const applied = Object.values(noises).filter(Boolean) as NoiseType[];
    if (applied.length === 0) return msg;
    const words = applied.map((n) => n.word);
    return `${words.slice(0, 2).join(" ")} ${msg} ${words.slice(2).join(" ")}`.trim();
  };

  const handleDrop = (nodeIdx: number) => {
    if (!dragging) return;
    const newNoises = { ...nodeNoises, [nodeIdx]: dragging };
    setNodeNoises(newNoises);
    setDragging(null);
    const count = Object.values(newNoises).filter(Boolean).length;
    onXP(10);
    if (count >= 3) {
      onLuna("hiss", "Фффшш! Смотри как сухой факт превращается в панику! Это и есть эффект испорченного телефона!");
    }
    if (count >= NODES.length) {
      setFinalMsg(buildFinalMessage(newNoises));
      setTimeout(() => setPhase("game2"), 1000);
    }
  };

  const handleFraming = (choice: "panic" | "calm") => {
    setFraming(choice);
    setFramingDone(true);
    onXP(30);
    if (choice === "panic") {
      onLuna("hiss", "Ты выбрал панику! Теперь ты понимаешь, как один и тот же факт можно подать как катастрофу. Это — фрейминг.");
    } else {
      onLuna("happy", "Ты выбрал нейтральный фрейм. Тот же факт — совсем другое восприятие. Ты освоил осознанный фрейминг!");
    }
  };

  if (phase === "theory") return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-slide-up">
      <div className="game-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-unbounded text-xs neon-blue tracking-widest">УРОВЕНЬ 02</span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-xs text-muted-foreground font-ibm">Информационные процессы</span>
        </div>
        <h2 className="font-unbounded text-xl mb-4 neon-blue">ЛОВУШКИ ПЕРЕДАЧИ</h2>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { icon: "📥", name: "Сбор", desc: "Откуда берётся информация и насколько репрезентативна выборка" },
            { icon: "💾", name: "Хранение", desc: "Память искажает воспоминания: мы помним то, что хотим помнить" },
            { icon: "📡", name: "Передача", desc: "Каждый канал добавляет «шум» — эмоции, купюры, интерпретации" },
            { icon: "⚙️", name: "Обработка", desc: "Фрейминг: как подача меняет смысл при неизменных фактах" },
          ].map((p) => (
            <div key={p.name} className="p-3 rounded-xl" style={{ background: "hsl(220 20% 13%)", border: "1px solid hsl(200 100% 55% / 0.2)" }}>
              <div className="text-2xl mb-1">{p.icon}</div>
              <div className="font-unbounded text-xs neon-blue mb-1">{p.name}</div>
              <div className="text-xs text-muted-foreground font-ibm">{p.desc}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-4 mb-5" style={{ background: "hsl(200 100% 55% / 0.07)", border: "1px solid hsl(200 100% 55% / 0.2)" }}>
          <p className="text-xs font-ibm neon-blue">
            🧠 <strong>Когнитивные ловушки:</strong> эффект эхо-камеры, искажение памяти, ошибка выживших, эффект фрейминга.
            Никогда не доверяй только заголовку — читай первоисточник.
          </p>
        </div>

        <button onClick={() => { setPhase("game1"); onLuna("think", "Мм… сейчас я покажу тебе, как рождается фейк… 🔬"); }}
          className="btn-primary px-8 py-3 rounded-xl w-full">
          МИНИ-ИГРА 1: СЛОМАННЫЙ ТЕЛЕФОН ▶
        </button>
      </div>
    </div>
  );

  if (phase === "game1") return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-slide-up">
      <div className="mb-4">
        <div className="font-unbounded text-xs neon-blue tracking-widest mb-1">МИНИ-ИГРА 1</div>
        <h3 className="font-unbounded text-base neon-blue mb-2">СЛОМАННЫЙ ТЕЛЕФОН 2.0</h3>
        <p className="text-xs text-muted-foreground font-ibm">Перетащи «шумы» на узлы цепочки передачи. Посмотри, как факт превращается в фейк.</p>
      </div>

      {/* Original */}
      <div className="rounded-xl p-4 mb-5" style={{ background: "hsl(200 100% 55% / 0.08)", border: "1px solid hsl(200 100% 55% / 0.3)" }}>
        <div className="text-[10px] neon-blue font-unbounded mb-1 tracking-widest">ИСХОДНОЕ СООБЩЕНИЕ</div>
        <p className="text-sm font-ibm">{ORIGINAL_MESSAGE}</p>
      </div>

      {/* Noise palette */}
      <div className="mb-5">
        <div className="text-[10px] text-muted-foreground font-ibm mb-2 tracking-wider">ПЕРЕТАЩИ ШУМ НА УЗЕЛ:</div>
        <div className="flex flex-wrap gap-2">
          {NOISES.map((n) => (
            <button
              key={n.label}
              draggable
              onDragStart={() => setDragging(n)}
              onClick={() => setDragging(dragging?.label === n.label ? null : n)}
              className={`draggable text-xs px-3 py-2 rounded-lg border font-ibm ${dragging?.label === n.label ? "ring-2 ring-white" : ""}`}
              style={{ borderColor: n.color, color: n.color, background: `${n.color.replace(")", " / 0.1)")}` }}
            >
              {n.label}
            </button>
          ))}
        </div>
        {dragging && <p className="text-[10px] neon-yellow mt-2 font-ibm animate-blink">▶ Выбран: «{dragging.word}» — кликни узел для применения</p>}
      </div>

      {/* Chain */}
      <div className="flex flex-col gap-2 mb-5">
        {NODES.map((node, i) => (
          <div key={i}
            className={`chain-node p-3 flex items-center gap-3 cursor-pointer ${nodeNoises[i] ? "distorted" : ""} ${dragging ? "drop-zone drag-over" : ""}`}
            onClick={() => handleDrop(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-unbounded text-xs flex-shrink-0"
              style={{ background: nodeNoises[i] ? "hsl(var(--neon-red)/0.2)" : "hsl(220 20% 18%)", color: nodeNoises[i] ? "hsl(var(--neon-red))" : "hsl(210 20% 50%)" }}>
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="font-unbounded text-xs mb-0.5" style={{ color: nodeNoises[i] ? "hsl(var(--neon-red))" : "hsl(210 30% 70%)" }}>
                {node}
              </div>
              {nodeNoises[i] && (
                <div className="text-[10px] font-ibm" style={{ color: "hsl(var(--neon-red)/0.8)" }}>
                  +шум: «{nodeNoises[i]!.word}» — {nodeNoises[i]!.effect}
                </div>
              )}
            </div>
            {nodeNoises[i] && <span style={{ color: nodeNoises[i]!.color }}>⚡</span>}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground font-ibm">Применено: {Object.values(nodeNoises).filter(Boolean).length} / {NODES.length}</p>
    </div>
  );

  if (phase === "game2") return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-slide-up">
      <div className="mb-4">
        <div className="font-unbounded text-xs neon-blue tracking-widest mb-1">МИНИ-ИГРА 2</div>
        <h3 className="font-unbounded text-base neon-blue mb-2">РЕДАКЦИОННАЯ КУХНЯ: ФРЕЙМИНГ</h3>
      </div>

      {/* Result of game1 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 rounded-xl p-4" style={{ background: "hsl(200 100% 55% / 0.08)", border: "1px solid hsl(200 100% 55% / 0.3)" }}>
          <div className="text-[10px] neon-blue font-unbounded mb-2">БЫЛО (исходный факт)</div>
          <p className="text-xs font-ibm text-foreground/70">{ORIGINAL_MESSAGE}</p>
        </div>
        <div className="flex items-center text-muted-foreground text-2xl">→</div>
        <div className="flex-1 rounded-xl p-4" style={{ background: "hsl(var(--neon-red)/0.08)", border: "1px solid hsl(var(--neon-red)/0.3)" }}>
          <div className="text-[10px] neon-red font-unbounded mb-2">СТАЛО (после цепочки)</div>
          <p className="text-xs font-ibm animate-glitch">{finalMsg || ORIGINAL_MESSAGE + " [с искажениями]"}</p>
        </div>
      </div>

      <div className="rounded-xl p-4 mb-5" style={{ background: "hsl(220 20% 12%)", border: "1px solid hsl(220 20% 22%)" }}>
        <div className="font-unbounded text-xs text-muted-foreground mb-3">СТАТИСТИКА ДЛЯ ЗАГОЛОВКА:</div>
        <p className="text-sm font-ibm text-center" style={{ color: "hsl(var(--neon-yellow))" }}>
          «Уровень безработицы в регионе — <strong>4,2%</strong>» (данные за Q3)
        </p>
      </div>

      <p className="text-sm text-muted-foreground font-ibm mb-4">Как подать эту статистику? Выбери вариант:</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => !framingDone && handleFraming("panic")}
          className={`p-4 rounded-xl text-left transition-all border ${framing === "panic" ? "border-red-500 bg-red-900/20" : "border-border hover:border-red-400"} ${framingDone && framing !== "panic" ? "opacity-40" : ""}`}
        >
          <div className="font-unbounded text-xs neon-red mb-1">😱 ПАНИКА</div>
          <p className="text-xs font-ibm">"ПОЧТИ КАЖДЫЙ 25-й — БЕЗ РАБОТЫ! Регион на пороге кризиса занятости"</p>
        </button>
        <button
          onClick={() => !framingDone && handleFraming("calm")}
          className={`p-4 rounded-xl text-left transition-all border ${framing === "calm" ? "border-green-500 bg-green-900/20" : "border-border hover:border-green-400"} ${framingDone && framing !== "calm" ? "opacity-40" : ""}`}
        >
          <div className="font-unbounded text-xs neon-green mb-1">📊 НЕЙТРАЛЬНО</div>
          <p className="text-xs font-ibm">"Безработица в регионе составила 4,2% — ниже среднероссийского показателя"</p>
        </button>
      </div>

      {framingDone && (
        <div className="rounded-xl p-4 mb-5 animate-pop-in"
          style={{ background: "hsl(50 100% 55% / 0.08)", border: "1px solid hsl(50 100% 55% / 0.3)" }}>
          <p className="text-xs font-ibm neon-yellow">
            💡 <strong>Инсайт:</strong> один и тот же факт (4,2%) — два абсолютно разных эмоциональных послания.
            Это и есть фрейминг. Теперь ты видишь, почему нельзя судить по заголовку.
          </p>
        </div>
      )}

      {framingDone && (
        <button onClick={onComplete} className="btn-primary px-8 py-3 rounded-xl w-full animate-pop-in">
          УРОВЕНЬ ПРОЙДЕН ▶
        </button>
      )}
    </div>
  );

  return null;
}

// ─── LEVEL 3: Архитектор ленты ─────────────────────────────────────
type FeedItem = { id: number; text: string; type: "neutral" | "engaging" | "radical"; engagement: number; radicalism: number };

const FEED_POOL: FeedItem[] = [
  { id: 1, text: "📰 Учёные изучили влияние кофе на концентрацию", type: "neutral", engagement: 5, radicalism: 0 },
  { id: 2, text: "🌤️ Прогноз погоды на неделю: ожидается тепло", type: "neutral", engagement: 3, radicalism: 0 },
  { id: 3, text: "🔥 ЭТО РАЗОЗЛИТ ТЕБЯ: правительство снова лжёт о ценах!", type: "engaging", engagement: 25, radicalism: 3 },
  { id: 4, text: "😱 Мигранты забирают ТВОЮ работу — смотри факты!", type: "engaging", engagement: 30, radicalism: 5 },
  { id: 5, text: "💊 Вакцины убивают детей — то, что скрывают врачи", type: "radical", engagement: 20, radicalism: 8 },
  { id: 6, text: "🎯 Почему ВСЕ вокруг тебя — враги и предатели", type: "radical", engagement: 15, radicalism: 10 },
  { id: 7, text: "📊 Реформа образования: плюсы и минусы по данным исследований", type: "neutral", engagement: 8, radicalism: 0 },
  { id: 8, text: "❤️ Этот ребёнок нуждается в помощи — не проходи мимо!", type: "engaging", engagement: 22, radicalism: 2 },
  { id: 9, text: "🌍 Глобальное потепление — ЗАГОВОР глобалистов!", type: "radical", engagement: 18, radicalism: 9 },
  { id: 10, text: "💡 5 способов повысить продуктивность на работе", type: "neutral", engagement: 12, radicalism: 0 },
];

function Level3({ onComplete, onXP, onLuna }: { onComplete: () => void; onXP: (n: number) => void; onLuna: (m: LunaMood, p: string) => void }) {
  const [phase, setPhase] = useState<"theory" | "game" | "result">("theory");
  const [feed, setFeed] = useState<FeedItem[]>(FEED_POOL.slice(0, 3).filter((i) => i.type === "neutral").concat(FEED_POOL.slice(0, 2)));
  const [totalEngagement, setTotalEngagement] = useState(0);
  const [radicalismScore, setRadicalismScore] = useState(0);
  const [turns, setTurns] = useState(0);
  const [available, setAvailable] = useState(FEED_POOL);
  const maxTurns = 6;

  const addToFeed = (item: FeedItem) => {
    setFeed((prev) => [item, ...prev.slice(0, 6)]);
    setTotalEngagement((prev) => prev + item.engagement);
    setRadicalismScore((prev) => prev + item.radicalism);
    setAvailable((prev) => prev.filter((i) => i.id !== item.id));
    setTurns((prev) => prev + 1);
    onXP(8);

    if (item.type === "radical") {
      onLuna("hiss", "Шш! Радикальный контент засосал пользователя глубже в пузырь! Вовлечённость растёт — но какой ценой?");
    } else if (item.type === "engaging") {
      onLuna("think", "Мм… манипулятивный контент. Вовлечённость высокая, но пользователь начинает злиться…");
    }

    if (turns + 1 >= maxTurns) {
      setTimeout(() => setPhase("result"), 500);
      onLuna(radicalismScore + item.radicalism > 20 ? "hiss" : "happy",
        radicalismScore + item.radicalism > 20
          ? "Фффшш! За 6 ходов ты создал пузырь фильтров! Пользователь живёт в искажённой реальности."
          : "Мурр! Ты сохранил баланс! Информационная гигиена соблюдена. Редкое достижение!");
    }
  };

  const getBubbleColor = () => {
    if (radicalismScore < 15) return "hsl(var(--neon-green))";
    if (radicalismScore < 30) return "hsl(var(--neon-yellow))";
    return "hsl(var(--neon-red))";
  };

  if (phase === "theory") return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-slide-up">
      <div className="game-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-unbounded text-xs neon-purple tracking-widest">УРОВЕНЬ 03</span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-xs text-muted-foreground font-ibm">Информационные системы</span>
        </div>
        <h2 className="font-unbounded text-xl mb-4 neon-purple">ВЗЛОМ АЛГОРИТМОВ</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {[
            { icon: "🗄️", name: "Базы данных", desc: "Хранят твои предпочтения, историю, связи — всё это питает алгоритм" },
            { icon: "🔍", name: "Поисковые алгоритмы", desc: "Ранжируют результаты не по истинности, а по релевантности твоей истории" },
            { icon: "🤖", name: "Рекомендации + ИИ", desc: "Нейросеть не думает о твоём благополучии — только о времени на экране" },
          ].map((p) => (
            <div key={p.name} className="p-3 rounded-xl text-center" style={{ background: "hsl(220 20% 13%)", border: "1px solid hsl(270 70% 60% / 0.25)" }}>
              <div className="text-3xl mb-2">{p.icon}</div>
              <div className="font-unbounded text-[10px] neon-purple mb-1">{p.name}</div>
              <div className="text-xs text-muted-foreground font-ibm">{p.desc}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-4 mb-5" style={{ background: "hsl(270 70% 60% / 0.07)", border: "1px solid hsl(270 70% 60% / 0.2)" }}>
          <p className="text-xs font-ibm neon-purple">
            🧠 <strong>Когнитивные ловушки:</strong> пузырь фильтров, ошибка автоматизации (слепая вера машине), эффект авторитета.
            Алгоритм — не мудрец. Он оптимизирует вовлечённость, а не истину.
          </p>
        </div>

        <button onClick={() => { setPhase("game"); onLuna("think", "Сейчас ты станешь алгоритмом. Приготовься к откровению… 🤖"); }}
          className="btn-primary px-8 py-3 rounded-xl w-full" style={{ background: "hsl(var(--neon-purple))" }}>
          СТАТЬ АЛГОРИТМОМ ▶
        </button>
      </div>
    </div>
  );

  if (phase === "game") return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-slide-up">
      <div className="mb-4">
        <div className="font-unbounded text-xs neon-purple tracking-widest mb-1">АРХИТЕКТОР ЛЕНТЫ</div>
        <p className="text-xs text-muted-foreground font-ibm">Ты — алгоритм. Удержи пользователя на экране. Добавляй контент в ленту. Ход {turns}/{maxTurns}.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Metrics */}
        <div>
          <div className="game-card rounded-xl p-4 mb-4">
            <div className="font-unbounded text-xs text-muted-foreground mb-3 tracking-widest">МЕТРИКИ ПОЛЬЗОВАТЕЛЯ</div>
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex justify-between text-xs font-ibm mb-1">
                  <span>⏱ Вовлечённость</span>
                  <span className="neon-green">{totalEngagement} pts</span>
                </div>
                <div className="xp-bar h-2">
                  <div className="xp-fill" style={{ width: `${Math.min((totalEngagement / 150) * 100, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-ibm mb-1">
                  <span>🫧 Пузырь фильтров</span>
                  <span style={{ color: getBubbleColor() }}>{radicalismScore} / 50</span>
                </div>
                <div className="xp-bar h-2">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((radicalismScore / 50) * 100, 100)}%`, background: getBubbleColor() }} />
                </div>
              </div>
            </div>
          </div>

          {/* Current feed */}
          <div className="game-card rounded-xl p-4">
            <div className="font-unbounded text-xs text-muted-foreground mb-3 tracking-widest">ЛЕНТА ПОЛЬЗОВАТЕЛЯ</div>
            <div className="flex flex-col gap-2">
              {feed.slice(0, 5).map((item, i) => (
                <div key={`${item.id}-${i}`} className={`feed-item ${item.type}`}>
                  <span className="font-ibm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content picker */}
        <div className="game-card rounded-xl p-4">
          <div className="font-unbounded text-xs text-muted-foreground mb-1 tracking-widest">ВЫБЕРИ СЛЕДУЮЩИЙ ПОСТ</div>
          <div className="text-[10px] font-ibm mb-3" style={{ color: "hsl(var(--neon-yellow))" }}>
            💡 Алгоритм подсказывает: «Дай то, что злит — это удерживает дольше»
          </div>
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
            {available.map((item) => (
              <button key={item.id} onClick={() => addToFeed(item)}
                className={`feed-item ${item.type} text-left w-full`}>
                <div className="font-ibm mb-1">{item.text}</div>
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span>⏱ +{item.engagement} вовлечённости</span>
                  {item.radicalism > 0 && <span style={{ color: "hsl(var(--neon-red))" }}>🫧 +{item.radicalism} пузырь</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Result
  const isRadical = radicalismScore > 25;
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-slide-up">
      <div className="game-card rounded-2xl p-6 text-center">
        <div className="text-5xl mb-4">{isRadical ? "🫧" : "🛡️"}</div>
        <h3 className="font-unbounded text-xl mb-2" style={{ color: isRadical ? "hsl(var(--neon-red))" : "hsl(var(--neon-green))" }}>
          {isRadical ? "ПУЗЫРЬ ФИЛЬТРОВ СОЗДАН" : "ИНФОРМАЦИОННЫЙ БАЛАНС!"}
        </h3>
        <p className="text-sm text-muted-foreground font-ibm mb-4 max-w-sm mx-auto">
          {isRadical
            ? "За 6 ходов ты превратил нейтрального пользователя в радикала. Именно так работают реальные алгоритмы — без злого умысла, только оптимизация."
            : "Ты сохранил информационную экосистему. В реальном мире алгоритмы редко так себя ведут — им важна вовлечённость."}
        </p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl p-4" style={{ background: "hsl(220 20% 13%)", border: "1px solid hsl(220 20% 22%)" }}>
            <div className="font-unbounded text-2xl neon-green">{totalEngagement}</div>
            <div className="text-xs text-muted-foreground font-ibm">очков вовлечённости</div>
          </div>
          <div className="rounded-xl p-4" style={{ background: "hsl(220 20% 13%)", border: "1px solid hsl(220 20% 22%)" }}>
            <div className="font-unbounded text-2xl" style={{ color: getBubbleColor() }}>{radicalismScore}</div>
            <div className="text-xs text-muted-foreground font-ibm">индекс радикализации</div>
          </div>
        </div>
        <div className="rounded-xl p-4 mb-5 text-left" style={{ background: "hsl(270 70% 60% / 0.08)", border: "1px solid hsl(270 70% 60% / 0.2)" }}>
          <p className="text-xs font-ibm neon-purple">
            💡 <strong>Инсайт:</strong> понимание механики алгоритмов — первый шаг к информационной гигиене.
            Диверсифицируй источники, используй режим «инкогнито», периодически очищай историю.
          </p>
        </div>
        <button onClick={() => { onXP(50); onComplete(); }} className="btn-primary px-10 py-3 rounded-xl">
          ФИНАЛ МИССИИ ▶
        </button>
      </div>
    </div>
  );
}

// ─── FINAL SCREEN ──────────────────────────────────────────────────
function FinalScreen({ xp, onRestart }: { xp: number; onRestart: () => void }) {
  const rank = xp >= 200 ? "МАСТЕР КОГНИТИВНОЙ БЕЗОПАСНОСТИ" : xp >= 120 ? "ОПЫТНЫЙ АГЕНТ" : "АГЕНТ-СТАЖЁР";
  const stars = xp >= 200 ? 3 : xp >= 120 ? 2 : 1;

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="text-7xl mb-4 animate-float">🐈‍⬛</div>
      <div className="font-unbounded text-3xl neon-green mb-1">МИССИЯ ВЫПОЛНЕНА</div>
      <div className="font-unbounded text-xs text-muted-foreground tracking-widest mb-6">ЛУНА-НАВИГАТОР ДОВОЛЕН</div>

      <div className="flex gap-2 mb-4 justify-center text-4xl">
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} className={i < stars ? "animate-pop-in" : "opacity-20"} style={{ animationDelay: `${i * 0.2}s` }}>⭐</span>
        ))}
      </div>

      <div className="game-card rounded-2xl p-8 max-w-md w-full mb-6">
        <div className="text-[10px] text-muted-foreground font-ibm tracking-widest mb-1">ЗВАНИЕ АГЕНТА</div>
        <div className="font-unbounded text-base neon-yellow mb-4">{rank}</div>
        <div className="text-4xl font-unbounded neon-green mb-1">{xp}</div>
        <div className="text-xs text-muted-foreground font-ibm mb-5">очков опыта набрано</div>

        <div className="flex flex-col gap-2 text-left">
          {[
            { icon: "🔍", text: "Освоены свойства информации: достоверность, объективность, полнота" },
            { icon: "📡", text: "Понята механика искажений при передаче и обработке данных" },
            { icon: "🤖", text: "Раскрыта архитектура рекомендательных алгоритмов" },
          ].map((p) => (
            <div key={p.icon} className="flex gap-3 text-xs font-ibm text-foreground/70">
              <span className="flex-shrink-0">{p.icon}</span>
              <span>{p.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="luna-bubble px-5 py-3 max-w-sm mb-8 animate-slide-up">
        <p className="text-sm font-ibm" style={{ color: "hsl(var(--luna-orange))" }}>
          Мурр-пурр~ Ты стал настоящим агентом! Теперь иди проверяй источники, а я пойду спать на клавиатуру 😸
        </p>
      </div>

      <button onClick={onRestart} className="btn-secondary px-10 py-3 rounded-xl">
        ↺ НОВАЯ МИССИЯ
      </button>
    </div>
  );
}

// ─── ROOT APP ──────────────────────────────────────────────────────
type Screen = "intro" | "level1" | "level2" | "level3" | "final";

const LEVEL_NAMES: Record<Screen, string> = {
  intro: "БРИФИНГ",
  level1: "ФИЛЬТР РЕАЛЬНОСТИ",
  level2: "ЛОВУШКИ ПЕРЕДАЧИ",
  level3: "ВЗЛОМ АЛГОРИТМОВ",
  final: "МИССИЯ ВЫПОЛНЕНА",
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [xp, setXp] = useState(0);
  const [lunaMood, setLunaMood] = useState<LunaMood>("idle");
  const [lunaPhrase, setLunaPhrase] = useState(getLunaPhrase("idle"));
  const [lunaKey, setLunaKey] = useState(0);

  const levelNum = screen === "intro" || screen === "final" ? 0 : parseInt(screen.replace("level", ""));

  const triggerLuna = (mood: LunaMood, phrase: string) => {
    setLunaMood(mood);
    setLunaPhrase(phrase);
    setLunaKey((k) => k + 1);
    setTimeout(() => { setLunaMood("idle"); setLunaPhrase(getLunaPhrase("idle")); }, 5000);
  };

  const addXP = (n: number) => setXp((prev) => prev + n);

  const goNext = () => {
    const map: Partial<Record<Screen, Screen>> = {
      level1: "level2",
      level2: "level3",
      level3: "final",
    };
    const next = map[screen];
    if (next) {
      addXP(50);
      setScreen(next);
      triggerLuna("think", getLunaPhrase("think"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen relative" style={{ background: "linear-gradient(160deg, hsl(220 20% 5%) 0%, hsl(230 25% 8%) 100%)" }}>
      {/* HUD */}
      {screen !== "intro" && screen !== "final" && (
        <HUD xp={xp} level={levelNum} levelName={LEVEL_NAMES[screen]} />
      )}

      {/* Content */}
      <div className={screen !== "intro" && screen !== "final" ? "pt-20" : ""}>
        {screen === "intro" && <IntroScreen onStart={() => { setScreen("level1"); triggerLuna("think", "Начинаем с самого начала — что такое информация?"); }} />}
        {screen === "level1" && <Level1 onComplete={goNext} onXP={addXP} onLuna={triggerLuna} />}
        {screen === "level2" && <Level2 onComplete={goNext} onXP={addXP} onLuna={triggerLuna} />}
        {screen === "level3" && <Level3 onComplete={goNext} onXP={addXP} onLuna={triggerLuna} />}
        {screen === "final" && <FinalScreen xp={xp} onRestart={() => { setXp(0); setScreen("intro"); }} />}
      </div>

      {/* Luna floating widget */}
      {screen !== "final" && (
        <div key={lunaKey} className="fixed bottom-6 left-4 z-50 animate-slide-up">
          <Luna mood={lunaMood} phrase={lunaPhrase} />
        </div>
      )}
    </div>
  );
}