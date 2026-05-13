import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.gemma_client import GemmaClient  # noqa: E402


def main() -> None:
    load_dotenv(ROOT / ".env")
    os.environ.setdefault("AI_PROVIDER", "google")
    client = GemmaClient()
    print(json.dumps(client.list_gemma_models(), indent=2))


if __name__ == "__main__":
    main()
