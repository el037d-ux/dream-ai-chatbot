"""ВК Callback webhook: принимает события от ВКонтакте, прогоняет через сценарий бота."""
import json, os, re, urllib.request, urllib.parse
import psycopg2

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')

def get_conn(): return psycopg2.connect(os.environ["DATABASE_URL"])

def ok(text="ok"): return {"statusCode": 200, "headers": {"Content-Type": "text/plain"}, "body": text}
def ok_json(data): return {"statusCode": 200, "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"}, "body": json.dumps(data, ensure_ascii=False)}

def vk_send(peer_id: int, message: str, token: str):
    """Отправить сообщение пользователю ВК."""
    import random
    params = {
        "peer_id": peer_id,
        "message": message,
        "random_id": random.randint(1, 2**31),
        "access_token": token,
        "v": "5.131",
    }
    qs = "&".join(f"{k}={urllib.parse.quote(str(v))}" for k, v in params.items())
    req = urllib.request.Request(f"https://api.vk.com/method/messages.send?{qs}", method="POST")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def load_scenario(cur, bot_id: int):
    """Загрузить узлы и рёбра бота."""
    cur.execute("""SELECT node_id, type, label, message,
        COALESCE(var_name,''), COALESCE(validate,false), COALESCE(error_msg,''), COALESCE(extra,'{}')
        FROM bot_nodes WHERE bot_id=%s""", (bot_id,))
    nodes = {r[0]: {"id": r[0], "type": r[1], "label": r[2], "message": r[3],
                    "varName": r[4], "validate": r[5], "errorMsg": r[6],
                    "webhookUrl": (r[7] or {}).get("webhookUrl",""),
                    "webhookMethod": (r[7] or {}).get("webhookMethod","POST")}
             for r in cur.fetchall()}
    cur.execute("SELECT source_node_id, target_node_id FROM bot_edges WHERE bot_id=%s", (bot_id,))
    edges = cur.fetchall()
    return nodes, edges


def get_or_create_session(cur, conn, vk_user_id: int, bot_id: int, nodes: dict) -> dict:
    cur.execute("SELECT current_node_id, vars, awaiting_email, collected_name FROM vk_sessions WHERE vk_user_id=%s AND bot_id=%s",
                (vk_user_id, bot_id))
    row = cur.fetchone()
    if row:
        return {"current_node_id": row[0], "vars": row[1] or {}, "awaiting_email": row[2], "collected_name": row[3] or ""}
    # Найти trigger-узел
    trigger = next((n for n in nodes.values() if n["type"] == "trigger"), None)
    start_id = trigger["id"] if trigger else ""
    cur.execute("""INSERT INTO vk_sessions (vk_user_id, bot_id, current_node_id, vars, awaiting_email, collected_name)
        VALUES (%s,%s,%s,'{}',false,'') ON CONFLICT (vk_user_id, bot_id) DO NOTHING""",
        (vk_user_id, bot_id, start_id))
    conn.commit()
    return {"current_node_id": start_id, "vars": {}, "awaiting_email": False, "collected_name": ""}


def save_session(cur, conn, vk_user_id: int, bot_id: int, session: dict):
    cur.execute("""UPDATE vk_sessions SET current_node_id=%s, vars=%s, awaiting_email=%s, collected_name=%s, updated_at=NOW()
        WHERE vk_user_id=%s AND bot_id=%s""",
        (session["current_node_id"], json.dumps(session["vars"]), session["awaiting_email"],
         session["collected_name"], vk_user_id, bot_id))
    conn.commit()


def get_next_node(from_id: str, edges, nodes: dict):
    for src, tgt in edges:
        if src == from_id and tgt in nodes:
            return nodes[tgt]
    return None


def find_matching_node(user_text: str, from_id: str, edges, nodes: dict):
    text = user_text.lower()
    # Проверяем рёбра из текущего узла
    direct = [(src, tgt) for src, tgt in edges if src == from_id]
    for src, tgt in direct:
        candidate = nodes.get(tgt)
        if not candidate: continue
        if candidate["type"] == "condition":
            keywords = [kw.strip().lower() for kw in candidate["label"].split(",")]
            if any(kw and kw in text for kw in keywords):
                return candidate
        elif candidate["type"] != "condition":
            return candidate
    if direct:
        first_tgt = direct[0][1]
        return nodes.get(first_tgt)
    return None


def fire_webhook(node: dict, data: dict):
    """Отправить данные на webhook из action-узла."""
    url = node.get("webhookUrl", "")
    if not url: return
    method = node.get("webhookMethod", "POST")
    payload = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=payload if method == "POST" else None,
        headers={"Content-Type": "application/json", "X-BotFlow-Event": "vk.message"},
        method=method)
    try:
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass


