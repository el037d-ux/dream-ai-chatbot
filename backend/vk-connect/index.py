"""Управление ВК-интеграцией: подключение, отключение, статус."""
import json, os, urllib.request, urllib.error
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}

def get_conn(): return psycopg2.connect(os.environ["DATABASE_URL"])
def ok(data): return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False, default=str)}
def err(msg, code=400): return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg})}

def get_user(cur, token):
    if not token: return None
    cur.execute("SELECT u.id FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token=%s AND s.expires_at>NOW()", (token,))
    row = cur.fetchone()
    return row[0] if row else None

def vk_api(method: str, params: dict, token: str) -> dict:
    params["access_token"] = token
    params["v"] = "5.131"
    qs = "&".join(f"{k}={urllib.parse.quote(str(v))}" for k, v in params.items())
    req = urllib.request.Request(f"https://api.vk.com/method/{method}?{qs}")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))

import urllib.parse

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "status")
    headers = event.get("headers") or {}
    token = headers.get("X-Auth-Token") or headers.get("x-auth-token") or ""

    conn = get_conn()
    cur = conn.cursor()
    user_id = get_user(cur, token)
    if not user_id:
        conn.close()
        return err("Не авторизован", 401)

    # GET ?action=status&bot_id=N — статус интеграции
    if action == "status":
        bot_id_str = qs.get("bot_id", "")
        if not bot_id_str.isdigit():
            conn.close()
            return err("Укажите bot_id")
        bot_id = int(bot_id_str)
        cur.execute("SELECT id FROM bots WHERE id=%s AND user_id=%s", (bot_id, user_id))
        if not cur.fetchone():
            conn.close()
            return err("Бот не найден", 404)
        cur.execute("""SELECT id, group_id, group_name, secret_key, confirm_code, active, created_at
            FROM vk_integrations WHERE bot_id=%s""", (bot_id,))
        row = cur.fetchone()
        conn.close()
        if not row:
            return ok({"connected": False})
        return ok({
            "connected": True,
            "group_id": row[1], "group_name": row[2],
            "secret_key": row[3], "confirm_code": row[4],
            "active": row[5], "created_at": str(row[6]),
        })

    # POST ?action=connect — подключить ВК-группу
    if action == "connect":
        body = json.loads(event.get("body") or "{}")
        bot_id = int(body.get("bot_id", 0))
        access_token = (body.get("access_token") or "").strip()
        group_id = int(body.get("group_id", 0))
        secret_key = (body.get("secret_key") or "").strip()

        if not bot_id or not access_token or not group_id:
            conn.close()
            return err("Укажите bot_id, access_token и group_id")

        cur.execute("SELECT id FROM bots WHERE id=%s AND user_id=%s", (bot_id, user_id))
        if not cur.fetchone():
            conn.close()
            return err("Бот не найден", 404)

        # Получаем название группы через VK API
        group_name = ""
        try:
            res = vk_api("groups.getById", {"group_id": group_id}, access_token)
            if "response" in res and res["response"]:
                group_name = res["response"][0].get("name", "")
        except Exception:
            pass

        # Генерируем confirm_code — уникальная строка для верификации Callback
        import hashlib, time
        confirm_code = hashlib.md5(f"{bot_id}:{group_id}:{time.time()}".encode()).hexdigest()[:16]

        cur.execute("""INSERT INTO vk_integrations (bot_id, group_id, group_name, access_token, secret_key, confirm_code, active)
            VALUES (%s,%s,%s,%s,%s,%s,true)
            ON CONFLICT (bot_id) DO UPDATE SET
                group_id=EXCLUDED.group_id, group_name=EXCLUDED.group_name,
                access_token=EXCLUDED.access_token, secret_key=EXCLUDED.secret_key,
                confirm_code=EXCLUDED.confirm_code, active=true, updated_at=NOW()""",
            (bot_id, group_id, group_name, access_token, secret_key, confirm_code))
        conn.commit()
        conn.close()
        return ok({"ok": True, "confirm_code": confirm_code, "group_name": group_name})

    # POST ?action=toggle — включить/выключить
    if action == "toggle":
        body = json.loads(event.get("body") or "{}")
        bot_id = int(body.get("bot_id", 0))
        active = bool(body.get("active", True))
        cur.execute("""UPDATE vk_integrations SET active=%s, updated_at=NOW()
            WHERE bot_id=%s AND bot_id IN (SELECT id FROM bots WHERE user_id=%s)""",
            (active, bot_id, user_id))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # POST ?action=disconnect — удалить интеграцию
    if action == "disconnect":
        body = json.loads(event.get("body") or "{}")
        bot_id = int(body.get("bot_id", 0))
        cur.execute("""UPDATE vk_integrations SET active=false, updated_at=NOW()
            WHERE bot_id=%s AND bot_id IN (SELECT id FROM bots WHERE user_id=%s)""",
            (bot_id, user_id))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    conn.close()
    return err("Unknown action", 404)
