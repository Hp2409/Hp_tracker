import json
import sys
from pathlib import Path
from datetime import datetime

# Ensure project root is in Python path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))

from exam_data.sources import SOURCES


def generate_exams():
    exams = []

    for src in SOURCES:
        exams.append({
            "exam_name": src["exam_name"],
            "organization": src["organization"],
            "branches": src["branches"],
            "application_date": datetime.now().strftime("%b %Y"),
            "status": src["status"],
            "link": src["link"]
        })

    output_path = ROOT_DIR / "exam_data" / "exams.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(exams, f, indent=2)


if __name__ == "__main__":
    generate_exams()
