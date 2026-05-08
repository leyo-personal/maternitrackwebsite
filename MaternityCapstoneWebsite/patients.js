// Sample patient data
const samplePatients = [
  {
    id: 1,
    fullName: "Maria Santos",
    age: 28,
    contact: "0917-123-4567",
    email: "maria.santos@email.com",
    address: "Barangay 1, Real, Laguna",
    medicalHistory: "No previous surgeries. Regular prenatal check-ups.",
    allergies: "Penicillin (mild rash)",
    status: "active",
    dateAdded: "2026-01-10"
  },
  {
    id: 2,
    fullName: "Rosa Reyes",
    age: 32,
    contact: "0918-234-5678",
    email: "rosa.reyes@email.com",
    address: "Barangay 2, Real, Laguna",
    medicalHistory: "Thyroid condition managed with medication. Previous C-section in 2020.",
    allergies: "None known",
    status: "active",
    dateAdded: "2026-01-15"
  },
  {
    id: 3,
    fullName: "Ana Villalobos",
    age: 25,
    contact: "0919-345-6789",
    email: "ana.villalobos@email.com",
    address: "Barangay 3, Real, Laguna",
    medicalHistory: "First-time pregnancy. Good overall health.",
    allergies: "Latex",
    status: "active",
    dateAdded: "2026-02-20"
  },
  {
    id: 4,
    fullName: "Carmen Gonzales",
    age: 35,
    contact: "0920-456-7890",
    email: "carmen.gonzales@email.com",
    address: "Barangay 4, Real, Laguna",
    medicalHistory: "Gestational diabetes managed with diet. Monitor closely.",
    allergies: "Aspirin",
    status: "active",
    dateAdded: "2026-03-01"
  }
];

const STORAGE_PATIENTS_KEY = "maternitrackPatients";

// Initialize localStorage
function initializePatients() {
  if (!localStorage.getItem(STORAGE_PATIENTS_KEY)) {
    localStorage.setItem(STORAGE_PATIENTS_KEY, JSON.stringify(samplePatients));
  }
}

// Load patients from storage
function loadPatients() {
  try {
    const raw = localStorage.getItem(STORAGE_PATIENTS_KEY);
    return raw ? JSON.parse(raw) : samplePatients;
  } catch (e) {
    return samplePatients;
  }
}

// Save patients to storage
function savePatients(patients) {
  localStorage.setItem(STORAGE_PATIENTS_KEY, JSON.stringify(patients));
}

// Get next patient ID
function getNextPatientId() {
  const patients = loadPatients();
  const maxId = patients.reduce((max, p) => Math.max(max, p.id || 0), 0);
  return maxId + 1;
}

// Format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Calculate stats
function calculateStats() {
  const patients = loadPatients();
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const total = patients.length;
  const thisMonth = patients.filter(p => {
    const date = new Date(p.dateAdded);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;
  const active = patients.filter(p => p.status === 'active').length;

  return { total, thisMonth, active };
}

// Update stat cards
function updateStats() {
  const stats = calculateStats();
  const totalEl = document.getElementById('stat-total');
  const monthEl = document.getElementById('stat-this-month');
  const activeEl = document.getElementById('stat-active');

  if (totalEl) totalEl.textContent = stats.total;
  if (monthEl) monthEl.textContent = stats.thisMonth;
  if (activeEl) activeEl.textContent = stats.active;
}

// Filter and sort patients
function applyFiltersAndSort(patients, search, status, sortBy) {
  let filtered = patients;

  // Search
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => 
      !p.archived &&
      (p.fullName.toLowerCase().includes(q) ||
      p.contact.toLowerCase().includes(q) ||
      (p.email && p.email.toLowerCase().includes(q)))
    );
  }

  // Status filter
  if (status !== 'all') {
    filtered = filtered.filter(p => p.status === status && !p.archived);
  }

  // Sort
  filtered.sort((a, b) => {
    switch(sortBy) {
      case 'name-asc':
        return a.fullName.localeCompare(b.fullName);
      case 'name-desc':
        return b.fullName.localeCompare(a.fullName);
      case 'date-new':
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      case 'date-old':
        return new Date(a.dateAdded) - new Date(b.dateAdded);
      case 'age-asc':
        return a.age - b.age;
      case 'age-desc':
        return b.age - a.age;
      default:
        return 0;
    }
  });

  return filtered;
}

