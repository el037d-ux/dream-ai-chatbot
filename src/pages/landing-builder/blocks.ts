export type BlockType = "hero" | "features" | "pricing" | "cta" | "text" | "form" | "footer";

export interface Block {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
}

export interface Theme {
  primary: string;
  bg: string;
  text: string;
  font: string;
}

export const DEFAULT_THEME: Theme = {
  primary: "#0077FF",
  bg: "#FFFFFF",
  text: "#0A0E27",
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

let counter = Date.now();
export const blockId = () => `blk_${++counter}`;

export interface BlockMeta {
  type: BlockType;
  label: string;
  icon: string;
  make: () => Block;
}

export const BLOCK_LIBRARY: BlockMeta[] = [
  {
    type: "hero",
    label: "Шапка",
    icon: "Sparkles",
    make: () => ({
      id: blockId(),
      type: "hero",
      data: {
        badge: "Новинка",
        title: "Заголовок вашего продукта",
        subtitle: "Короткое описание, которое объясняет ценность за 5 секунд.",
        button: "Оставить заявку",
      },
    }),
  },
  {
    type: "features",
    label: "Преимущества",
    icon: "LayoutGrid",
    make: () => ({
      id: blockId(),
      type: "features",
      data: {
        title: "Почему выбирают нас",
        items: [
          { icon: "Zap", title: "Быстро", text: "Запуск за 15 минут без кода." },
          { icon: "Shield", title: "Надёжно", text: "Данные в безопасности." },
          { icon: "Heart", title: "Удобно", text: "Простой интерфейс для всех." },
        ],
      },
    }),
  },
  {
    type: "pricing",
    label: "Тарифы",
    icon: "Wallet",
    make: () => ({
      id: blockId(),
      type: "pricing",
      data: {
        title: "Тарифы",
        plans: [
          { name: "Старт", price: "0 ₽", features: "1 бот\nБазовые сценарии\nПоддержка", button: "Начать" },
          { name: "Про", price: "990 ₽", features: "10 ботов\nAI-ответы\nПриоритет", button: "Выбрать" },
        ],
      },
    }),
  },
  {
    type: "text",
    label: "Текст",
    icon: "AlignLeft",
    make: () => ({
      id: blockId(),
      type: "text",
      data: {
        title: "Заголовок раздела",
        text: "Здесь может быть любой текст: описание, история компании, условия или ответы на вопросы.",
      },
    }),
  },
  {
    type: "form",
    label: "Форма заявки",
    icon: "MailPlus",
    make: () => ({
      id: blockId(),
      type: "form",
      data: {
        title: "Оставьте заявку",
        subtitle: "Мы свяжемся с вами в течение дня.",
        button: "Отправить",
      },
    }),
  },
  {
    type: "cta",
    label: "Призыв к действию",
    icon: "Megaphone",
    make: () => ({
      id: blockId(),
      type: "cta",
      data: {
        title: "Готовы начать?",
        subtitle: "Присоединяйтесь прямо сейчас.",
        button: "Попробовать бесплатно",
      },
    }),
  },
  {
    type: "footer",
    label: "Подвал",
    icon: "Minus",
    make: () => ({
      id: blockId(),
      type: "footer",
      data: {
        company: "Моя компания",
        text: "© 2026 Все права защищены.",
      },
    }),
  },
];

export function makeBlock(type: BlockType): Block {
  const meta = BLOCK_LIBRARY.find((b) => b.type === type)!;
  return meta.make();
}
