"""Управление лендингами: список, создание, чтение, сохранение, публикация. Action через query ?action=list|create|get|save|delete|publish"""
import json
import os
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ok(data: dict) -> dict:
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False, default=str)}


def err(msg: str, code: int = 400) -> dict:
    return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg})}


def get_user(cur, token: str):
    if not token:
        return None
    cur.execute(
        "SELECT u.id FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token=%s AND s.expires_at>NOW()",
        (token,),
    )
    row = cur.fetchone()
    return row[0] if row else None


def handler(event: dict, context) -> dict:
    """Обработчик лендингов: CRUD операции для авторизованного пользователя."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "list")
    headers = event.get("headers") or {}
    token = headers.get("X-Auth-Token") or headers.get("x-auth-token") or ""

    conn = get_conn()
    cur = conn.cursor()
    user_id = get_user(cur, token)
    if not user_id:
        conn.close()
        return err("Не авторизован", 401)

    if action == "list":
        cur.execute(
            "SELECT id, name, published, updated_at FROM landings WHERE user_id=%s ORDER BY updated_at DESC",
            (user_id,),
        )
        rows = cur.fetchall()
        conn.close()
        return ok({"landings": [
            {"id": r[0], "name": r[1], "published": r[2], "updated_at": str(r[3])} for r in rows
        ]})

    if action == "create":
        body = json.loads(event.get("body") or "{}")
        name = (body.get("name") or "Мой лендинг").strip()[:200]
        blocks = body.get("blocks") or []
        theme = body.get("theme") or {}
        cur.execute(
            "INSERT INTO landings (user_id, name, blocks, theme) VALUES (%s,%s,%s,%s) RETURNING id",
            (user_id, name, json.dumps(blocks, ensure_ascii=False), json.dumps(theme, ensure_ascii=False)),
        )
        lid = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return ok({"id": lid, "name": name, "blocks": blocks, "theme": theme, "published": False})

    if action == "get":
        lid = qs.get("id", "")
        if not lid.isdigit():
            conn.close()
            return err("Укажите id")
        cur.execute(
            "SELECT id, name, blocks, theme, published FROM landings WHERE id=%s AND user_id=%s",
            (int(lid), user_id),
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return err("Лендинг не найден", 404)
        blocks = row[2] if isinstance(row[2], list) else (json.loads(row[2]) if row[2] else [])
        theme = row[3] if isinstance(row[3], dict) else (json.loads(row[3]) if row[3] else {})
        return ok({"id": row[0], "name": row[1], "blocks": blocks, "theme": theme, "published": row[4]})

    if action == "save":
        body = json.loads(event.get("body") or "{}")
        lid = int(body.get("id", 0))
        name = (body.get("name") or "Мой лендинг").strip()[:200]
        blocks = body.get("blocks") or []
        theme = body.get("theme") or {}
        cur.execute(
            "UPDATE landings SET name=%s, blocks=%s, theme=%s, updated_at=NOW() WHERE id=%s AND user_id=%s",
            (name, json.dumps(blocks, ensure_ascii=False), json.dumps(theme, ensure_ascii=False), lid, user_id),
        )
        conn.commit()
        conn.close()
        return ok({"ok": True})

    if action == "publish":
        body = json.loads(event.get("body") or "{}")
        lid = int(body.get("id", 0))
        published = bool(body.get("published", True))
        cur.execute(
            "UPDATE landings SET published=%s, updated_at=NOW() WHERE id=%s AND user_id=%s",
            (published, lid, user_id),
        )
        conn.commit()
        conn.close()
        return ok({"ok": True, "published": published})

    if action == "delete":
        body = json.loads(event.get("body") or "{}")
        lid = int(body.get("id", 0))
        cur.execute("DELETE FROM landings WHERE id=%s AND user_id=%s", (lid, user_id))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    conn.close()
    return err("Unknown action", 404)