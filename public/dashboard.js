console.log("===== DASHBOARD.JS FILE IS LOADING =====");

// =====================================================
// FIREBASE INITIALIZATION (MANDATORY)
// =====================================================
const firebaseConfig = {
  apiKey: "AIzaSyDnczxKTkqqHP3gpwFEAM6zEwXBKsN2q-E",
  authDomain: "hp-tracker-c9d56.firebaseapp.com",
  projectId: "hp-tracker-c9d56",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// =====================================================
// CONFIG
// =====================================================
const MASTER_EXAMS_URL =
  "https://raw.githubusercontent.com/Hp2409/Hp_tracker/master/exam_data/exams.json";

// =====================================================
// STATE
// =====================================================
let currentUser = null;
let masterExams = [];
let userState = {};

// =====================================================
// HELPERS
// =====================================================
function normalizeBranch(branch) {
  return branch.toLowerCase().replace(" engineering", "");
}

function getExamId(exam) {
  return exam.exam_name.replace(/\s+/g, "_").toLowerCase();
}

// =====================================================
// LOAD MASTER EXAMS (FROM GITHUB)
// =====================================================
async function loadMasterExams() {
  const res = await fetch(MASTER_EXAMS_URL);
  if (!res.ok) {
    throw new Error("Failed to load exams.json");
  }
  masterExams = await res.json();
  console.log("[HP Tracker] Master exams loaded:", masterExams.length);
}

// =====================================================
// LOAD USER STATE (APPLIED / NOTES)
// =====================================================
async function loadUserState(uid) {
  userState = {};
  const snap = await db
    .collection("users")
    .doc(uid)
    .collection("exam_state")
    .get();

  snap.forEach(doc => {
    userState[doc.id] = doc.data();
  });
}

// =====================================================
// RENDER DASHBOARD
// =====================================================
function render() {
  const tbody = document.getElementById("examsTableBody");
  if (!tbody) {
    console.error("❌ examsTableBody not found");
    return;
  }

  const branchFilter = document.getElementById("branchFilter").value;
  tbody.innerHTML = "";

  let applied = 0;
  let notApplied = 0;

  masterExams.forEach(exam => {
    const examId = getExamId(exam);
    const branches = exam.branches.map(normalizeBranch);

    if (
      branchFilter !== "all" &&
      !branches.includes(branchFilter) &&
      !branches.includes("all")
    ) {
      return;
    }

    const state = userState[examId] || { status: "not-applied" };
    state.status === "applied" ? applied++ : notApplied++;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${exam.exam_name}</td>
      <td>${exam.organization}</td>
      <td>${exam.branches.join(", ")}</td>
      <td>${exam.expected_month || "-"}</td>
      <td>
        <select class="status-select" data-id="${examId}">
          <option value="not-applied" ${state.status === "not-applied" ? "selected" : ""}>
            Not Applied
          </option>
          <option value="applied" ${state.status === "applied" ? "selected" : ""}>
            Applied
          </option>
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

// =====================================================
// EVENTS
// =====================================================
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

  userState[examId] = { status };
  render();
});

document.getElementById("branchFilter").addEventListener("change", render);

document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
});

// =====================================================
// INIT
// =====================================================
auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;
  document.getElementById("userEmail").textContent = user.email;

  try {
    await loadMasterExams();
    await loadUserState(user.uid);
    render();
  } catch (err) {
    console.error("[HP Tracker] Init error:", err);
  }
});
