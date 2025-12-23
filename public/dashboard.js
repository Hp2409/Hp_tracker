/**************************************
 * HP TRACKER – DASHBOARD (FINAL)
 * Master exams: GitHub exams.json
 * User state: Firestore
 **************************************/

console.log("===== DASHBOARD.JS FILE IS LOADING =====");

// ---------------- FIREBASE CONFIG ----------------
const firebaseConfig = {
  apiKey: "AIzaSyDnczxKTkqqHP3gpwFEAM6zEwXBKsN2q-E",
  authDomain: "hp-tracker-c9d56.firebaseapp.com",
  projectId: "hp-tracker-c9d56",
  storageBucket: "hp-tracker-c9d56.appspot.com",
  messagingSenderId: "791153884054",
  appId: "1:791153884054:web:8eebcba830cab91d767bb7"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// ---------------- CONSTANTS ----------------
const MASTER_EXAMS_URL =
  "https://raw.githubusercontent.com/Hp2409/Hp_tracker/master/exam_data/exams.json";

// ---------------- STATE ----------------
let currentUser = null;
let allExams = [];

// ---------------- UTIL ----------------
function formatExpected(expected) {
  if (!expected) return "-";
  return `${expected.application || "-"} / ${expected.exam || "-"}`;
}

// ---------------- MASTER EXAM SYNC ----------------
async function fetchMasterExams() {
  const res = await fetch(MASTER_EXAMS_URL);
  if (!res.ok) throw new Error("Failed to load master exams");
  return await res.json();
}

async function syncMasterExamsToUser(user) {
  console.log("[HP Tracker] Syncing master exams…");

  const masterExams = await fetchMasterExams();
  const examsRef = db.collection("users").doc(user.uid).collection("exams");
  const snapshot = await examsRef.get();

  const existing = new Set(
    snapshot.docs.map(d => d.data().exam_name)
  );

  const batch = db.batch();

  masterExams.forEach(exam => {
    if (!existing.has(exam.exam_name)) {
      const ref = examsRef.doc();
      batch.set(ref, {
        exam_name: exam.exam_name,
        category: exam.category,
        tags: exam.tags,
        expected: exam.expected,
        link: exam.link,
        status: "not-applied",
        notes: "",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  });

  if (!batch._mutations || batch._mutations.length === 0) {
    console.log("[HP Tracker] No new exams to sync");
    return;
  }

  await batch.commit();
  console.log("[HP Tracker] Master exams synced");
}

// ---------------- LOAD USER EXAMS ----------------
function loadUserExams() {
  const examsRef = db
    .collection("users")
    .doc(currentUser.uid)
    .collection("exams")
    .orderBy("createdAt", "desc");

  examsRef.onSnapshot(snapshot => {
    allExams = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log("[HP Tracker] Loaded exams:", allExams.length);
    render();
    updateStats();
  });
}

// ---------------- RENDER ----------------
function render() {
  const tbody = document.getElementById("examTable");
  const branch = document.getElementById("branchFilter")?.value || "All";

  tbody.innerHTML = "";

  let filtered = allExams;
  if (branch !== "All") {
    filtered = allExams.filter(e =>
      e.tags.includes(branch)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;">No exams found</td>
      </tr>
    `;
    return;
  }

  filtered.forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${e.exam_name}</strong></td>
      <td>${e.category}</td>
      <td>${formatExpected(e.expected)}</td>
      <td>
        <select data-id="${e.id}" class="status-select ${e.status}">
          <option value="not-applied" ${e.status === "not-applied" ? "selected" : ""}>Not Applied</option>
          <option value="applied" ${e.status === "applied" ? "selected" : ""}>Applied</option>
        </select>
      </td>
      <td>
        <a href="${e.link}" target="_blank">Official</a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ---------------- STATS ----------------
function updateStats() {
  document.getElementById("totalExams").textContent = allExams.length;
  document.getElementById("appliedCount").textContent =
    allExams.filter(e => e.status === "applied").length;
  document.getElementById("notAppliedCount").textContent =
    allExams.filter(e => e.status === "not-applied").length;
}

// ---------------- STATUS CHANGE ----------------
document.addEventListener("change", e => {
  if (e.target.classList.contains("status-select")) {
    const id = e.target.dataset.id;
    const status = e.target.value;

    db.collection("users")
      .doc(currentUser.uid)
      .collection("exams")
      .doc(id)
      .update({ status });
  }
});

// ---------------- AUTH ----------------
auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;
  document.getElementById("userEmail").textContent = user.email;

  await syncMasterExamsToUser(user);
  loadUserExams();
});

// ---------------- FILTER ----------------
document.getElementById("branchFilter")?.addEventListener("change", render);

// ---------------- LOGOUT ----------------
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  auth.signOut().then(() => (window.location.href = "index.html"));
});
