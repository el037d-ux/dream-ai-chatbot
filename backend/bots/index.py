"""CRUD для ботов + webhook интеграции. Action: ?action=list|create|get|save|webhooks|webhook-save|webhook-delete"""
import json
import os
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def ok(data: dict) -> dict:
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, default=str)}

def err(msg: str, code: int = 400) -> dict:
    return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg})}

def get_user(cur, token: str):
    if not token:
        return None
    cur.execute("""
        SELECT u.id FROM users u JOIN sessions s ON s.user_id = u.id
        WHERE s.token = %s AND s.expires_at > NOW()
    """, (token,))
    row = cur.fetchone()
    return row[0] if row else None

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "list")
    bot_id_str = qs.get("id", "")
    headers = event.get("headers") or {}
    token = headers.get("X-Auth-Token") or headers.get("x-auth-token") or ""

    conn = get_conn()
    cur = conn.cursor()
    user_id = get_user(cur, token)
    if not user_id:
        conn.close()
        return err("Не авторизован", 401)

    # ── LIST ────────────────────────────────────────────────────────
    if action == "list":
        cur.execute("""
            SELECT id, name, description, status, dialogs_count, created_at
            FROM bots WHERE user_id = %s AND status != 'deleted' ORDER BY created_at DESC
        """, (user_id,))
        bots = [{"id": r[0], "name": r[1], "description": r[2], "status": r[3],
                 "dialogs_count": r[4], "created_at": str(r[5])} for r in cur.fetchall()]
        conn.close()
        return ok({"bots": bots})

    # ── CREATE ───────────────────────────────────────────────────────
    if action == "create":
        body = json.loads(event.get("body") or "{}")
        name = (body.get("name") or "").strip()
        description = (body.get("description") or "").strip()
        if not name:
            conn.close()
            return err("Укажите название бота")
        cur.execute("""
            INSERT INTO bots (user_id, name, description)
            VALUES (%s,%s,%s) RETURNING id, name, description, status, dialogs_count, created_at
        """, (user_id, name, description))
        r = cur.fetchone()
        bot_id = r[0]
        cur.execute("""
            INSERT INTO bot_nodes (bot_id, node_id, type, label, message, pos_x, pos_y, var_name, validate, error_msg)
            VALUES (%s,'start_1','trigger','Старт','Привет! Чем могу помочь?',200,100,'','false','')
        """, (bot_id,))
        conn.commit()
        conn.close()
        return ok({"bot": {"id": r[0], "name": r[1], "description": r[2], "status": r[3], "dialogs_count": r[4], "created_at": str(r[5])}})

    # ── GET ──────────────────────────────────────────────────────────
    if action == "get":
        if not bot_id_str.isdigit():
            conn.close()
            return err("Укажите id бота")
        bot_id = int(bot_id_str)
        cur.execute("""SELECT id, name, description, status, dialogs_count, created_at,
            prompt_persona, prompt_goal, prompt_context, prompt_instructions, prompt_constraints, prompt_examples
            FROM bots WHERE id=%s AND user_id=%s""", (bot_id, user_id))
        r = cur.fetchone()
        if not r:
            conn.close()
            return err("Бот не найден", 404)
        cur.execute("""SELECT node_id, type, label, message, pos_x, pos_y,
            COALESCE(var_name,''), COALESCE(validate,false), COALESCE(error_msg,''), COALESCE(extra,'{}')
            FROM bot_nodes WHERE bot_id=%s""", (bot_id,))
        nodes = []
        for n in cur.fetchall():
            extra = n[9] if isinstance(n[9], dict) else {}
            nodes.append({
                "id": n[0], "type": n[1], "label": n[2], "message": n[3], "x": n[4], "y": n[5],
                "varName": n[6], "validate": bool(n[7]), "errorMsg": n[8],
                "webhookUrl": extra.get("webhookUrl", ""),
                "webhookMethod": extra.get("webhookMethod", "POST"),
                "webhookSecret": extra.get("webhookSecret", ""),
                "buttons": extra.get("buttons", []),
            })
        cur.execute("SELECT edge_id, source_node_id, target_node_id FROM bot_edges WHERE bot_id=%s", (bot_id,))
        edges = [{"id": e[0], "source": e[1], "target": e[2]} for e in cur.fetchall()]
        conn.close()
        return ok({"bot": {
            "id": r[0], "name": r[1], "description": r[2], "status": r[3], "dialogs_count": r[4], "created_at": str(r[5]),
            "prompt_persona": r[6] or "", "prompt_goal": r[7] or "", "prompt_context": r[8] or "",
            "prompt_instructions": r[9] or "", "prompt_constraints": r[10] or "", "prompt_examples": r[11] or ""
        }, "nodes": nodes, "edges": edges})

    # ── SAVE ─────────────────────────────────────────────────────────
    if action == "save":
        if not bot_id_str.isdigit():
            conn.close()
            return err("Укажите id бота")
        bot_id = int(bot_id_str)
        cur.execute("SELECT id FROM bots WHERE id=%s AND user_id=%s", (bot_id, user_id))
        if not cur.fetchone():
            conn.close()
            return err("Бот не найден", 404)
        body = json.loads(event.get("body") or "{}")
        nodes = body.get("nodes", [])
        edges = body.get("edges", [])
        prompt = body.get("prompt", {})
        # Сначала обновляем все существующие с маркером, потом вставляем новые
        cur.execute("UPDATE bot_nodes SET type='__del__' WHERE bot_id=%s", (bot_id,))
        cur.execute("UPDATE bot_edges SET source_node_id='__del__' WHERE bot_id=%s", (bot_id,))
        for n in nodes:
            extra = {}
            if n.get("webhookUrl"): extra["webhookUrl"] = n["webhookUrl"]
            if n.get("webhookMethod"): extra["webhookMethod"] = n["webhookMethod"]
            if n.get("webhookSecret"): extra["webhookSecret"] = n["webhookSecret"]
            if n.get("buttons"): extra["buttons"] = n["buttons"]
            cur.execute("""INSERT INTO bot_nodes
                (bot_id, node_id, type, label, message, pos_x, pos_y, var_name, validate, error_msg, extra)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (bot_id, node_id) DO UPDATE SET
                    type=EXCLUDED.type, label=EXCLUDED.label, message=EXCLUDED.message,
                    pos_x=EXCLUDED.pos_x, pos_y=EXCLUDED.pos_y, var_name=EXCLUDED.var_name,
                    validate=EXCLUDED.validate, error_msg=EXCLUDED.error_msg, extra=EXCLUDED.extra""", (
                bot_id, n["id"], n.get("type","message"), n.get("label",""), n.get("message",""),
                n.get("x",100), n.get("y",100),
                n.get("varName",""), bool(n.get("validate", True)), n.get("errorMsg",""),
                json.dumps(extra)
            ))
        for e in edges:
            cur.execute("""INSERT INTO bot_edges (bot_id, edge_id, source_node_id, target_node_id)
                VALUES (%s,%s,%s,%s) ON CONFLICT (bot_id, edge_id) DO UPDATE SET
                source_node_id=EXCLUDED.source_node_id, target_node_id=EXCLUDED.target_node_id""",
                (bot_id, e["id"], e["source"], e["target"]))
        cur.execute("""UPDATE bots SET updated_at=NOW(),
            prompt_persona=%s, prompt_goal=%s, prompt_context=%s,
            prompt_instructions=%s, prompt_constraints=%s, prompt_examples=%s
            WHERE id=%s""", (
            prompt.get("persona",""), prompt.get("goal",""), prompt.get("context",""),
            prompt.get("instructions",""), prompt.get("constraints",""), prompt.get("examples",""),
            bot_id
        ))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # ── WEBHOOKS LIST ────────────────────────────────────────────────
    if action == "webhooks":
        if not bot_id_str.isdigit():
            conn.close()
            return err("Укажите id бота")
        bot_id = int(bot_id_str)
        cur.execute("SELECT id FROM bots WHERE id=%s AND user_id=%s", (bot_id, user_id))
        if not cur.fetchone():
            conn.close()
            return err("Бот не найден", 404)
        cur.execute("""SELECT id, name, url, method, headers, secret, events, active, created_at
            FROM bot_webhooks WHERE bot_id=%s ORDER BY created_at DESC""", (bot_id,))
        webhooks = [{"id": w[0], "name": w[1], "url": w[2], "method": w[3],
                     "headers": w[4] or {}, "secret": w[5] or "", "events": list(w[6] or []),
                     "active": w[7], "created_at": str(w[8])} for w in cur.fetchall()]
        conn.close()
        return ok({"webhooks": webhooks})

    # ── WEBHOOK SAVE (create/update) ─────────────────────────────────
    if action == "webhook-save":
        if not bot_id_str.isdigit():
            conn.close()
            return err("Укажите id бота")
        bot_id = int(bot_id_str)
        cur.execute("SELECT id FROM bots WHERE id=%s AND user_id=%s", (bot_id, user_id))
        if not cur.fetchone():
            conn.close()
            return err("Бот не найден", 404)
        body = json.loads(event.get("body") or "{}")
        name = (body.get("name") or "Webhook").strip()
        url = (body.get("url") or "").strip()
        if not url:
            conn.close()
            return err("Укажите URL")
        method = body.get("method", "POST")
        secret = body.get("secret", "")
        events = body.get("events", ["lead.created"])
        active = body.get("active", True)
        wh_id = body.get("id")
        if wh_id:
            cur.execute("""UPDATE bot_webhooks SET name=%s, url=%s, method=%s, secret=%s,
                events=%s, active=%s WHERE id=%s AND bot_id=%s RETURNING id""",
                (name, url, method, secret, events, active, int(wh_id), bot_id))
            row = cur.fetchone()
            if not row:
                conn.close()
                return err("Webhook не найден", 404)
            conn.commit()
            conn.close()
            return ok({"ok": True, "id": row[0]})
        else:
            cur.execute("""INSERT INTO bot_webhooks (bot_id, name, url, method, secret, events, active)
                VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                (bot_id, name, url, method, secret, events, active))
            row = cur.fetchone()
            conn.commit()
            conn.close()
            return ok({"ok": True, "id": row[0]})

    # ── DELETE BOT ───────────────────────────────────────────────────
    if action == "delete":
        if not bot_id_str.isdigit():
            conn.close()
            return err("Укажите id бота")
        bot_id = int(bot_id_str)
        cur.execute("SELECT id FROM bots WHERE id=%s AND user_id=%s", (bot_id, user_id))
        if not cur.fetchone():
            conn.close()
            return err("Бот не найден", 404)
        # Удаляем связанные данные вручную (без CASCADE)
        cur.execute("UPDATE bot_nodes SET type='deleted' WHERE bot_id=%s", (bot_id,))
        cur.execute("UPDATE bot_edges SET source_node_id='deleted' WHERE bot_id=%s", (bot_id,))
        cur.execute("UPDATE bots SET status='deleted', name=CONCAT('[удалён] ', name), updated_at=NOW() WHERE id=%s", (bot_id,))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # ── WEBHOOK DELETE ───────────────────────────────────────────────
    if action == "webhook-toggle":
        body = json.loads(event.get("body") or "{}")
        wh_id = body.get("id")
        active = body.get("active", True)
        if not wh_id:
            conn.close()
            return err("Укажите id webhook")
        cur.execute("""UPDATE bot_webhooks SET active=%s WHERE id=%s
            AND bot_id IN (SELECT id FROM bots WHERE user_id=%s) RETURNING id""",
            (active, int(wh_id), user_id))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    conn.close()
    return err("Unknown action", 404)