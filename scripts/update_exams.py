import json
import sys
from pathlib import Path

# Fix Python path so exam_data is found
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from exam_data.sources import EXAMS, EXPECTED_MONTHS

OUTPUT = ROOT_DIR / "exam_data" / "exams.json"

final_exams = []

for exam in EXAMS:
    expected = EXPECTED_MONTHS.get(exam["exam_name"])

    final_exams.append({
        "exam_name": exam["exam_name"],
        "category": exam["category"],
        "tags": exam["tags"],
        "status": "Expected",
        "expected": expected,
        "link": exam["link"]
    })

with open(OUTPUT, "w", encoding="utf-8") as f:
    json.dump(final_exams, f, indent=2)
