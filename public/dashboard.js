console.log("===== DASHBOARD.JS FILE IS LOADING =====");

// ================= CONFIG =================
const MASTER_EXAMS_URL =
  "https://raw.githubusercontent.com/Hp2409/Hp_tracker/master/exam_data/exams.json";

const auth = firebase.auth();
const db = firebase.firestore();

// ================= STATE =================
let currentUser = null;
let masterExams = [];
let userState = {};

// ================= HELPERS =================
function normalizeBranch(b) {
  return b.toLowerCase();
}

// ================= LOAD MASTER EXAMS =================
async function loadMasterExams() {
  const res = await fetch(MASTER_EXAMS_URL);
  if (!res.ok) throw new Error("Failed to load master exams");
  masterExams = await res.json();
  console.log("[HP Tracker] Master exams loaded:", masterExams.length);
}

// ================= LOAD USER STATE =================
async function loadUserState(uid) {
  const snap = await db
    .collection("users")
    .doc(uid)
    .collection("exam_state")
    .get();

  snap.forEach(doc => {
    userState[doc.id] = doc.data();
  });
}

// ================= RENDER =================
function render() {
  const tbody = document.getElementById("examsTableBody");
  if (!tbody) {
    console.error("❌ examsTableBody missing in HTML");
    return;
  }

  const branchFilter = document.getElementById("branchFilter").value;
  tbody.innerHTML = "";

  let applied = 0;
  let notApplied = 0;

  masterExams.forEach(exam => {
    const branches = exam.branches.map(normalizeBranch);
    if (
      branchFilter !== "all" &&
      !branches.includes(branchFilter) &&
      !branches.includes("all engineering branches")
    ) {
      return;
    }

    const state = userState[exam.id] || { status: "not-applied", notes: "" };
    state.status === "applied" ? applied++ : notApplied++;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${exam.exam_name}</td>
      <td>${exam.organization}</td>
      <td>${exam.branches.join(", ")}</td>
      <td>${exam.expected_month}</td>
      <td>
        <select class="status-select" data-id="${exam.id}">
          <option value="not-applied" ${state.status === "not-applied" ? "selected" : ""}>Not Applied</option>
          <option value="applied" ${state.status === "applied" ? "selected" : ""}>Applied</option>
        </select>
      </td>
      <td>
        <a href="${exam.link}" target="_blank">Official</a>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("totalExams").textContent = masterExams.length;
  document.getElementById("appliedCount").textContent = applied;
  document.getElementById("notAppliedCount").textContent = notApplied;

  console.log("[HP Tracker] Rendered exams:", masterExams.length);
}

// ================= EVENTS =================
document.addEventListener("change", async e => {
  if (!e.target.classList.contains("status-select")) return;

  const examId = e.target.dataset.id;
  const status = e.target.value;

  await db
    .collection("users")
    .doc(currentUser.uid)
    .collection("exam_state")
    .doc(examId)
    .set({ status }, { merge: true });

  userState[examId] = { ...(userState[examId] || {}), status };
  render();
});

document.getElementById("branchFilter").addEventListener("change", render);

document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut().then(() => (window.location.href = "index.html"));
});

// ================= INIT =================
auth.onAuthStateChanged(async user => {
  if (!user) return (window.location.href = "index.html");

  currentUser = user;
  document.getElementById("userEmail").textContent = user.email;

  await loadMasterExams();
  await loadUserState(user.uid);
  render();
});
