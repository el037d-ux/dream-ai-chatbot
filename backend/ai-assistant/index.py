"""ИИ-помощник конструктора: генерирует сценарий, заполняет промпт, отвечает на вопросы."""
import json, os, urllib.request, urllib.error

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}

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
- ai: AI-узел, бот переходит в режим свободного общения через GPT

ВАЖНО: отвечай ТОЛЬКО валидным JSON без markdown, без ```json, без пояснений вне JSON.

Формат ответа:
{
  "reply": "Текст ответа пользователю (что ты сделал / объяснение)",
  "action": null | "set_nodes" | "set_prompt" | "add_nodes",
  "payload": <зависит от action>
}

Если action = "set_nodes" — замени весь сценарий:
payload = {
  "nodes": [{"id":"n1","type":"trigger","label":"Старт","message":"Привет! ...", "x":100,"y":80}, ...],
  "edges": [{"id":"e1","source":"n1","target":"n2"}, ...]
}

Если action = "add_nodes" — добавить узлы к существующим (НЕ удаляя старые):
payload = {
  "nodes": [...],
  "edges": [...]
}

Если action = "set_prompt" — заполни настройки AI-промпта:
payload = {
  "botName": "", "botRole": "", "traits": "",
  "goal": "", "tasks": "",
  "address": "ты", "tone": "", "emoji": "", "structure": "",
  "constraints": "", "format": "", "examples": ""
}

Если action = null — просто ответь текстом, без изменений.

При генерации сценария:
- Начинай с trigger-узла (id="n1", x=100, y=80)
- Следующие узлы: x=100, y=200, y=320 и т.д. (шаг 130 по y)
- Для ветвления используй несколько condition-узлов после trigger
- Всегда заканчивай цепочку узлом message или ai
- id узлов: "n1", "n2", "n3"..., id рёбер: "e1", "e2"...
- label condition-узла = ключевые слова через запятую ("да,конечно,хочу")
- Делай реалистичные, живые тексты сообщений на русском

При заполнении промпта:
- tone: выбери из: профессиональный, дружеский, саркастичный, вдохновляющий, нейтральный, заботливый
- address: "ты" или "Вы"
- emoji: "используй умеренно" | "не используй вообще" | "используй только тематические"
- structure: "коротко, максимум 2–3 предложения" | "средний объём, до 3 абзацев" | "развёрнуто, с примерами"
"""

def call_openai(messages: list, api_key: str) -> str:
    payload = json.dumps({
        "model": "gpt-4o",
        "messages": messages,
        "max_tokens": 2000,
        "temperature": 0.7,
        "response_format": {"type": "json_object"},
    }).encode("utf-8")
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    return data["choices"][0]["message"]["content"].strip()

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        return err("OPENAI_API_KEY не настроен", 500)

    body = json.loads(event.get("body") or "{}")
    user_msg = (body.get("message") or "").strip()
    if not user_msg:
        return err("Нет сообщения")

    history = body.get("history", [])      # [{role, content}]
    bot_context = body.get("context", {})  # {nodes, edges, prompt, botName}

    # Формируем контекстный блок
    ctx_parts = []
    bot_name = bot_context.get("botName", "")
    if bot_name:
        ctx_parts.append(f"Название бота: «{bot_name}»")
    nodes = bot_context.get("nodes", [])
    if nodes:
        ctx_parts.append(f"Текущих узлов в сценарии: {len(nodes)}")
        ctx_parts.append("Узлы: " + ", ".join(f'{n.get("type")}:{n.get("label")}' for n in nodes[:8]))
    else:
        ctx_parts.append("Сценарий пока пустой")
    pr = bot_context.get("prompt", {})
    if pr.get("botName") or pr.get("goal"):
        ctx_parts.append(f"AI-промпт: роль={pr.get('botName','')}, цель={pr.get('goal','')[:60]}")

    ctx_note = "\n".join(ctx_parts)

    messages = [{"role": "system", "content": SYSTEM}]
    if ctx_note:
        messages.append({"role": "system", "content": f"Текущее состояние конструктора:\n{ctx_note}"})
    for h in history[-10:]:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": user_msg})

    try:
        raw = call_openai(messages, api_key)
        result = json.loads(raw)
        return ok({
            "reply": result.get("reply", "Готово!"),
            "action": result.get("action"),
            "payload": result.get("payload"),
        })
    except urllib.error.HTTPError as e:
        body_err = e.read().decode("utf-8", errors="replace")
        err_data = json.loads(body_err) if body_err.startswith("{") else {}
        msg = err_data.get("error", {}).get("message", f"OpenAI HTTP {e.code}")
        return err(f"OpenAI: {msg}", 502)
    except Exception as ex:
        return err(f"Ошибка: {str(ex)}", 500)
