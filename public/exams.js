// Fetch exams from GitHub JSON
console.log("[HP Tracker] Loading exams from GitHub JSON");

const EXAMS_JSON_URL =
  "https://raw.githubusercontent.com/Hp2409/Hp_tracker/master/exam_data/exams.json";

fetch(EXAMS_JSON_URL)
  .then(res => {
    if (!res.ok) throw new Error("Failed to load exams.json");
    return res.json();
  })
  .then(data => {
    exams = data;
    console.log("[HP Tracker] Loaded exams:", exams.length);
    render();
  })
  .catch(err => {
    console.error("[HP Tracker] Exam load failed:", err);
    table.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;color:red;">
          Failed to load exams
        </td>
      </tr>
    `;
  });


