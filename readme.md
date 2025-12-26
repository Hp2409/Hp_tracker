# 🎓 HP Tracker – Exam Application Management System

HP Tracker is a Firebase-powered web application that helps students and aspirants track competitive exams, manage application status, and maintain personal notes — all in one place.

This project demonstrates real-world frontend engineering, cloud backend design, and scalable state management using Firebase.

---

## 🚀 Features

### 🔐 Authentication

* Firebase Authentication (Email & Password)
* Login, Signup, Logout
* Password reset support
* Persistent user sessions

### 📋 Exam Management

* **16 standard exams** loaded from a centralized master JSON file
* User-specific **custom exams**
* Track application status:

  * Applied
  * Not Applied
* Personal **notes per exam** with auto-save
* **Duplicate exam names prevented**

### 🧠 Smart Rules

* Master exams are **read-only**
* Only user-added exams can be edited or deleted
* Duplicate exam names blocked at creation
* UI state derived dynamically from Firestore

### 📊 Dashboard Analytics

* Total exams count
* Applied exams count
* Not applied exams count
* Branch-based filtering

### 🎨 UI / UX

* Modern dark theme
* Clean icon-aligned input fields
* Responsive layout
* Accessible controls

### ☁️ Deployment

* Firebase Hosting
* Firestore-backed persistence
* PWA-ready (Service Worker enabled)

---

## 🏗️ Tech Stack

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript (ES6+)

### Backend / Cloud

* Firebase Authentication
* Firebase Firestore
* Firebase Hosting

### Data Source

* Master exam list stored as JSON (GitHub-hosted)
* User-specific data stored in Firestore subcollections

---

## 📁 Project Structure

```
HP_TRACKER/
│
├── public/
│   ├── index.html          # Login / Signup
│   ├── dashboard.html      # Main dashboard
│   ├── dashboard.js        # Dashboard logic
│   ├── auth.js             # Authentication logic
│   ├── styles.css          # Global styles
│   ├── sw.js               # Service worker
│   ├── sw-register.js
│   └── manifest.json
│
├── exam_data/
│   └── exams.json          # Master exam list
│
├── firebase.json
├── .firebaserc
└── README.md
```

---

## 🔥 Firestore Data Model

```
users (collection)
 └── {userId} (document)
     ├── exam_state (subcollection)
     │    └── {examId}
     │         ├── status: "applied" | "not-applied"
     │         └── notes: string
     │
     └── custom_exams (subcollection)
          └── {customExamId}
               ├── exam_name
               ├── organization
               ├── branches
               ├── expected_month
               └── link
```

---

## 🧩 Key Design Decisions

### Why Firebase?

* No backend server maintenance
* Secure authentication
* Scalable NoSQL database
* Real-time data sync support

### Duplicate Prevention

* Exam names normalized before insertion
* Checked against both master and user-added exams

### State Synchronization

* Firestore is the source of truth
* Auto-save via event listeners
* Minimal network calls

### Deployment Workflow

* Local testing via VS Code
* Version control using Git
* Production deployment with `firebase deploy`

---

## ▶️ Run Locally

```bash
git clone https://github.com/Hp2409/Hp_tracker.git
cd HP_TRACKER
firebase serve
```


---

## 📈 Future Enhancements

* Exam deadline reminders
* Calendar integration
* Push notifications
* Admin-managed master exams
* Export data (CSV / PDF)

---

## 👤 Author

**Hariprasath (HP)**
Aspiring Software Engineer | Full Stack Enthusiast

---

## 📄 License

This project is intended for educational and portfolio use.
