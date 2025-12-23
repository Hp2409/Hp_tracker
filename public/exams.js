// Exam loading and filtering logic
console.log('[HP Tracker] Exams module loaded');

const API_URL = "https://hp-tracker-backend.onrender.com/engineering-exams";
const table = document.getElementById("examTable");
const filter = document.getElementById("branchFilter");

let exams = [];

// Show loading state
table.innerHTML = "<tr><td colspan='4' style='text-align:center; padding: 30px;'>🔄 Loading exams...</td></tr>";

// Fetch exams from API
fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    console.log('[HP Tracker] Exams loaded:', data);
    exams = data.exams || [];
    render();
  })
  .catch((error) => {
    console.error('[HP Tracker] Failed to load exams:', error);
    table.innerHTML = `
      <tr>
        <td colspan='4' style='text-align:center; padding: 30px; color:#e53e3e;'>
          ⚠️ Failed to load exams. Please check your connection and try again.
        </td>
      </tr>
    `;
  });

// Listen for filter changes
filter.addEventListener("change", render);

// Render exam table
function render() {
  table.innerHTML = "";
  const branch = filter.value;

  // Filter exams by branch
  const filtered = exams.filter(e => 
    branch === "All" || e.branches.includes(branch)
  );

  if (filtered.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan='4' style='text-align:center; padding: 30px;'>
          📋 No exams found for this branch
        </td>
      </tr>
    `;
    return;
  }

  // Render each exam
  filtered.forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${e.exam_name}</strong></td>
      <td>${e.organization}</td>
      <td>${e.branches.join(", ")}</td>
      <td class="not-applied">Not Applied</td>
    `;
    table.appendChild(tr);
  });
}