"""ВК Callback webhook: принимает события от ВКонтакте, прогоняет через сценарий бота."""
import json, os, re, urllib.request, urllib.parse, random
import psycopg2

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')

def get_conn(): return psycopg2.connect(os.environ["DATABASE_URL"])

def ok(text="ok"): return {"statusCode": 200, "headers": {"Content-Type": "text/plain"}, "body": text}


def build_keyboard(buttons: list, one_time: bool = True) -> str:
    """Создать JSON-клавиатуру ВКонтакте из списка строк."""
    if not buttons:
        # Пустая клавиатура — убирает кнопки
        return json.dumps({"one_time": True, "buttons": []})
    # Разбиваем на строки по 2 кнопки
    rows = []
    row = []
    for i, label in enumerate(buttons):
        row.append({
            "action": {"type": "text", "label": label[:40]},
            "color": "primary"
        })
        if len(row) == 2 or i == len(buttons) - 1:
            rows.append(row)
            row = []
    return json.dumps({"one_time": one_time, "buttons": rows}, ensure_ascii=False)


def vk_send(peer_id: int, message: str, token: str, keyboard: str = None, remove_keyboard: bool = False):
    """Отправить сообщение пользователю ВК, опционально с клавиатурой."""
    params = {
        "peer_id": peer_id,
        "message": message or "...",
        "random_id": random.randint(1, 2**31),
        "access_token": token,
        "v": "5.131",
    }
    if keyboard is not None:
        params["keyboard"] = keyboard
    elif remove_keyboard:
        params["keyboard"] = json.dumps({"one_time": True, "buttons": []})

    qs = "&".join(f"{k}={urllib.parse.quote(str(v))}" for k, v in params.items())
    req = urllib.request.Request(
        f"https://api.vk.com/method/messages.send?{qs}", method="POST"
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def load_scenario(cur, bot_id: int):
    """Загрузить узлы и рёбра бота."""
    cur.execute("""SELECT node_id, type, label, message,
        COALESCE(var_name,''), COALESCE(validate,false), COALESCE(error_msg,''),
        COALESCE(extra,'{}')
        FROM bot_nodes WHERE bot_id=%s""", (bot_id,))
    nodes = {}
    for r in cur.fetchall():
        extra = r[7] if isinstance(r[7], dict) else (json.loads(r[7]) if r[7] else {})
        nodes[r[0]] = {
            "id": r[0], "type": r[1], "label": r[2], "message": r[3],
            "varName": r[4], "validate": r[5], "errorMsg": r[6],
            "webhookUrl": extra.get("webhookUrl", ""),
            "webhookMethod": extra.get("webhookMethod", "POST"),
            "buttons": extra.get("buttons", []),
        }
    cur.execute("SELECT source_node_id, target_node_id FROM bot_edges WHERE bot_id=%s", (bot_id,))
    edges = cur.fetchall()
    return nodes, edges


def get_or_create_session(cur, conn, vk_user_id: int, bot_id: int, nodes: dict) -> dict:
    cur.execute("""SELECT current_node_id, vars, awaiting_email, collected_name
        FROM vk_sessions WHERE vk_user_id=%s AND bot_id=%s""", (vk_user_id, bot_id))
    row = cur.fetchone()
    if row:
        return {
            "current_node_id": row[0],
            "vars": row[1] if isinstance(row[1], dict) else {},
            "awaiting_email": row[2],
            "collected_name": row[3] or ""
        }
    trigger = next((n for n in nodes.values() if n["type"] == "trigger"), None)
    start_id = trigger["id"] if trigger else ""
    cur.execute("""INSERT INTO vk_sessions (vk_user_id, bot_id, current_node_id, vars, awaiting_email, collected_name)
        VALUES (%s,%s,%s,'{}',false,'')
        ON CONFLICT (vk_user_id, bot_id) DO NOTHING""", (vk_user_id, bot_id, start_id))
    conn.commit()
    return {"current_node_id": start_id, "vars": {}, "awaiting_email": False, "collected_name": ""}


def save_session(cur, conn, vk_user_id: int, bot_id: int, session: dict):
    cur.execute("""UPDATE vk_sessions
        SET current_node_id=%s, vars=%s, awaiting_email=%s, collected_name=%s, updated_at=NOW()
        WHERE vk_user_id=%s AND bot_id=%s""",
        (session["current_node_id"], json.dumps(session["vars"]),
         session["awaiting_email"], session["collected_name"],
         vk_user_id, bot_id))
    conn.commit()


def get_next_node(from_id: str, edges, nodes: dict):
    for src, tgt in edges:
        if src == from_id and tgt in nodes:
            return nodes[tgt]
    return None


def get_all_next_nodes(from_id: str, edges, nodes: dict) -> list:
    """Получить все узлы, следующие за данным."""
    result = []
    for src, tgt in edges:
        if src == from_id and tgt in nodes:
            result.append(nodes[tgt])
    return result


def find_matching_node(user_text: str, from_id: str, edges, nodes: dict):
    """Найти следующий узел по тексту пользователя."""
    text = user_text.lower().strip()
    direct = [(src, tgt) for src, tgt in edges if src == from_id]
    # Сначала ищем condition-узел, чьи ключевые слова совпадают
    for src, tgt in direct:
        candidate = nodes.get(tgt)
        if not candidate: continue
        if candidate["type"] == "condition":
            keywords = [kw.strip().lower() for kw in candidate["label"].split(",") if kw.strip()]
            if any(kw and kw in text for kw in keywords):
                return candidate
    # Если нет совпадений по условию — берём первый не-condition
    for src, tgt in direct:
        candidate = nodes.get(tgt)
        if candidate and candidate["type"] != "condition":
            return candidate
    # Если всё равно ничего — берём первое ребро
    if direct:
        return nodes.get(direct[0][1])
    return None


def get_next_keyboard(node_id: str, edges, nodes: dict) -> list:
    """Вычислить кнопки для следующего шага: либо из самого узла, либо из condition-дочерних."""
    # Кнопки самого узла
    node = nodes.get(node_id)
    if node and node.get("buttons"):
        return node["buttons"]
    # Если за узлом идут condition-узлы — собираем их label как кнопки
    nexts = get_all_next_nodes(node_id, edges, nodes)
    conditions = [n for n in nexts if n["type"] == "condition"]
    if conditions:
        btns = []
        for c in conditions:
            # Первое ключевое слово condition-узла становится кнопкой
            first_kw = c["label"].split(",")[0].strip()
            if first_kw and first_kw not in btns:
                btns.append(first_kw)
        return btns[:10]
    return []


def fire_webhook(node: dict, data: dict):
    url = node.get("webhookUrl", "")
    if not url: return
    method = node.get("webhookMethod", "POST")
    payload = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url, data=payload if method == "POST" else None,
        headers={"Content-Type": "application/json", "X-BotFlow-Event": "vk.message"},
        method=method
    )
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

    # ── Ожидаем email ──────────────────────────────────────────────
    if session["awaiting_email"]:
        email = text.strip().lower()
        current_node = nodes.get(current_id, {})
        should_validate = current_node.get("validate", True)
        if should_validate and not EMAIL_RE.match(email):
            error_msg = current_node.get("errorMsg") or "Это не похоже на email. Попробуйте ещё раз — например: ivan@example.com"
            vk_send(vk_user_id, error_msg, access_token)
            return

        key = current_node.get("varName") or "user_email"
        session["vars"][key] = email
        session["awaiting_email"] = False

        try:
            cur.execute("INSERT INTO leads (bot_id, email, name) VALUES (%s,%s,%s) ON CONFLICT DO NOTHING",
                        (bot_id, email, session.get("collected_name", "")))
            conn.commit()
        except Exception:
            pass

        # Следующий узел после email
        next_node = get_next_node(current_id, edges, nodes)
        if next_node and next_node["type"] not in ("trigger", "condition", "email"):
            session["current_node_id"] = next_node["id"]
            kb_btns = get_next_keyboard(next_node["id"], edges, nodes)
            keyboard = build_keyboard(kb_btns) if kb_btns else None
            vk_send(vk_user_id, "✅ Email сохранён! Спасибо.", access_token, remove_keyboard=not kb_btns)
            if next_node["message"]:
                vk_send(vk_user_id, next_node["message"], access_token, keyboard=keyboard)
        else:
            vk_send(vk_user_id, "✅ Email сохранён! Спасибо.", access_token, remove_keyboard=True)

        save_session(cur, conn, vk_user_id, bot_id, session)
        return

    # ── Запоминаем имя из первого сообщения ────────────────────────
    if not session["collected_name"] and text.strip():
        session["collected_name"] = text.strip()

    # ── Ищем следующий узел ─────────────────────────────────────────
    next_node = find_matching_node(text, current_id, edges, nodes)

    # Если не нашли — пробуем от trigger (начало диалога)
    if not next_node:
        trigger = next((n for n in nodes.values() if n["type"] == "trigger"), None)
        if trigger:
            next_node = find_matching_node(text, trigger["id"], edges, nodes)
            if not next_node and trigger["message"]:
                # Отправляем приветствие триггера с его кнопками
                btns = get_next_keyboard(trigger["id"], edges, nodes)
                keyboard = build_keyboard(btns) if btns else None
                vk_send(vk_user_id, trigger["message"], access_token, keyboard=keyboard)
                session["current_node_id"] = trigger["id"]
                save_session(cur, conn, vk_user_id, bot_id, session)
                return

    if not next_node:
        save_session(cur, conn, vk_user_id, bot_id, session)
        return

    # ── Обрабатываем найденный узел ─────────────────────────────────
    session["current_node_id"] = next_node["id"]

    if next_node["type"] == "trigger":
        # Приветствие
        btns = get_next_keyboard(next_node["id"], edges, nodes)
        keyboard = build_keyboard(btns) if btns else None
        if next_node["message"]:
            vk_send(vk_user_id, next_node["message"], access_token, keyboard=keyboard)
        save_session(cur, conn, vk_user_id, bot_id, session)
        return

    if next_node["type"] == "email":
        session["awaiting_email"] = True
        save_session(cur, conn, vk_user_id, bot_id, session)
        msg = next_node["message"] or "Пожалуйста, введите ваш email:"
        vk_send(vk_user_id, msg, access_token, remove_keyboard=True)
        return

    if next_node["type"] == "action":
        fire_webhook(next_node, {"vk_user_id": vk_user_id, "bot_id": bot_id, "vars": session["vars"]})

    # Для message / ai / action / condition — отправляем сообщение
    if next_node["type"] == "condition":
        # condition без сообщения — идём дальше по первому ребру
        auto_next = get_next_node(next_node["id"], edges, nodes)
        if auto_next:
            session["current_node_id"] = auto_next["id"]
            btns = get_next_keyboard(auto_next["id"], edges, nodes)
            keyboard = build_keyboard(btns) if btns else None
            if auto_next["message"]:
                vk_send(vk_user_id, auto_next["message"], access_token, keyboard=keyboard)
    else:
        btns = get_next_keyboard(next_node["id"], edges, nodes)
        keyboard = build_keyboard(btns) if btns else None
        msg = next_node["message"] or ""
        if msg:
            vk_send(vk_user_id, msg, access_token, keyboard=keyboard)
        # Если за ним есть автоматический message без condition — отправляем его тоже
        if not btns:
            auto_next = get_next_node(next_node["id"], edges, nodes)
            if auto_next and auto_next["type"] == "message" and auto_next["message"]:
                auto_btns = get_next_keyboard(auto_next["id"], edges, nodes)
                auto_kb = build_keyboard(auto_btns) if auto_btns else None
                vk_send(vk_user_id, auto_next["message"], access_token, keyboard=auto_kb)
                session["current_node_id"] = auto_next["id"]

    save_session(cur, conn, vk_user_id, bot_id, session)


