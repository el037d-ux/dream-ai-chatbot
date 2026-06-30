"""ИИ-помощник конструктора: генерирует сценарий, заполняет промпт, отвечает на вопросы."""
import json, os, urllib.request, urllib.error

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}

API_URL = "https://api.aitunnel.ru/v1/chat/completions"
DEFAULT_MODEL = "gpt-4o"

def ok(data): return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False)}
def err(msg, code=400): return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg})}

SYSTEM = """Ты — встроенный ИИ-ассистент конструктора чат-ботов BotFlow.
Ты помогаешь пользователю создавать и настраивать чат-ботов: генерируешь сценарии, заполняешь промпт, объясняешь как работают узлы.

Типы узлов конструктора:
- trigger: стартовый узел, срабатывает при первом сообщении пользователя
- message: бот отправляет текстовое сообщение
- condition: ветвление по ключевым словам (в label через запятую)
- email: сбор email-адреса с валидацией и сохранением в базу
- action: отправка webhook-запроса на внешний URL
- ai: AI-узел, бот переходит в режим свободного общения через LLM

ВАЖНО: отвечай ТОЛЬКО валидным JSON без markdown, без ```json, без пояснений вне JSON.

Формат ответа:
{
  "reply": "Текст ответа пользователю (что ты сделал / объяснение)",
  "action": null,
  "payload": null
}

Возможные значения action:
- null — просто ответь текстом, без изменений
- "set_nodes" — замени весь сценарий
- "add_nodes" — добавь узлы к существующим
- "set_prompt" — заполни AI-промпт

Если action = "set_nodes" или "add_nodes":
payload = {
  "nodes": [{"id":"n1","type":"trigger","label":"Старт","message":"Привет! Чем могу помочь?","x":100,"y":80}, ...],
  "edges": [{"id":"e1","source":"n1","target":"n2"}, ...]
}

Если action = "set_prompt":
payload = {
  "botName": "Имя бота",
  "botRole": "краткое описание роли",
  "traits": "2-3 черты характера",
  "goal": "главная цель",
  "tasks": "задача 1\nзадача 2",
  "address": "ты",
  "tone": "дружеский",
  "emoji": "используй умеренно",
  "structure": "коротко, максимум 2-3 предложения",
  "constraints": "доп. ограничения через перенос строки",
  "format": "",
  "examples": "Пользователь: ...\nБот: ..."
}

Правила генерации сценария:
- Начинай с trigger-узла: id="n1", x=100, y=80
- Каждый следующий узел: y += 130 (n2: y=210, n3: y=340 и т.д.)
- Для ветвления: несколько condition после trigger, каждый с x=300 и разными y
- id узлов: "n1","n2"... id рёбер: "e1","e2"...
- label condition-узла = ключевые слова через запятую
- Тексты сообщений живые, на русском, без шаблонных фраз
- Заканчивай цепочку узлом message или ai

Правила заполнения промпта:
- tone: профессиональный | дружеский | саркастичный | вдохновляющий | нейтральный | заботливый
- address: "ты" или "Вы"
- emoji: "используй умеренно" | "не используй вообще" | "используй только тематические"
- structure: "коротко, максимум 2-3 предложения" | "средний объём, до 3 абзацев" | "развёрнуто, с примерами"
"""


def call_api(messages: list, api_key: str) -> str:
    payload = json.dumps({
        "model": DEFAULT_MODEL,
        "messages": messages,
        "max_tokens": 2000,
        "temperature": 0.7,
        "response_format": {"type": "json_object"},
    }).encode("utf-8")
    req = urllib.request.Request(
        API_URL, data=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    return data["choices"][0]["message"]["content"].strip()


def extract_json(text: str) -> dict:
    """Извлекает JSON из ответа модели, даже если есть лишний текст."""
    # Убираем markdown блоки
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    # Ищем первый {
    start = text.find("{")
    end = text.rfind("}") + 1
    if start >= 0 and end > start:
        return json.loads(text[start:end])
    raise ValueError("JSON не найден в ответе")


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        return err("OPENAI_API_KEY не настроен", 500)

    body = json.loads(event.get("body") or "{}")
    user_msg = (body.get("message") or "").strip()
    if not user_msg:
        return err("Нет сообщения")

    history = body.get("history", [])
    bot_context = body.get("context", {})

    ctx_parts = []
    bot_name = bot_context.get("botName", "")
    if bot_name:
        ctx_parts.append(f"Название бота: «{bot_name}»")
    nodes = bot_context.get("nodes", [])
    if nodes:
        ctx_parts.append(f"Узлов в сценарии: {len(nodes)}")
        ctx_parts.append("Узлы: " + ", ".join(f'{n.get("type")}:{n.get("label")}' for n in nodes[:8]))
    else:
        ctx_parts.append("Сценарий пока пустой")
    pr = bot_context.get("prompt", {})
    if pr.get("botName") or pr.get("goal"):
        ctx_parts.append(f"AI-промпт: имя={pr.get('botName','')}, цель={pr.get('goal','')[:60]}")

    messages = [{"role": "system", "content": SYSTEM}]
    if ctx_parts:
        messages.append({"role": "system", "content": "Текущее состояние:\n" + "\n".join(ctx_parts)})
    for h in history[-8:]:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": user_msg})

    try:
        raw = call_api(messages, api_key)
        result = extract_json(raw)
        return ok({
            "reply": result.get("reply", "Готово!"),
            "action": result.get("action"),
            "payload": result.get("payload"),
        })
    except urllib.error.HTTPError as e:
        body_err = e.read().decode("utf-8", errors="replace")
        err_data = json.loads(body_err) if body_err.startswith("{") else {}
        msg = err_data.get("error", {}).get("message", f"HTTP {e.code}")
        return err(f"AI: {msg}", 502)
    except Exception as ex:
        return err(f"Ошибка: {str(ex)}", 500)