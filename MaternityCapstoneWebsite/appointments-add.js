// Form field validation
const form = document.getElementById('appointmentForm');
const patientNameInput = document.getElementById('patientName');
const contactNumberInput = document.getElementById('contactNumber');
const appointmentDateInput = document.getElementById('appointmentDate');
const appointmentTimeInput = document.getElementById('appointmentTime');
const appointmentTypeInput = document.getElementById('appointmentType');
const assignedStaffInput = document.getElementById('assignedStaff');
const notesInput = document.getElementById('notes');
const charCountDisplay = document.getElementById('charCount');

// Character counter for notes
notesInput?.addEventListener('input', function() {
  charCountDisplay.textContent = this.value.length;
});

// Cancel button handler
document.getElementById('cancelBtn')?.addEventListener('click', function() {
  const cancelModal = document.getElementById('cancelModal');
  cancelModal?.classList.remove('is-hidden');
});

document.getElementById('keepEditingBtn')?.addEventListener('click', function() {
  const cancelModal = document.getElementById('cancelModal');
  cancelModal?.classList.add('is-hidden');
});

document.getElementById('confirmCancelBtn')?.addEventListener('click', function() {
  window.location.href = 'appointments.html';
});

document.getElementById('cancelModalOverlay')?.addEventListener('click', function() {
  const cancelModal = document.getElementById('cancelModal');
  cancelModal?.classList.add('is-hidden');
});

// Form submission
form?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Clear previous errors
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  
  // Validate fields
  let isValid = true;
  
  if (!patientNameInput.value.trim()) {
    document.getElementById('patientNameError').textContent = 'Patient name is required';
    patientNameInput.classList.add('error');
    isValid = false;
  } else {
    patientNameInput.classList.remove('error');
  }
  
  if (!contactNumberInput.value.trim()) {
    document.getElementById('contactNumberError').textContent = 'Contact number is required';
    contactNumberInput.classList.add('error');
    isValid = false;
  } else if (!/^09\d{9}$/.test(contactNumberInput.value.replace(/\s/g, ''))) {
    document.getElementById('contactNumberError').textContent = 'Invalid phone format. Use 09XX XXX XXXX';
    contactNumberInput.classList.add('error');
    isValid = false;
  } else {
    contactNumberInput.classList.remove('error');
  }
  
  if (!appointmentDateInput.value) {
    document.getElementById('appointmentDateError').textContent = 'Appointment date is required';
    appointmentDateInput.classList.add('error');
    isValid = false;
  } else {
    appointmentDateInput.classList.remove('error');
  }
  
  if (!appointmentTimeInput.value) {
    document.getElementById('appointmentTimeError').textContent = 'Appointment time is required';
    appointmentTimeInput.classList.add('error');
    isValid = false;
  } else {
    appointmentTimeInput.classList.remove('error');
  }
  
  if (!appointmentTypeInput.value) {
    document.getElementById('appointmentTypeError').textContent = 'Appointment type is required';
    appointmentTypeInput.classList.add('error');
    isValid = false;
  } else {
    appointmentTypeInput.classList.remove('error');
  }
  
  if (!assignedStaffInput.value) {
    document.getElementById('assignedStaffError').textContent = 'Please assign a staff member';
    assignedStaffInput.classList.add('error');
    isValid = false;
  } else {
    assignedStaffInput.classList.remove('error');
  }
  
  if (isValid) {
    // Collect appointment data
    const appointmentData = {
      patientName: patientNameInput.value.trim(),
      contactNumber: contactNumberInput.value.trim(),
      appointmentDate: appointmentDateInput.value,
      appointmentTime: appointmentTimeInput.value,
      appointmentType: appointmentTypeInput.value,
      assignedStaff: assignedStaffInput.value,
      notes: notesInput.value.trim()
    };
    
    // Save appointment to localStorage
    addAppointment(appointmentData);
    
    // Show success toast
    const toast = document.getElementById('successToast');
    toast?.classList.remove('is-hidden');
    
    // Redirect immediately to appointments page
    window.location.href = 'appointments.html';
  }
});
