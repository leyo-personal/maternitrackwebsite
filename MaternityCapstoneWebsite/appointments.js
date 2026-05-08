// Sample appointment data - empty by default, only user-added appointments will show
const sampleAppointments = [];

const STORAGE_APPOINTMENTS_KEY = "maternitrackAppointments";

// Initialize localStorage - only initialize if it doesn't exist
function initializeAppointments() {
  if (!localStorage.getItem(STORAGE_APPOINTMENTS_KEY)) {
    localStorage.setItem(STORAGE_APPOINTMENTS_KEY, JSON.stringify([]));
  }
}

// Load all appointments from storage
function loadAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_APPOINTMENTS_KEY);
    return raw ? JSON.parse(raw) : sampleAppointments;
  } catch (e) {
    console.error("Error loading appointments:", e);
    return sampleAppointments;
  }
}

// Save appointments to storage
function saveAppointments(appointments) {
  localStorage.setItem(STORAGE_APPOINTMENTS_KEY, JSON.stringify(appointments));
  // Dispatch custom event for real-time updates
  window.dispatchEvent(new CustomEvent('appointmentsUpdated', { detail: appointments }));
}

// Get next appointment ID
function getNextAppointmentId() {
  const appointments = loadAppointments();
  const maxId = appointments.reduce((max, a) => Math.max(max, a.id || 0), 0);
  return maxId + 1;
}

// Get today's date as YYYY-MM-DD string
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get appointments for today only
function getTodayAppointments() {
  const appointments = loadAppointments();
  const todayDate = getTodayDate();
  return appointments.filter(appointment => 
    appointment.appointmentDate === todayDate && !appointment.archived
  );
}

// Get appointments for a specific date
function getAppointmentsByDate(dateString) {
  const appointments = loadAppointments();
  return appointments.filter(appointment => 
    appointment.appointmentDate === dateString && !appointment.archived
  );
}

// Add new appointment
function addAppointment(appointmentData) {
  const appointments = loadAppointments();
  const newAppointment = {
    id: getNextAppointmentId(),
    ...appointmentData,
    status: appointmentData.status || "pending",
    dateCreated: getTodayDate()
  };
  appointments.push(newAppointment);
  saveAppointments(appointments);
  return newAppointment;
}

// Update appointment
function updateAppointment(id, appointmentData) {
  const appointments = loadAppointments();
  const index = appointments.findIndex(a => a.id === id);
  if (index !== -1) {
    appointments[index] = { ...appointments[index], ...appointmentData };
    saveAppointments(appointments);
    return appointments[index];
  }
  return null;
}

// Archive appointment (mark as archived instead of deleting)
function archiveAppointment(id) {
  const appointments = loadAppointments();
  const index = appointments.findIndex(a => a.id === id);
  if (index !== -1) {
    appointments[index].archived = true;
    saveAppointments(appointments);
    return true;
  }
  return false;
}

// Delete appointment
function deleteAppointment(id) {
  const appointments = loadAppointments();
  const filtered = appointments.filter(a => a.id !== id);
  saveAppointments(filtered);
  return true;
}

// Format staff name display
function formatStaffName(staffValue) {
  const staffMap = {
    "dr-real-mendoza": "Dr. Real-Mendoza",
    "juan-santos": "Juan Santos",
    "maria-reyes": "Maria Reyes",
    "rose-garcia": "Rose Garcia"
  };
  return staffMap[staffValue] || staffValue;
}

// Format appointment type display
function formatAppointmentType(typeValue) {
  const typeMap = {
    "prenatal": "Prenatal Checkup",
    "postnatal": "Postnatal Care",
    "consultation": "Consultation",
    "followup": "Follow-up Visit",
    "others": "Others"
  };
  return typeMap[typeValue] || typeValue;
}

// Get initials from name
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Format time to 12-hour format (e.g., 09:00 -> 09:00 AM)
function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`;
}

// Initialize on load
initializeAppointments();