// Render patients table
function renderTable() {
  const tbody = document.getElementById('patientsTableBody');
  if (!tbody) return;

  const search = (document.getElementById('patientSearchInput') || {}).value || '';
  const status = (document.getElementById('filterStatus') || {}).value || 'all';
  const sortBy = (document.getElementById('sortBy') || {}).value || 'name-asc';

  const patients = loadPatients();
  const filtered = applyFiltersAndSort(patients, search, status, sortBy);

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">
          <p>No patients found.</p>
        </td>
      </tr>
    `;
    updateStats();
    return;
  }

  const rows = filtered.map(p => `
    <tr>
      <td>${escapeHtml(p.fullName)}</td>
      <td>${p.age}</td>
      <td>${escapeHtml(p.contact)}</td>
      <td>${escapeHtml(p.email || '-')}</td>
      <td>${escapeHtml(p.medicalHistory ? p.medicalHistory.substring(0, 50) + '...' : '-')}</td>
      <td>
        <span class="status-badge status-badge-${p.status}">
          ${p.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td>${formatDate(p.dateAdded)}</td>
      <td>
        <div class="action-btn-group">
          <button class="action-btn" onclick="openEditModal(${p.id})" title="Edit patient" style="gap: 6px;">
            <i class="bi bi-pencil-fill"></i>Edit
          </button>
          <button class="action-btn" onclick="openArchiveModal(${p.id})" title="Archive patient" style="gap: 6px;">
            <i class="bi bi-archive"></i>Archive
          </button>
        </div>
      </td>
    </tr>
  `);

  tbody.innerHTML = rows.join('');
  updateStats();
}

// Escape HTML
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Modal functions
function openEditModal(patientId) {
  const patients = loadPatients();
  const patient = patients.find(p => p.id === patientId);
  
  if (!patient) return;

  document.getElementById('editPatientName').value = patient.fullName;
  document.getElementById('editPatientAge').value = patient.age;
  document.getElementById('editPatientContact').value = patient.contact;
  document.getElementById('editPatientEmail').value = patient.email || '';
  document.getElementById('editPatientAddress').value = patient.address || '';
  document.getElementById('editPatientMedicalHistory').value = patient.medicalHistory || '';
  document.getElementById('editPatientAllergies').value = patient.allergies || '';
  document.getElementById('editPatientStatus').value = patient.status;

  document.getElementById('editPatientModal').dataset.patientId = patientId;
  document.getElementById('editPatientModal').classList.remove('is-hidden');
  document.getElementById('editModalError').classList.add('is-hidden');
}

function closeEditModal() {
  document.getElementById('editPatientModal').classList.add('is-hidden');
}

function openArchiveModal(patientId) {
  document.getElementById('archivePatientModal').dataset.patientId = patientId;
  document.getElementById('archivePatientModal').classList.remove('is-hidden');
}

function closeArchiveModal() {
  document.getElementById('archivePatientModal').classList.add('is-hidden');
}

function confirmArchivePatient() {
  const patientId = Number(document.getElementById('archivePatientModal').dataset.patientId);
  const patients = loadPatients();
  const idx = patients.findIndex(p => p.id === patientId);
  
  if (idx !== -1) {
    patients[idx].archived = true;
    savePatients(patients);
  }
  
  closeArchiveModal();
  renderTable();
}

function openDeleteModal(patientId) {
  document.getElementById('deletePatientModal').dataset.patientId = patientId;
  document.getElementById('deletePatientModal').classList.remove('is-hidden');
}

function closeDeleteModal() {
  document.getElementById('deletePatientModal').classList.add('is-hidden');
}

function savePatientChanges() {
  const fullName = (document.getElementById('editPatientName') || {}).value || '';
  const age = Number((document.getElementById('editPatientAge') || {}).value) || 0;
  const contact = (document.getElementById('editPatientContact') || {}).value || '';
  const email = (document.getElementById('editPatientEmail') || {}).value || '';
  const address = (document.getElementById('editPatientAddress') || {}).value || '';
  const medicalHistory = (document.getElementById('editPatientMedicalHistory') || {}).value || '';
  const allergies = (document.getElementById('editPatientAllergies') || {}).value || '';
  const status = (document.getElementById('editPatientStatus') || {}).value || 'active';

  // Validate
  if (!fullName.trim()) {
    document.getElementById('editModalError').textContent = 'Full Name is required';
    document.getElementById('editModalError').classList.remove('is-hidden');
    return;
  }
  if (!contact.trim()) {
    document.getElementById('editModalError').textContent = 'Contact Number is required';
    document.getElementById('editModalError').classList.remove('is-hidden');
    return;
  }
  if (age <= 0 || age > 120) {
    document.getElementById('editModalError').textContent = 'Please enter a valid age';
    document.getElementById('editModalError').classList.remove('is-hidden');
    return;
  }

  const patientId = Number(document.getElementById('editPatientModal').dataset.patientId);
  const patients = loadPatients();
  const idx = patients.findIndex(p => p.id === patientId);

  if (idx !== -1) {
    patients[idx] = {
      ...patients[idx],
      fullName: fullName.trim(),
      age,
      contact: contact.trim(),
      email: email.trim(),
      address: address.trim(),
      medicalHistory: medicalHistory.trim(),
      allergies: allergies.trim(),
      status
    };
    savePatients(patients);
    closeEditModal();
    renderTable();
  }
}

function confirmDeletePatient() {
  const patientId = Number(document.getElementById('deletePatientModal').dataset.patientId);
  const patients = loadPatients();
  const filtered = patients.filter(p => p.id !== patientId);
  savePatients(filtered);
  closeDeleteModal();
  renderTable();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initializePatients();
  renderTable();

  // Wire up search and filters
  const searchInput = document.getElementById('patientSearchInput');
  const statusFilter = document.getElementById('filterStatus');
  const sortSelect = document.getElementById('sortBy');

  if (searchInput) {
    searchInput.addEventListener('input', renderTable);
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', renderTable);
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', renderTable);
  }

  // Wire up add patient button
  const addBtn = document.getElementById('addNewPatientBtn');
  if (addBtn) {
    addBtn.addEventListener('click', function() {
      window.location.href = 'patients-add.html';
    });
  }

  // Wire up edit modal
  const editCloseBtn = document.getElementById('editModalCloseBtn');
  const editCancelBtn = document.getElementById('editModalCancelBtn');
  const editSaveBtn = document.getElementById('editModalSaveBtn');
  const editOverlay = document.getElementById('editPatientModal');

  if (editCloseBtn) editCloseBtn.addEventListener('click', closeEditModal);
  if (editCancelBtn) editCancelBtn.addEventListener('click', closeEditModal);
  if (editSaveBtn) editSaveBtn.addEventListener('click', savePatientChanges);
  if (editOverlay) {
    editOverlay.addEventListener('click', function(e) {
      if (e.target === editOverlay) closeEditModal();
    });
  }

  // Wire up archive modal
  const archiveCloseBtn = document.getElementById('archiveModalCancelBtn');
  const archiveConfirmBtn = document.getElementById('archiveModalConfirmBtn');
  const archiveOverlay = document.getElementById('archivePatientModal');

  if (archiveCloseBtn) archiveCloseBtn.addEventListener('click', closeArchiveModal);
  if (archiveConfirmBtn) archiveConfirmBtn.addEventListener('click', confirmArchivePatient);
  if (archiveOverlay) {
    archiveOverlay.addEventListener('click', function(e) {
      if (e.target === archiveOverlay) closeArchiveModal();
    });
  }
});
