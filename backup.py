import os
import shutil
import zipfile
import datetime
import subprocess
import requests
from pymongo import MongoClient

MONGO_URI = os.environ["MONGO_URI"].rstrip("/")
DB_NAME = os.environ["MONGO_DB"]
BOT_TOKEN = os.environ["TG_BOT_TOKEN"]
CHAT_ID = os.environ["TG_CHAT_ID"]
TG_THREAD_ID=os.environ["TG_THREAD_ID"]

BASE_DIR = "/tmp/mongo_backup"
DATE = datetime.datetime.utcnow().strftime("%Y-%m-%d")
CAPTION_DATE = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

EXPORT_DIR = f"{BASE_DIR}/export_{DB_NAME}_{DATE}"

EXPORT_ZIP = f"{BASE_DIR}/{DB_NAME}_mongoexport_{DATE}.zip"

def run(cmd: list[str]) -> None:
    print("RUN:", " ".join(cmd))
    p = subprocess.run(cmd, text=True, capture_output=True)
    if p.stdout:
        print("STDOUT:\n", p.stdout)
    if p.stderr:
        print("STDERR:\n", p.stderr)
    if p.returncode != 0:
        raise subprocess.CalledProcessError(p.returncode, cmd, output=p.stdout, stderr=p.stderr)

def zip_dir(src_dir: str, zip_path: str) -> None:
    print(f"Zipping: {src_dir} -> {zip_path}")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk(src_dir):
            for f in files:
                p = os.path.join(root, f)
                z.write(p, arcname=os.path.relpath(p, src_dir))

def send_doc(path: str, caption: str) -> None:
    print(f"Sending to Telegram: {path}")
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendDocument"
    with open(path, "rb") as f:
        r = requests.post(
            url,
            data={"chat_id": CHAT_ID,"message_thread_id": TG_THREAD_ID, "caption": caption},
            files={"document": f},
            timeout=300,
        )
    print("Telegram:", r.status_code, r.text)
    r.raise_for_status()

def main():
    os.makedirs(BASE_DIR, exist_ok=True)
    os.makedirs(EXPORT_DIR, exist_ok=True)

     #  mongoexport (readable JSON)  ✅ no --gzip
    print("===  mongoexport (Readable JSON) ===")
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collections = db.list_collection_names()
    client.close()

    if not collections:
        raise RuntimeError(f"No collections found in DB '{DB_NAME}'. Check MONGO_DB name.")

    failed = []
    for col in collections:
        out_file = os.path.join(EXPORT_DIR, f"{col}.json")  # ✅ plain json
        try:
            run([
                "mongoexport",
                "--uri", MONGO_URI,
                "--db", DB_NAME,
                "--collection", col,
                "--type=json",
                "--jsonArray", 
                "--out", out_file,
                "--forceTableScan",
            ])
        except subprocess.CalledProcessError:
            failed.append(col)
            print(f"⚠️ mongoexport failed for '{col}'. continuing...")

    # 3) zip
    print("===  Zipping outputs ===")
    zip_dir(EXPORT_DIR, EXPORT_ZIP)

    # 4) send
    print("===  Sending both zips to Telegram ===")
    send_doc(EXPORT_ZIP, f"{DB_NAME} mongoexport (readable JSON) - {CAPTION_DATE}")

    # Optional: report failed exports
    if failed:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        requests.post(url, data={"chat_id": CHAT_ID,"message_thread_id": TG_THREAD_ID, "text": "⚠️ mongoexport failed: " + ", ".join(failed)}, timeout=60)

    # 5) cleanup
    print("===  Cleanup ===")
    shutil.rmtree(EXPORT_DIR, ignore_errors=True)
    for p in [EXPORT_ZIP]:
        try:
            os.remove(p)
        except FileNotFoundError:
            pass

    print("✅ Done.")

if __name__ == "__main__":
    main()