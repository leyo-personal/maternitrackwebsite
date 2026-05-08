// Handle logout and clear all authentication data
function wireLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", function () {
    // Clear primary storage keys
    sessionStorage.removeItem(STORAGE_ROLE_KEY);
    sessionStorage.removeItem(STORAGE_EMAIL_KEY);
    localStorage.removeItem(STORAGE_ROLE_KEY);
    localStorage.removeItem(STORAGE_EMAIL_KEY);

    // Clear backwards compatibility keys
    COMPAT_ROLE_KEYS.forEach(function (key) {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
    COMPAT_EMAIL_KEYS.forEach(function (key) {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });

    // Redirect to site entry page
    window.location.href = "index.html";
  });
}

// Initialize logout handler on page load
document.addEventListener('DOMContentLoaded', function() {
  wireLogout();
});
