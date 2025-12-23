// Firebase Configuration
console.log('===== DASHBOARD.JS FILE IS LOADING =====');
alert('Dashboard.js loaded!');
const firebaseConfig = {
    apiKey: "AIzaSyDnczxKTkqqHP3gpwFEAM6zEwXBKsN2q-E",
    authDomain: "hp-tracker-c9d56.firebaseapp.com",
    databaseURL: "https://hp-tracker-c9d56-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "hp-tracker-c9d56",
    storageBucket: "hp-tracker-c9d56.firebasestorage.app",
    messagingSenderId: "791153884054",
    appId: "1:791153884054:web:8eebcba830cab91d767bb7",
    measurementId: "G-N9H7DLEBPY"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let currentEditingExamId = null;
let authCheckDone = false;

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Initialize sample data for new users
async function initializeSampleData(userId) {
    try {
        const examsRef = db.collection('users').doc(userId).collection('exams');
        const snapshot = await examsRef.get();
        
        if (snapshot.empty) {
            console.log('[HP Tracker] Initializing sample data for new user');
            const sampleExams = [
                {
                    name: 'SSC Junior Engineer (JE)',
                    organization: 'Staff Selection Commission',
                    branches: ['Civil', 'Mechanical', 'Electrical'],
                    applicationDate: '2024-02-15',
                    status: 'not-applied',
                    notes: '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                },
                {
                    name: 'GATE (PSU Recruitment)',
                    organization: 'Public Sector Undertakings',
                    branches: ['All Engineering Branches'],
                    applicationDate: '2024-01-20',
                    status: 'not-applied',
                    notes: '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                },
                {
                    name: 'ISRO Scientist / Engineer',
                    organization: 'ISRO',
                    branches: ['CSE', 'ECE', 'EEE', 'ME'],
                    applicationDate: '2024-03-10',
                    status: 'not-applied',
                    notes: '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                },
                {
                    name: 'BARC Scientific Officer',
                    organization: 'Bhabha Atomic Research Centre',
                    branches: ['Mechanical', 'Electrical', 'CSE'],
                    applicationDate: '2024-04-05',
                    status: 'not-applied',
                    notes: '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                },
                {
                    name: 'DRDO Scientist Entry Test',
                    organization: 'Defence Research Development Org',
                    branches: ['All Engineering Branches'],
                    applicationDate: '2024-03-25',
                    status: 'not-applied',
                    notes: '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }
            ];

            const batch = db.batch();
            sampleExams.forEach(exam => {
                const docRef = examsRef.doc();
                batch.set(docRef, exam);
            });
            await batch.commit();
            console.log('[HP Tracker] Sample data initialized');
        }
    } catch (error) {
        console.error('[HP Tracker] Error initializing sample data:', error);
    }
}

// Load exams from Firestore with real-time updates
function loadExams() {
    if (!currentUser) return;

    const examsRef = db.collection('users').doc(currentUser.uid).collection('exams');
    
    // Real-time listener for exams
    examsRef.orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        const exams = [];
        snapshot.forEach(doc => {
            exams.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('[HP Tracker] Loaded exams:', exams.length);
        filterExams(exams);
        updateStatistics(exams);
    }, error => {
        console.error('[HP Tracker] Error loading exams:', error);
        showNotification('Error loading exams', 'error');
    });
}

// Render exams table
function renderExamsTable(exams) {
    const tbody = document.getElementById('examsTableBody');
    if (!tbody) return;

    if (exams.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #999;">No exams found</td></tr>';
        return;
    }

    const fragment = document.createDocumentFragment();
    
    exams.forEach(exam => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="exam-name">${exam.name}</td>
            <td>${exam.organization}</td>
            <td>
                <div class="branches-container">
                    ${exam.branches.map(branch => `<span class="branch-badge">${branch}</span>`).join('')}
                </div>
            </td>
            <td>
                <div class="date-cell">
                    <i class="fas fa-calendar-alt"></i>
                    ${formatDate(exam.applicationDate)}
                </div>
            </td>
            <td>
                <select class="status-select status-${exam.status}" data-id="${exam.id}">
                    <option value="applied" ${exam.status === 'applied' ? 'selected' : ''}>Applied</option>
                    <option value="not-applied" ${exam.status === 'not-applied' ? 'selected' : ''}>Not Applied</option>
                </select>
            </td>
            <td>
                <button class="btn-notes" data-id="${exam.id}">
                    <i class="fas fa-sticky-note"></i>
                    ${exam.notes ? 'Edit Notes' : 'Add Notes'}
                </button>
            </td>
        `;
        fragment.appendChild(row);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
}

// Filter exams
function filterExams(allExams) {
    const selectedBranch = document.getElementById('branchFilter')?.value || 'all';
    let filteredExams = allExams;
    
    if (selectedBranch !== 'all') {
        filteredExams = allExams.filter(exam => {
            return exam.branches.some(branch => 
                branch.toLowerCase().includes(selectedBranch.toLowerCase())
            ) || exam.branches.includes('All Engineering Branches');
        });
    }
    
    renderExamsTable(filteredExams);
}

// Update statistics
function updateStatistics(exams) {
    const total = exams.length;
    const applied = exams.filter(e => e.status === 'applied').length;
    const notApplied = total - applied;
    
    const totalEl = document.getElementById('totalExams');
    const appliedEl = document.getElementById('appliedCount');
    const notAppliedEl = document.getElementById('notAppliedCount');
    
    if (totalEl) totalEl.textContent = total;
    if (appliedEl) appliedEl.textContent = applied;
    if (notAppliedEl) notAppliedEl.textContent = notApplied;
}

// Update exam status in Firestore
async function updateExamStatus(examId, newStatus) {
    if (!currentUser) return;
    
    try {
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('exams')
            .doc(examId)
            .update({
                status: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        console.log('[HP Tracker] Status updated:', examId, newStatus);
        showNotification('Status updated successfully', 'success');
    } catch (error) {
        console.error('[HP Tracker] Error updating status:', error);
        showNotification('Error updating status', 'error');
    }
}

// Open notes modal
async function openNotesModal(examId) {
    if (!currentUser) return;
    
    try {
        const doc = await db.collection('users')
            .doc(currentUser.uid)
            .collection('exams')
            .doc(examId)
            .get();
        
        if (doc.exists) {
            const exam = doc.data();
            currentEditingExamId = examId;
            document.getElementById('modalTitle').textContent = `Notes for ${exam.name}`;
            document.getElementById('notesTextarea').value = exam.notes || '';
            document.getElementById('notesModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('[HP Tracker] Error loading exam:', error);
        showNotification('Error loading exam details', 'error');
    }
}

// Close notes modal
function closeNotesModal() {
    document.getElementById('notesModal').style.display = 'none';
    currentEditingExamId = null;
    document.getElementById('notesTextarea').value = '';
}

// Save notes to Firestore
async function saveNotes() {
    if (!currentEditingExamId || !currentUser) return;
    
    const notes = document.getElementById('notesTextarea').value;
    
    try {
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('exams')
            .doc(currentEditingExamId)
            .update({
                notes: notes,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        console.log('[HP Tracker] Notes saved:', currentEditingExamId);
        showNotification('Notes saved successfully', 'success');
        closeNotesModal();
    } catch (error) {
        console.error('[HP Tracker] Error saving notes:', error);
        showNotification('Error saving notes', 'error');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#48bb78' : '#f56565'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        }).catch(error => {
            console.error('[HP Tracker] Logout error:', error);
            showNotification('Error logging out', 'error');
        });
    }
}

// Event delegation
document.addEventListener('click', function(e) {
    // Handle modal close
    if (e.target.id === 'notesModal') {
        closeNotesModal();
    }
    
    // Handle notes button
    const notesBtn = e.target.closest('.btn-notes');
    if (notesBtn) {
        const examId = notesBtn.dataset.id;
        openNotesModal(examId);
    }
});

// Handle status change
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('status-select')) {
        const examId = e.target.dataset.id;
        const newStatus = e.target.value;
        e.target.className = `status-select status-${newStatus}`;
        updateExamStatus(examId, newStatus);
    }
});

// Initialize
function init() {
    if (!authCheckDone) {
        authCheckDone = true;
        auth.onAuthStateChanged(async user => {
            if (user) {
                currentUser = user;
                document.getElementById('userEmail').textContent = user.email;
                
                // Initialize sample data for new users
                await initializeSampleData(user.uid);
                
                // Load exams with real-time updates
                loadExams();
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    // Setup event listeners
    const branchFilter = document.getElementById('branchFilter');
    if (branchFilter) {
        branchFilter.addEventListener('change', () => {
            // Trigger re-filter on current data
            loadExams();
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Modal save button
    const saveNotesBtn = document.getElementById('saveNotesBtn');
    if (saveNotesBtn) {
        saveNotesBtn.addEventListener('click', saveNotes);
    }

    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeNotesModal);
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Run once when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}