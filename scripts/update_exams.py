import json
from datetime import datetime
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

    with open("exam-data/exams.json", "w") as f:
        json.dump(exams, f, indent=2)

if __name__ == "__main__":
    generate_exams()
