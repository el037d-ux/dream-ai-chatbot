interface Props { onBack: () => void; }

const S = {
  page: { minHeight: "100vh", background: "#F4F6FF", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" } as React.CSSProperties,
  topbar: { background: "#fff", borderBottom: "1px solid #E8EBF5", padding: "14px 28px", display: "flex", alignItems: "center", gap: "16px", position: "sticky" as const, top: 0, zIndex: 100 },
  backBtn: { background: "#F4F6FF", border: "1.5px solid #E0E4F0", borderRadius: "9px", padding: "8px 16px", cursor: "pointer", color: "#4A5280", fontWeight: 600, fontSize: "0.88rem" },
  title: { fontWeight: 800, fontSize: "1.1rem", color: "#0A0E27" },
  wrap: { maxWidth: "860px", margin: "0 auto", padding: "40px 24px 80px" },
  hero: { textAlign: "center" as const, marginBottom: "48px" },
  heroTitle: { fontSize: "2rem", fontWeight: 800, color: "#0A0E27", margin: "0 0 10px" },
  heroSub: { color: "#8B92B8", fontSize: "1rem" },
  toc: { background: "#fff", borderRadius: "16px", padding: "24px 28px", marginBottom: "36px", border: "1.5px solid #E8EBF5" },
  tocTitle: { fontWeight: 700, color: "#0A0E27", fontSize: "0.95rem", marginBottom: "14px" },
  tocList: { display: "flex", flexWrap: "wrap" as const, gap: "8px" },
  tocItem: { background: "#F4F6FF", border: "1.5px solid #E0E4F0", borderRadius: "8px", padding: "6px 14px", fontSize: "0.84rem", color: "#0077FF", fontWeight: 600, cursor: "pointer", textDecoration: "none" as const },
  section: { background: "#fff", borderRadius: "16px", padding: "28px 32px", marginBottom: "20px", border: "1.5px solid #E8EBF5" },
  h2: { fontSize: "1.25rem", fontWeight: 800, color: "#0A0E27", margin: "0 0 6px", display: "flex", alignItems: "center", gap: "10px" },
  h2sub: { color: "#8B92B8", fontSize: "0.85rem", marginBottom: "20px" },
  h3: { fontSize: "1rem", fontWeight: 700, color: "#0A0E27", margin: "20px 0 8px" },
  p: { color: "#4A5280", fontSize: "0.92rem", lineHeight: 1.65, margin: "0 0 10px" },
  tip: { background: "rgba(0,119,255,0.07)", border: "1.5px solid rgba(0,119,255,0.18)", borderRadius: "10px", padding: "12px 16px", fontSize: "0.88rem", color: "#0A5280", lineHeight: 1.55, margin: "12px 0" },
  warn: { background: "rgba(255,184,0,0.08)", border: "1.5px solid rgba(255,184,0,0.3)", borderRadius: "10px", padding: "12px 16px", fontSize: "0.88rem", color: "#7A5800", lineHeight: 1.55, margin: "12px 0" },
  card: { border: "1.5px solid #E8EBF5", borderRadius: "12px", padding: "16px 18px", marginBottom: "10px" },
  cardTitle: { fontWeight: 700, fontSize: "0.95rem", color: "#0A0E27", display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" },
  cardText: { color: "#4A5280", fontSize: "0.88rem", lineHeight: 1.55 },
  badge: (color: string) => ({ display: "inline-block", background: color + "22", color, borderRadius: "6px", padding: "2px 10px", fontSize: "0.75rem", fontWeight: 700 } as React.CSSProperties),
  step: { display: "flex", gap: "14px", marginBottom: "14px" } as React.CSSProperties,
  stepNum: (color: string) => ({ width: "28px", height: "28px", borderRadius: "50%", background: color, color: "#fff", fontWeight: 800, fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" } as React.CSSProperties),
  stepBody: { flex: 1 } as React.CSSProperties,
  kbd: { background: "#F4F6FF", border: "1.5px solid #E0E4F0", borderRadius: "5px", padding: "2px 8px", fontSize: "0.8rem", fontFamily: "monospace", color: "#0A0E27" } as React.CSSProperties,
  divider: { height: "1px", background: "#F0F2F8", margin: "20px 0" } as React.CSSProperties,
};

const NODE_TYPES = [
  { icon: "💬", label: "Триггер", color: "#00D4AA", desc: "Стартовая точка сценария. Бот отправляет первое сообщение, когда пользователь пишет в первый раз." },
  { icon: "📤", label: "Сообщение", color: "#0077FF", desc: "Отправляет текст пользователю. Можно добавить кнопки и картинку." },
  { icon: "🔀", label: "Условие", color: "#FFB800", desc: "Ветвит сценарий по ключевым словам. В названии укажи слова через запятую." },
  { icon: "⚡", label: "Действие", color: "#7B61FF", desc: "Собирает email в базу лидов или отправляет данные на Webhook-сервер." },
  { icon: "🤖", label: "AI-ответ", color: "#FF6B6B", desc: "Активирует режим GPT. Бот будет отвечать по твоему AI-промпту на все сообщения." },
];

const PROMPT_SECTIONS = [
  { icon: "🎭", label: "Роль и личность", color: "#7B61FF", desc: "Имя бота, его роль (кто он), черты характера." },
  { icon: "🎯", label: "Цель и задачи", color: "#0077FF", desc: "Главная задача бота и конкретные шаги для её достижения." },
  { icon: "🎨", label: "Тон и стиль", color: "#00D4AA", desc: "Обращение (ты/Вы), тональность, использование эмодзи, структура ответов." },
  { icon: "🚫", label: "Правила и ограничения", color: "#FF6B6B", desc: "Что бот не должен говорить, какие темы избегать." },
  { icon: "📋", label: "Формат ответа", color: "#FFB800", desc: "Длина ответов, использование списков, жирного текста и т.д." },
  { icon: "💡", label: "Примеры диалогов", color: "#E040FB", desc: "2–3 примера «вопрос → идеальный ответ» для повышения точности." },
];

export default function HelpPage({ onBack }: Props) {
  return (
    <div style={S.page}>
      <div style={S.topbar}>
        <button style={S.backBtn} onClick={onBack}>← Назад</button>
        <span style={S.title}>📖 Инструкция пользователя</span>
      </div>

      <div style={S.wrap}>
        {/* Hero */}
        <div style={S.hero}>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🤖</div>
          <h1 style={S.heroTitle}>Конструктор чат-бота BotFlow</h1>
          <p style={S.heroSub}>Полная инструкция — от создания первого бота до подключения ВКонтакте</p>
        </div>

        {/* TOC */}
        <div style={S.toc}>
          <div style={S.tocTitle}>Содержание</div>
          <div style={S.tocList}>
            {["1. Первый бот", "2. Схема сценария", "3. Типы узлов", "4. Кнопки ответов", "5. Картинки", "6. AI-промпт", "7. Тест-чат", "8. ВКонтакте", "9. Лендинги"].map((t) => (
              <a key={t} style={S.tocItem} href={`#s${t[0]}`}>{t}</a>
            ))}
          </div>
        </div>

        {/* 1. Первый бот */}
        <div style={S.section} id="s1">
          <h2 style={S.h2}><span>1</span> Создание первого бота</h2>
          <p style={S.h2sub}>Займёт 2 минуты</p>

          <div style={S.step}>
            <div style={S.stepNum("#0077FF")}>1</div>
            <div style={S.stepBody}>
              <div style={{ fontWeight: 700, color: "#0A0E27", marginBottom: "4px" }}>Открой раздел «Мои боты»</div>
              <p style={S.p}>В левом меню кабинета нажми «🤖 Мои боты», затем кнопку <strong>«+ Создать бота»</strong>. Введи название и нажми «Создать».</p>
            </div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum("#0077FF")}>2</div>
            <div style={S.stepBody}>
              <div style={{ fontWeight: 700, color: "#0A0E27", marginBottom: "4px" }}>Нажми «Открыть» → попадёшь в конструктор</div>
              <p style={S.p}>На схеме уже есть узел <span style={S.badge("#00D4AA")}>💬 Триггер</span> — стартовая точка. Он отправит первое сообщение, когда пользователь напишет боту.</p>
            </div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum("#0077FF")}>3</div>
            <div style={S.stepBody}>
              <div style={{ fontWeight: 700, color: "#0A0E27", marginBottom: "4px" }}>Дважды кликни на узел — откроется панель настройки</div>
              <p style={S.p}>Измени текст приветствия в поле «Текст сообщения» и нажми <strong>«Применить»</strong>.</p>
            </div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum("#0077FF")}>4</div>
            <div style={S.stepBody}>
              <div style={{ fontWeight: 700, color: "#0A0E27", marginBottom: "4px" }}>Сохрани бота</div>
              <p style={S.p}>Нажми <strong>«💾 Сохранить»</strong> в верхней панели. Готово — базовый бот создан.</p>
            </div>
          </div>

          <div style={S.tip}>💡 <strong>Совет:</strong> После каждого изменения нажимай «Применить» в панели узла, а потом «Сохранить» в шапке — это разные действия.</div>
        </div>

        {/* 2. Схема */}
        <div style={S.section} id="s2">
          <h2 style={S.h2}><span>2</span> Работа со схемой сценария</h2>
          <p style={S.h2sub}>Добавление, перемещение и соединение узлов</p>

          <h3 style={S.h3}>Добавить узел</h3>
          <p style={S.p}>Нажми кнопку <strong>«+ Добавить блок»</strong> в верхней панели и выбери тип. Узел появится на схеме — перетащи его в нужное место.</p>

          <h3 style={S.h3}>Переместить узел</h3>
          <p style={S.p}>Зажми и тяни узел мышкой. Схема расширяется автоматически.</p>

          <h3 style={S.h3}>Соединить узлы</h3>
          <div style={S.step}>
            <div style={S.stepNum("#7B61FF")}>1</div>
            <div style={S.stepBody}><p style={S.p}>Нажми на <strong>нижнюю цветную точку</strong> узла-источника — она является «выходом».</p></div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum("#7B61FF")}>2</div>
            <div style={S.stepBody}><p style={S.p}>Внизу экрана появится подсказка. Нажми на <strong>верхнюю серую точку</strong> узла-получателя — она является «входом».</p></div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum("#7B61FF")}>3</div>
            <div style={S.stepBody}><p style={S.p}>Между узлами появится синяя стрелка — это связь.</p></div>
          </div>

          <h3 style={S.h3}>Удалить узел или связь</h3>
          <p style={S.p}>Открой узел двойным кликом и нажми <strong>«🗑 Удалить»</strong> в нижней части панели. Все связи этого узла удалятся автоматически.</p>
          <p style={S.p}>Чтобы удалить только связь — выдели её кликом на схеме, нажми <span style={S.kbd}>Delete</span>.</p>

          <h3 style={S.h3}>Редактировать узел</h3>
          <p style={S.p}>Дважды кликни по узлу или выбери его одним кликом — справа откроется панель. Все поля редактируются там. После изменений нажми <strong>«Применить»</strong>.</p>

          <div style={S.tip}>💡 Можно изменить <strong>тип узла</strong> прямо в панели через выпадающий список — без удаления и создания нового.</div>
        </div>

        {/* 3. Типы узлов */}
        <div style={S.section} id="s3">
          <h2 style={S.h2}><span>3</span> Типы узлов</h2>
          <p style={S.h2sub}>Каждый узел выполняет свою роль в сценарии</p>

          {NODE_TYPES.map((n) => (
            <div key={n.label} style={{ ...S.card, borderLeft: `4px solid ${n.color}` }}>
              <div style={S.cardTitle}>
                <span style={{ fontSize: "1.2rem" }}>{n.icon}</span>
                <span style={{ color: n.color }}>{n.label}</span>
              </div>
              <p style={S.cardText}>{n.desc}</p>
            </div>
          ))}

          <div style={S.divider} />

          <h3 style={S.h3}>Узел «Действие» — подробнее</h3>
          <p style={S.p}>У этого узла два режима, которые переключаются внутри панели:</p>
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.badge("#7B61FF")}>Webhook</span></div>
            <p style={S.cardText}>Когда пользователь достигает этого узла, бот отправляет HTTP-запрос на твой сервер с данными диалога. Укажи URL, метод (POST/GET/PUT) и опционально секретный ключ для проверки подписи.</p>
          </div>
          <div style={S.card}>
            <div style={S.cardTitle}><span style={S.badge("#E040FB")}>Сбор email</span></div>
            <p style={S.cardText}>Бот запрашивает у пользователя email и сохраняет его в раздел «Лиды». Можно включить валидацию формата и задать своё сообщение при ошибке.</p>
          </div>

          <h3 style={S.h3}>Узел «Условие» — как работает ветвление</h3>
          <p style={S.p}>В поле <strong>«Название»</strong> укажи ключевые слова через запятую: <span style={S.kbd}>да,конечно,хочу</span></p>
          <p style={S.p}>Если пользователь напишет любое из этих слов — бот пойдёт по ветке этого условия. Из одного узла можно сделать несколько условий — для каждого варианта ответа.</p>
          <div style={S.tip}>💡 Из узла-условия автоматически формируются <strong>кнопки быстрых ответов</strong> — пользователь увидит их в чате и сможет нажать.</div>
        </div>

        {/* 4. Кнопки */}
        <div style={S.section} id="s4">
          <h2 style={S.h2}><span>4</span> Кнопки быстрых ответов</h2>
          <p style={S.h2sub}>Добавляются к узлам «Триггер» и «Сообщение»</p>

          <p style={S.p}>В панели узла прокрути вниз до блока <strong>«💙 Кнопки ВКонтакте»</strong>. Введи текст кнопки и нажми «+» или <span style={S.kbd}>Enter</span>.</p>

          <div style={S.step}>
            <div style={S.stepNum("#0077FF")}>1</div>
            <div style={S.stepBody}><p style={S.p}>Введи текст (до 40 символов) и нажми «+».</p></div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum("#0077FF")}>2</div>
            <div style={S.stepBody}><p style={S.p}>Кнопки появятся как чипы. <strong>Кликни на текст кнопки</strong> — он станет редактируемым прямо там.</p></div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum("#0077FF")}>3</div>
            <div style={S.stepBody}><p style={S.p}>Нажми <span style={S.kbd}>Enter</span> чтобы сохранить изменение, <span style={S.kbd}>Escape</span> — чтобы отменить. <strong>✕</strong> — удалить кнопку.</p></div>
          </div>

          <div style={S.warn}>⚠️ Максимум <strong>10 кнопок</strong> на один узел. При нажатии кнопки пользователь автоматически отправляет её текст боту.</div>

          <h3 style={S.h3}>Стилизация кнопок</h3>
          <p style={S.p}>Открой <strong>«🤖 AI-промпт»</strong> → прокрути вниз до <strong>«🎨 CSS кнопок быстрых ответов»</strong>. Выбери готовый шаблон (Пилюля, Градиент, Тёмный и др.) или вставь свой CSS-код. Превью показывается сразу.</p>
        </div>

        {/* 5. Картинки */}
        <div style={S.section} id="s5">
          <h2 style={S.h2}><span>5</span> Картинки в сообщениях</h2>
          <p style={S.h2sub}>Поддерживаются в узлах «Триггер», «Сообщение» и «AI-ответ»</p>

          <p style={S.p}>В панели узла найди блок <strong>«🖼 Картинка к сообщению»</strong>. Нажми на область загрузки и выбери файл.</p>

          <div style={S.card}>
            <div style={S.cardTitle}>Поддерживаемые форматы</div>
            <p style={S.cardText}>PNG, JPG, GIF, WEBP, SVG — до 6 МБ. Файл сохраняется в облаке и доступен постоянно.</p>
          </div>
          <div style={S.card}>
            <div style={S.cardTitle}>Как выглядит в ВКонтакте</div>
            <p style={S.cardText}>Картинка отправляется вместе с текстом сообщения как прикреплённое фото. Если текст пустой — отправляется только картинка.</p>
          </div>
          <p style={S.p}>Чтобы заменить — нажми «Заменить» поверх картинки. Чтобы удалить — иконка 🗑 рядом с кнопкой «Заменить».</p>
        </div>

        {/* 6. AI-промпт */}
        <div style={S.section} id="s6">
          <h2 style={S.h2}><span>6</span> Настройка AI-промпта</h2>
          <p style={S.h2sub}>Открой кнопкой «🤖 AI-промпт» в верхней панели</p>

          <p style={S.p}>AI-промпт — это инструкция для нейросети GPT. Он используется, когда пользователь попадает на узел <span style={S.badge("#FF6B6B")}>🤖 AI-ответ</span>. Чем подробнее промпт — тем точнее и полезнее ответы бота.</p>

          <p style={S.p}>Промпт разбит на <strong>6 разделов</strong>. Заполняй по одному — прогресс показан вверху цветными полосками.</p>

          {PROMPT_SECTIONS.map((s) => (
            <div key={s.label} style={{ ...S.card, borderLeft: `4px solid ${s.color}` }}>
              <div style={S.cardTitle}>
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </div>
              <p style={S.cardText}>{s.desc}</p>
            </div>
          ))}

          <div style={S.tip}>💡 <strong>Системный промпт</strong> — нажми «👁 Показать системный промпт» внизу панели. Там ты увидишь итоговый текст, который получает GPT — полезно для отладки.</div>

          <h3 style={S.h3}>Как подключить AI к сценарию</h3>
          <div style={S.step}>
            <div style={S.stepNum("#FF6B6B")}>1</div>
            <div style={S.stepBody}><p style={S.p}>Добавь узел <span style={S.badge("#FF6B6B")}>🤖 AI-ответ</span> через «+ Добавить блок».</p></div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum("#FF6B6B")}>2</div>
            <div style={S.stepBody}><p style={S.p}>Соедини его стрелкой из любого другого узла (например, из Триггера).</p></div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum("#FF6B6B")}>3</div>
            <div style={S.stepBody}><p style={S.p}>Настрой промпт через кнопку «🤖 AI-промпт» — укажи хотя бы роль и цель бота.</p></div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum("#FF6B6B")}>4</div>
            <div style={S.stepBody}><p style={S.p}>Сохрани и проверь в тест-чате — бот будет отвечать через GPT по твоим правилам.</p></div>
          </div>
        </div>

        {/* 7. Тест-чат */}
        <div style={S.section} id="s7">
          <h2 style={S.h2}><span>7</span> Тест-чат</h2>
          <p style={S.h2sub}>Открой кнопкой «💬 Тест» в верхней панели</p>

          <p style={S.p}>Тест-чат позволяет проверить сценарий прямо в браузере без подключения к ВКонтакте. Пиши сообщения как обычный пользователь — бот будет отвечать по сценарию.</p>

          <div style={S.card}>
            <div style={S.cardTitle}>↺ Сброс чата</div>
            <p style={S.cardText}>Кнопка в правом верхнем углу чата. Очищает историю и перезапускает сценарий с первого узла-триггера. Используй после изменений в схеме.</p>
          </div>
          <div style={S.card}>
            <div style={S.cardTitle}>📧 Счётчик лидов</div>
            <p style={S.cardText}>Фиолетовая метка рядом с именем бота. Показывает, сколько email-адресов собрано за текущую сессию тестирования.</p>
          </div>
          <div style={S.card}>
            <div style={S.cardTitle}>🤖 AI-режим</div>
            <p style={S.cardText}>Красный баннер появляется, когда бот попадает на узел AI-ответ. Нажми «Выйти», чтобы вернуться в режим сценария.</p>
          </div>
          <div style={S.card}>
            <div style={S.cardTitle}>📧 Email-режим</div>
            <p style={S.cardText}>Синий баннер появляется, когда бот ждёт ввода email. Введи адрес — бот его сохранит и пойдёт дальше по сценарию.</p>
          </div>

          <div style={S.warn}>⚠️ После изменений в узлах нажми <strong>«Применить»</strong> — тест-чат обновится автоматически.</div>
        </div>

        {/* 8. ВКонтакте */}
        <div style={S.section} id="s8">
          <h2 style={S.h2}><span>8</span> Подключение к ВКонтакте</h2>
          <p style={S.h2sub}>Раздел «💙 ВКонтакте» в левом меню кабинета</p>

          <div style={S.step}>
            <div style={S.stepNum("#0077FF")}>1</div>
            <div style={S.stepBody}>
              <div style={{ fontWeight: 700, color: "#0A0E27", marginBottom: "4px" }}>Создай сообщество ВКонтакте</div>
              <p style={S.p}>Зайди на vk.com, создай группу или паблик. В настройках группы → «Работа с API» → создай ключ с правами на отправку сообщений.</p>
            </div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum("#0077FF")}>2</div>
            <div style={S.stepBody}>
              <div style={{ fontWeight: 700, color: "#0A0E27", marginBottom: "4px" }}>Включи сообщения в группе</div>
              <p style={S.p}>Настройки группы → «Сообщения» → включи. Иначе бот не сможет отвечать пользователям.</p>
            </div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum("#0077FF")}>3</div>
            <div style={S.stepBody}>
              <div style={{ fontWeight: 700, color: "#0A0E27", marginBottom: "4px" }}>Вставь токен и ID группы в BotFlow</div>
              <p style={S.p}>Раздел «💙 ВКонтакте» → выбери бота → вставь Access Token и ID группы → нажми «Подключить».</p>
            </div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum("#0077FF")}>4</div>
            <div style={S.stepBody}>
              <div style={{ fontWeight: 700, color: "#0A0E27", marginBottom: "4px" }}>Добавь Callback URL в настройки VK</div>
              <p style={S.p}>После подключения появится Webhook URL. Скопируй его, зайди в настройки группы VK → «Работа с API» → «Callback API» → вставь URL. Тип — «Входящее сообщение».</p>
            </div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum("#0077FF")}>5</div>
            <div style={S.stepBody}>
              <div style={{ fontWeight: 700, color: "#0A0E27", marginBottom: "4px" }}>Подтверди сервер</div>
              <p style={S.p}>ВК отправит строку подтверждения. Скопируй её, вставь в поле «Строка подтверждения» в BotFlow и нажми «Сохранить строку».</p>
            </div>
          </div>

          <div style={S.tip}>💡 Включи переключатель <strong>«Бот активен»</strong> — после этого сообщения из ВК начнут поступать боту.</div>
        </div>

        {/* 9. Лендинги */}
        <div style={S.section} id="s9">
          <h2 style={S.h2}><span>9</span> Конструктор лендингов</h2>
          <p style={S.h2sub}>Раздел «🖼 Лендинги» в левом меню кабинета</p>

          <p style={S.p}>Собирай посадочные страницы из готовых блоков — без кода. Страница сохраняется на сервере и доступна с любого устройства.</p>

          <h3 style={S.h3}>Доступные блоки</h3>
          {[
            ["✨ Шапка", "Заголовок, подзаголовок, кнопка призыва и картинка."],
            ["🖼 Изображение", "Отдельный блок с картинкой и подписью."],
            ["⚡ Преимущества", "Сетка карточек с иконкой, заголовком и текстом."],
            ["💰 Тарифы", "Карточки с ценами, списком и кнопкой."],
            ["📝 Текст", "Раздел с заголовком и произвольным текстом."],
            ["📬 Форма заявки", "Поля для имени и контакта + кнопка."],
            ["📣 Призыв к действию", "Яркий блок с заголовком и кнопкой."],
            ["⬇ Подвал", "Название компании и копирайт."],
          ].map(([title, desc]) => (
            <div key={title} style={S.card}>
              <div style={S.cardTitle}>{title}</div>
              <p style={S.cardText}>{desc}</p>
            </div>
          ))}

          <h3 style={S.h3}>Как работать с конструктором</h3>
          <div style={S.step}>
            <div style={S.stepNum("#0077FF")}>1</div>
            <div style={S.stepBody}><p style={S.p}>Нажми «+ Новый лендинг» → откроется редактор.</p></div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum("#0077FF")}>2</div>
            <div style={S.stepBody}><p style={S.p}>Добавляй блоки из левой панели — кликом по названию.</p></div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum("#0077FF")}>3</div>
            <div style={S.stepBody}><p style={S.p}>Кликни по блоку в превью — справа появятся поля редактирования.</p></div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum("#0077FF")}>4</div>
            <div style={S.stepBody}><p style={S.p}>Вкладка «Оформление» — меняй основной цвет и фон всей страницы.</p></div>
          </div>
          <div style={S.step}>
            <div style={S.stepNum("#0077FF")}>5</div>
            <div style={S.stepBody}><p style={S.p}>Нажми «💾 Сохранить» — лендинг сохраняется автоматически.</p></div>
          </div>
          <div style={S.tip}>💡 Блоки можно перемещать стрелками ▲▼ и удалять значком 🗑 — они появляются при выборе блока.</div>
        </div>

      </div>
    </div>
  );
}
