// Get patient ID from URL
function getPatientIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get('id')) || null;
}

// Load patient data
function loadPatientData() {
  const patientId = getPatientIdFromUrl();
  if (!patientId) {
    window.location.href = 'patients.html';
    return null;
  }

  const patients = loadPatients();
  const patient = patients.find(p => p.id === patientId);

  if (!patient) {
    window.location.href = 'patients.html';
    return null;
  }

  return patient;
}

// Pre-fill form with patient data
function prefillForm() {
  const patient = loadPatientData();
  if (!patient) return;

  document.getElementById('fullName').value = patient.fullName || '';
  document.getElementById('age').value = patient.age || '';
  document.getElementById('contact').value = patient.contact || '';
  document.getElementById('email').value = patient.email || '';
  document.getElementById('address').value = patient.address || '';
  document.getElementById('medicalHistory').value = patient.medicalHistory || '';
  document.getElementById('allergies').value = patient.allergies || '';
  document.getElementById('status').value = patient.status || 'active';
}

// Validate form
function validateForm() {
  const fullName = document.getElementById('fullName').value.trim();
  const contact = document.getElementById('contact').value.trim();
  const age = Number(document.getElementById('age').value) || 0;

  const errors = [];

  if (!fullName) errors.push('Full Name is required');
  if (!contact) errors.push('Contact Number is required');
  if (age <= 0 || age > 120) errors.push('Please enter a valid age (1-120)');

  return errors;
}

// Get form data
function getFormData() {
  return {
    fullName: document.getElementById('fullName').value.trim(),
    age: Number(document.getElementById('age').value),
    contact: document.getElementById('contact').value.trim(),
    email: document.getElementById('email').value.trim(),
    address: document.getElementById('address').value.trim(),
    medicalHistory: document.getElementById('medicalHistory').value.trim(),
    allergies: document.getElementById('allergies').value.trim(),
    status: document.getElementById('status').value
  };
}

// Save patient changes
function savePatientChanges() {
  const errors = validateForm();

  if (errors.length > 0) {
    const errorEl = document.getElementById('formErrors');
    errorEl.textContent = errors.join(' • ');
    errorEl.classList.remove('is-hidden');
    window.scrollTo(0, 0);
    return;
  }

  const patientId = getPatientIdFromUrl();
  const patients = loadPatients();
  
  const idx = patients.findIndex(p => p.id === patientId);
  if (idx !== -1) {
    patients[idx] = {
      ...patients[idx],
      ...getFormData()
    };
    savePatients(patients);

    // Show success message
    const btn = document.getElementById('submitBtn');
    btn.innerHTML = '<i class="bi bi-check-circle" aria-hidden="true"></i> Saved!';
    btn.disabled = true;

    // Redirect after 1.5 seconds
    setTimeout(() => {
      window.location.href = 'patients.html';
    }, 1500);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  prefillForm();

  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  if (submitBtn) {
    submitBtn.addEventListener('click', savePatientChanges);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
      window.location.href = 'patients.html';
    });
  }

  // Clear errors when typing
  const inputs = document.querySelectorAll('.field-input, .field-textarea');
  inputs.forEach(input => {
    input.addEventListener('input', function() {
      if (document.getElementById('formErrors') && !document.getElementById('formErrors').classList.contains('is-hidden')) {
        document.getElementById('formErrors').classList.add('is-hidden');
      }
    });
  });
});