def handler(event: dict, context) -> dict:
    """Обработчик ВК Callback API."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*"}, "body": ""}

    raw_body = event.get("body") or "{}"
    try:
        body = json.loads(raw_body)
    except Exception:
        return ok("ok")

    event_type = body.get("type", "")
    group_id = int(body.get("group_id", 0))

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""SELECT vi.bot_id, vi.access_token, vi.secret_key, vi.confirm_code, vi.active
        FROM vk_integrations vi WHERE vi.group_id=%s""", (group_id,))
    row = cur.fetchone()

    if not row:
        conn.close()
        return ok("ok")

    bot_id, access_token, secret_key, confirm_code, active = row

    # Подтверждение сервера — ВК НЕ присылает secret в этом запросе,
    # поэтому проверку кода делаем ДО проверки секретного ключа
    if event_type == "confirmation":
        conn.close()
        return ok((confirm_code or "").strip())

    # Проверка секретного ключа
    if secret_key and body.get("secret", "") != secret_key:
        conn.close()
        return ok("ok")

    if not active:
        conn.close()
        return ok("ok")

    # Новое сообщение
    if event_type == "message_new":
        obj = body.get("object", {})
        message_obj = obj.get("message", obj)
        user_id = message_obj.get("from_id") or message_obj.get("user_id")
        text = (message_obj.get("text") or "").strip()
        if user_id and text:
            try:
                process_message(int(user_id), text, bot_id, access_token, conn, cur)
            except Exception:
                pass

    conn.close()
    return ok("ok")