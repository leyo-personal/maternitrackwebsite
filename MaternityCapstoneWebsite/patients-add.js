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
    id: getNextPatientId(),
    fullName: document.getElementById('fullName').value.trim(),
    age: Number(document.getElementById('age').value),
    contact: document.getElementById('contact').value.trim(),
    email: document.getElementById('email').value.trim(),
    address: document.getElementById('address').value.trim(),
    medicalHistory: document.getElementById('medicalHistory').value.trim(),
    allergies: document.getElementById('allergies').value.trim(),
    status: document.getElementById('status').value,
    dateAdded: new Date().toISOString().split('T')[0]
  };
}

// Save patient
function savePatient() {
  const errors = validateForm();

  if (errors.length > 0) {
    const errorEl = document.getElementById('formErrors');
    errorEl.textContent = errors.join(' • ');
    errorEl.classList.remove('is-hidden');
    window.scrollTo(0, 0);
    return;
  }

  const patients = loadPatients();
  const newPatient = getFormData();
  patients.push(newPatient);
  savePatients(patients);

  // Show success message
  const btn = document.getElementById('submitBtn');
  btn.innerHTML = '<i class="bi bi-check-circle" aria-hidden="true"></i> Patient Added!';
  btn.disabled = true;

  // Redirect after 1.5 seconds
  setTimeout(() => {
    window.location.href = 'patients.html';
  }, 1500);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  if (submitBtn) {
    submitBtn.addEventListener('click', savePatient);
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
