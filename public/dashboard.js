console.log("===== DASHBOARD.JS FILE IS LOADING =====");

/* ================= FIREBASE INIT ================= */
const firebaseConfig = {
  apiKey: "AIzaSyDnczxKTkqqHP3gpwFEAM6zEwXBKsN2q-E",
  authDomain: "hp-tracker-c9d56.firebaseapp.com",
  projectId: "hp-tracker-c9d56",
  storageBucket: "hp-tracker-c9d56.appspot.com",
  messagingSenderId: "791153884054",
  appId: "1:791153884054:web:8eebcba830cab91d767bb7"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

/* ================= CONFIG ================= */
const MASTER_EXAMS_URL =
  "https://raw.githubusercontent.com/Hp2409/Hp_tracker/master/exam_data/exams.json";

/* ================= STATE ================= */
let currentUser = null;
let masterExams = [];
let userState = {};
let userCustomExams = [];

/* ================= HELPERS ================= */
const normalize = s => s.trim().toLowerCase();

function examNameExists(name) {
  const n = normalize(name);
  return [...masterExams, ...userCustomExams].some(
    e => normalize(e.exam_name) === n
  );
}

/* ================= LOAD MASTER EXAMS ================= */
async function loadMasterExams() {
  const res = await fetch(MASTER_EXAMS_URL);
  masterExams = await res.json();
}

/* ================= LOAD USER DATA ================= */
async function loadUserData(uid) {
  userState = {};

  const stateSnap = await db
    .collection("users")
    .doc(uid)
    .collection("exam_state")
    .get();

  stateSnap.forEach(d => (userState[d.id] = d.data()));

  const customSnap = await db
    .collection("users")
    .doc(uid)
    .collection("custom_exams")
    .get();

  userCustomExams = customSnap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    custom: true
  }));
}

/* ================= RENDER ================= */
function render() {
  const tbody = document.getElementById("examsTableBody");
  tbody.innerHTML = "";

  const branchFilter = document.getElementById("branchFilter").value;
  const allExams = [...masterExams, ...userCustomExams];

  let applied = 0,
    notApplied = 0;

  allExams.forEach(exam => {
    const id = exam.id || exam.exam_name.replace(/\s+/g, "_");
    const state = userState[id] || { status: "not-applied", notes: "" };

    const branches = (exam.tags || exam.branches || ["All"]).map(normalize);

    if (
      branchFilter !== "all" &&
      !branches.includes(branchFilter) &&
      !branches.includes("all")
    )
      return;

    state.status === "applied" ? applied++ : notApplied++;

    const expected = exam.expected_month || exam.expected?.application || "—";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${exam.exam_name}</td>
      <td><a href="${exam.link}" target="_blank">${exam.organization || "Official Site"}</a></td>
      <td>${(exam.branches || exam.tags || ["All"]).join(", ")}</td>
      <td>${expected}</td>
      <td>
        <select class="status-select" data-id="${id}">
          <option value="not-applied" ${state.status === "not-applied" ? "selected" : ""}>Not Applied</option>
          <option value="applied" ${state.status === "applied" ? "selected" : ""}>Applied</option>
        </select>
      </td>
      <td>
        <textarea class="notes-box" data-id="${id}" placeholder="Write notes...">${state.notes || ""}</textarea>
      </td>
      <td>
        ${
          exam.custom
            ? `<button class="edit-btn" data-id="${exam.id}">Edit</button>
               <button class="delete-btn" data-id="${exam.id}">Delete</button>`
            : `<span style="opacity:.5">Standard</span>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("totalExams").textContent = allExams.length;
  document.getElementById("appliedCount").textContent = applied;
  document.getElementById("notAppliedCount").textContent = notApplied;
}

/* ================= EVENTS ================= */
document.addEventListener("click", async e => {
  /* DELETE */
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    if (!confirm("Delete this exam?")) return;

    await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("custom_exams")
      .doc(id)
      .delete();

    alert("Exam deleted successfully.");
    await loadUserData(currentUser.uid);
    render();
  }

  /* EDIT */
  if (e.target.classList.contains("edit-btn")) {
    const id = e.target.dataset.id;
    const exam = userCustomExams.find(e => e.id === id);

    const name = prompt("Exam name:", exam.exam_name);
    if (!name || (normalize(name) !== normalize(exam.exam_name) && examNameExists(name))) {
      alert("Duplicate exam name not allowed.");
      return;
    }

    const link = prompt("Official link:", exam.link);
    const branches = prompt(
      "Eligible branches (comma separated):",
      exam.branches.join(", ")
    );
    const month = prompt(
      "Expected application month/date:",
      exam.expected_month
    );

    await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("custom_exams")
      .doc(id)
      .update({
        exam_name: name.trim(),
        link: link.trim(),
        branches: branches.split(",").map(b => b.trim()),
        expected_month: month.trim()
      });

    alert("Exam updated successfully.");
    await loadUserData(currentUser.uid);
    render();
  }
});

/* ================= ADD NEW EXAM ================= */
document.getElementById("addExamBtn").addEventListener("click", async () => {
  const name = prompt("Exam name:");
  if (!name || examNameExists(name)) {
    alert("Duplicate or empty exam name.");
    return;
  }

  const link = prompt("Official link:");
  const branches = prompt("Eligible branches (comma separated):", "All");
  const month = prompt("Expected application month/date:", "—");

  await db
    .collection("users")
    .doc(currentUser.uid)
    .collection("custom_exams")
    .add({
      exam_name: name.trim(),
      organization: "User Added",
      branches: branches.split(",").map(b => b.trim()),
      expected_month: month.trim(),
      link: link.trim()
    });

  alert("New exam added successfully.");
  await loadUserData(currentUser.uid);
  render();
});

document.addEventListener("change", async e => {
  if (e.target.classList.contains("status-select")) {
    const id = e.target.dataset.id;
    userState[id] = { ...(userState[id] || {}), status: e.target.value };

    await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("exam_state")
      .doc(id)
      .set(userState[id], { merge: true });

    render();
  }
});

document.addEventListener(
  "blur",
  async e => {
    if (!e.target.classList.contains("notes-box")) return;
    const id = e.target.dataset.id;
    userState[id] = { ...(userState[id] || {}), notes: e.target.value };

    await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("exam_state")
      .doc(id)
      .set(userState[id], { merge: true });
  },
  true
);

/* ================= INIT ================= */
auth.onAuthStateChanged(async user => {
  if (!user) return (window.location.href = "index.html");

  currentUser = user;
  document.getElementById("userEmail").textContent = user.email;

  await loadMasterExams();
  await loadUserData(user.uid);
  render();
});

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) {
    console.error("Logout button not found");
    return;
  }

  logoutBtn.addEventListener("click", async () => {
    try {
      await auth.signOut();
      window.location.replace("index.html");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  });
});

