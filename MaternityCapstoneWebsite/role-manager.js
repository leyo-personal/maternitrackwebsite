// Toggle UI elements based on user role (Admin vs Staff)
function toggleByRole() {
  const roleFromStorage = readStorageWithFallback(STORAGE_ROLE_KEY, COMPAT_ROLE_KEYS, "staff");
  const role = roleFromStorage.toLowerCase();

  const isAdmin = role === "admin";

  // Navbars
  const navAdmin = document.querySelector(".nav-center-admin");
  const navStaff = document.querySelector(".nav-center-staff");
  if (navAdmin) navAdmin.classList.toggle("is-hidden", !isAdmin);
  if (navStaff) navStaff.classList.toggle("is-hidden", isAdmin);

  // Role badges
  const badgeAdmin = document.querySelector('[data-role-badge="admin"]');
  const badgeStaff = document.querySelector('[data-role-badge="staff"]');
  if (badgeAdmin) badgeAdmin.classList.toggle("is-hidden", !isAdmin);
  if (badgeStaff) badgeStaff.classList.toggle("is-hidden", isAdmin);

  // Role banners
  const adminBanner = document.getElementById("roleBannerAdmin");
  const staffBanner = document.getElementById("roleBannerStaff");
  if (adminBanner) adminBanner.classList.toggle("is-hidden", !isAdmin);
  if (staffBanner) staffBanner.classList.toggle("is-hidden", isAdmin);

  // Quick actions
  document.querySelectorAll(".qa-admin-only").forEach(function (el) {
    el.classList.toggle("is-hidden", !isAdmin);
  });
  document.querySelectorAll(".qa-staff-only").forEach(function (el) {
    el.classList.toggle("is-hidden", isAdmin);
  });

  // Footer
  const footerRoleText = document.getElementById("footerRoleText");
  if (footerRoleText) footerRoleText.textContent = `Logged in as: ${isAdmin ? "Admin" : "Staff"}`;

  // Wire quick action redirects
  document.querySelectorAll(".quick-action-btn[data-nav]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const target = btn.getAttribute("data-nav");
      if (target) window.location.href = target;
    });
  });
}

// Initialize role-based UI on page load
document.addEventListener('DOMContentLoaded', function() {
  toggleByRole();
});