def process_message(vk_user_id: int, text: str, bot_id: int, access_token: str, conn, cur):
    """Основная логика обработки входящего сообщения."""
    nodes, edges = load_scenario(cur, bot_id)
    if not nodes:
        vk_send(vk_user_id, "Сценарий бота не настроен.", access_token)
        return

    session = get_or_create_session(cur, conn, vk_user_id, bot_id, nodes)
    current_id = session["current_node_id"]
    replies = []

    # Если ждём email
    if session["awaiting_email"]:
        email = text.strip().lower()
        current_node = nodes.get(current_id, {})
        should_validate = current_node.get("validate", True)
        if should_validate and not EMAIL_RE.match(email):
            error_msg = current_node.get("errorMsg") or "Это не похоже на email. Попробуйте ещё раз — например: ivan@example.com"
            vk_send(vk_user_id, error_msg, access_token)
            return

        # Сохраняем в vars
        key = current_node.get("varName") or "user_email"
        session["vars"][key] = email
        session["awaiting_email"] = False

        # Сохраняем лид в БД
        try:
            cur.execute("""INSERT INTO leads (bot_id, email, name)
                VALUES (%s,%s,%s) ON CONFLICT DO NOTHING""",
                (bot_id, email, session.get("collected_name", "")))
            conn.commit()
        except Exception:
            pass

        vk_send(vk_user_id, "✅ Email сохранён! Спасибо, мы свяжемся с вами.", access_token)

        # Переходим к следующему узлу
        next_node = get_next_node(current_id, edges, nodes)
        if next_node and next_node["type"] not in ("trigger", "condition", "email"):
            replies.append(next_node["message"] or next_node["label"])
            session["current_node_id"] = next_node["id"]
        save_session(cur, conn, vk_user_id, bot_id, session)
        for r in replies:
            vk_send(vk_user_id, r, access_token)
        return

    # Запоминаем имя из первого сообщения
    if not session["collected_name"] and text.strip():
        session["collected_name"] = text.strip()

    # Ищем следующий узел по сценарию
    next_node = find_matching_node(text, current_id, edges, nodes)

    if next_node:
        # Если триггер — отправляем его приветствие, переходим к следующему
        if next_node["type"] == "trigger":
            if next_node["message"]:
                vk_send(vk_user_id, next_node["message"], access_token)
            next_node = get_next_node(next_node["id"], edges, nodes)

        if next_node:
            session["current_node_id"] = next_node["id"]

            if next_node["type"] == "email":
                msg = next_node["message"] or "Пожалуйста, введите ваш email:"
                session["awaiting_email"] = True
                save_session(cur, conn, vk_user_id, bot_id, session)
                vk_send(vk_user_id, msg, access_token)
                return

            if next_node["type"] == "action":
                fire_webhook(next_node, {"vk_user_id": vk_user_id, "bot_id": bot_id, "vars": session["vars"]})
                msg = next_node["message"] or "Данные отправлены!"
                replies.append(msg)

            elif next_node["type"] in ("message", "ai", "condition"):
                if next_node["message"]:
                    replies.append(next_node["message"])

            # Автоматически переходим к следующему message-узлу если нет condition
            after = get_next_node(next_node["id"], edges, nodes)
            if after and after["type"] == "message" and after["message"]:
                replies.append(after["message"])
                session["current_node_id"] = after["id"]
    else:
        # Начало диалога — trigger приветствие
        trigger = next((n for n in nodes.values() if n["type"] == "trigger"), None)
        if trigger and session["current_node_id"] != trigger["id"]:
            session["current_node_id"] = trigger["id"]
            if trigger["message"]:
                replies.append(trigger["message"])

    save_session(cur, conn, vk_user_id, bot_id, session)
    for r in replies:
        if r: vk_send(vk_user_id, r, access_token)


def handler(event: dict, context) -> dict:
    """Обработчик ВК Callback API."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*"}, "body": ""}

    qs = event.get("queryStringParameters") or {}
    raw_body = event.get("body") or "{}"
    try:
        body = json.loads(raw_body)
    except Exception:
        return ok("ok")

    event_type = body.get("type", "")
    group_id = int(body.get("group_id", 0))

    # Находим интеграцию по group_id
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""SELECT vi.bot_id, vi.access_token, vi.secret_key, vi.confirm_code, vi.active
        FROM vk_integrations vi WHERE vi.group_id=%s""", (group_id,))
    row = cur.fetchone()

    if not row:
        conn.close()
        return ok("ok")

    bot_id, access_token, secret_key, confirm_code, active = row

    # Проверка секретного ключа
    if secret_key:
        req_secret = (event.get("headers") or {}).get("X-Retry-Counter") or body.get("secret", "")
        # VK передаёт secret в теле события
        if body.get("secret", "") != secret_key:
            conn.close()
            return ok("ok")

    # Подтверждение сервера (первый запрос от ВК)
    if event_type == "confirmation":
        conn.close()
        return ok(confirm_code)

    if not active:
        conn.close()
        return ok("ok")

    # Новое сообщение
    if event_type == "message_new":
        obj = body.get("object", {})
        message_obj = obj.get("message", obj)  # VK API 5.131+
        user_id = message_obj.get("from_id") or message_obj.get("user_id")
        text = (message_obj.get("text") or "").strip()

        if user_id and text:
            try:
                process_message(int(user_id), text, bot_id, access_token, conn, cur)
            except Exception as e:
                pass  # Не падаем — ВК должен получить "ok"

    conn.close()
    return ok("ok")
