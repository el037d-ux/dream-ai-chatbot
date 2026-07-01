"""Загрузка изображений в S3-хранилище. Принимает base64-картинку в JSON, возвращает публичный CDN-URL."""
import json
import os
import base64
import uuid
import boto3

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}

ALLOWED = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
}

MAX_BYTES = 6 * 1024 * 1024  # 6 МБ


def ok(data: dict) -> dict:
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data)}


def err(msg: str, code: int = 400) -> dict:
    return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg})}


def handler(event: dict, context) -> dict:
    """Загрузка одного изображения. POST c полями content_type и data (base64)."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    if event.get("httpMethod") != "POST":
        return err("Только POST", 405)

    body = json.loads(event.get("body") or "{}")
    content_type = (body.get("content_type") or "").lower().strip()
    data_b64 = body.get("data") or ""

    if content_type not in ALLOWED:
        return err("Поддерживаются форматы: PNG, JPG, GIF, WEBP, SVG")

    if "," in data_b64:
        data_b64 = data_b64.split(",", 1)[1]

    try:
        raw = base64.b64decode(data_b64)
    except Exception:
        return err("Не удалось прочитать файл")

    if not raw:
        return err("Пустой файл")
    if len(raw) > MAX_BYTES:
        return err("Файл больше 6 МБ")

    ext = ALLOWED[content_type]
    key = f"uploads/{uuid.uuid4().hex}.{ext}"

    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    s3.put_object(Bucket="files", Key=key, Body=raw, ContentType=content_type)

    url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return ok({"url": url})
