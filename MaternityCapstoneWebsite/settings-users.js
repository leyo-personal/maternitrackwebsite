(function () {
  const STORAGE_ROLE_KEY = "maternitrackRole";
  const STORAGE_EMAIL_KEY = "maternitrackEmail";
  const STORAGE_USERS_KEY = "maternitrackUsers";
  const COMPAT_ROLE_KEYS = ["role", "userRole"];
  const COMPAT_EMAIL_KEYS = ["email", "userEmail"];

  const DEFAULT_STAFF = [
    {
      id: 1,
      fullName: "Juan Santos",
      email: "juan.santos@gmail.com",
      role: "staff",
      status: "active",
      password: "staff123",
    },
    {
      id: 2,
      fullName: "Admin Account",
      email: "admin@clinic.local",
      role: "admin",
      status: "active",
      password: "admin123",
    },
    {
      id: 3,
      fullName: "Maria Reyes",
      email: "maria.reyes@gmail.com",
      role: "staff",
      status: "inactive",
      password: "staff123",
    },
  ];

  const state = {
    staff: [],
    searchQuery: "",
    roleFilter: "all",
    statusFilter: "all",
    modalMode: "add", // "add" | "edit"
    editId: null,
  };

  const accessDeniedEl = document.getElementById("accessDenied");
  const btnBackToDashboard = document.getElementById("btnBackToDashboard");
  const settingsLogoutBtn = document.getElementById("settingsLogoutBtn");

  function readStorageWithFallback(primaryKey, fallbackKeys, defaultValue) {
    const fromSession = sessionStorage.getItem(primaryKey);
    const fromLocal = localStorage.getItem(primaryKey);
    if (fromSession) return fromSession;
    if (fromLocal) return fromLocal;
    for (let i = 0; i < fallbackKeys.length; i += 1) {
      const key = fallbackKeys[i];
      const compatSession = sessionStorage.getItem(key);
      const compatLocal = localStorage.getItem(key);
      if (compatSession) return compatSession;
      if (compatLocal) return compatLocal;
    }
    return defaultValue;
  }

  const role = readStorageWithFallback(STORAGE_ROLE_KEY, COMPAT_ROLE_KEYS, "").toLowerCase();
  const currentEmail = readStorageWithFallback(STORAGE_EMAIL_KEY, COMPAT_EMAIL_KEYS, "admin@clinic.local").toLowerCase();

  function showAccessDenied() {
    if (accessDeniedEl) accessDeniedEl.classList.remove("is-hidden");
    const all = document.querySelectorAll("header.settings-top-nav, main.settings-layout");
    all.forEach(function (el) {
      el.classList.add("is-hidden");
    });
  }

  function hideAccessDenied() {
    if (accessDeniedEl) accessDeniedEl.classList.add("is-hidden");
    const all = document.querySelectorAll("header.settings-top-nav, main.settings-layout");
    all.forEach(function (el) {
      el.classList.remove("is-hidden");
    });
  }

  if (role !== "admin") {
    showAccessDenied();
    if (btnBackToDashboard) {
      btnBackToDashboard.addEventListener("click", function () {
        window.location.href = "home.html";
      });
    }
    return;
  }

  hideAccessDenied();

  if (btnBackToDashboard) {
    btnBackToDashboard.addEventListener("click", function () {
      window.location.href = "home.html";
    });
  }

  if (settingsLogoutBtn) {
    settingsLogoutBtn.addEventListener("click", function () {
      sessionStorage.removeItem(STORAGE_ROLE_KEY);
      sessionStorage.removeItem(STORAGE_EMAIL_KEY);
      localStorage.removeItem(STORAGE_ROLE_KEY);
      localStorage.removeItem(STORAGE_EMAIL_KEY);
      COMPAT_ROLE_KEYS.forEach(function (key) {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      });
      COMPAT_EMAIL_KEYS.forEach(function (key) {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      });
      window.location.href = "index.html";
    });
  }

  function loadStaff() {
    try {
      const raw = localStorage.getItem(STORAGE_USERS_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_STAFF));
        state.staff = JSON.parse(JSON.stringify(DEFAULT_STAFF));
        return;
      }
      const parsed = JSON.parse(raw);
      state.staff = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      state.staff = JSON.parse(JSON.stringify(DEFAULT_STAFF));
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(state.staff));
    }
  }

  function saveStaff() {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(state.staff));
  }

  function initialsFromName(name) {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length === 0) return "U";
    const first = parts[0].charAt(0);
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
    return (first + last).toUpperCase();
  }

  const avatarPalette = ["#1D9E75", "#2e63b7", "#ba7517", "#0f7e5d", "#6f4ab8"];
  function avatarColor(emailOrName) {
    const str = String(emailOrName || "");
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    return avatarPalette[hash % avatarPalette.length];
  }

  function renderStats() {
    const total = state.staff.length;
    const admins = state.staff.filter(function (s) {
      return String(s.role).toLowerCase() === "admin";
    }).length;
    const staffCount = state.staff.filter(function (s) {
      return String(s.role).toLowerCase() === "staff";
    }).length;

    const elTotal = document.getElementById("statTotalStaff");
    const elAdmin = document.getElementById("statAdminStaff");
    const elStaff = document.getElementById("statRegularStaff");

    if (elTotal) elTotal.textContent = String(total);
    if (elAdmin) elAdmin.textContent = String(admins);
    if (elStaff) elStaff.textContent = String(staffCount);
  }

  function roleBadge(roleValue) {
    const r = String(roleValue || "").toLowerCase();
    if (r === "admin") return '<span class="badge badge-admin">Admin</span>';
    return '<span class="badge badge-staff">Staff</span>';
  }

  function statusBadge(statusValue) {
    const s = String(statusValue || "").toLowerCase();
    if (s === "active") return '<span class="badge badge-active">Active</span>';
    return '<span class="badge badge-inactive">Inactive</span>';
  }

  function applyFilters() {
    const q = state.searchQuery.trim().toLowerCase();
    return state.staff.filter(function (s) {
      const name = String(s.fullName || "").toLowerCase();
      const email = String(s.email || "").toLowerCase();

      const matchesSearch = !q || name.includes(q) || email.includes(q);
      const matchesRole = state.roleFilter === "all" || String(s.role).toLowerCase() === state.roleFilter;
      const matchesStatus = state.statusFilter === "all" || String(s.status).toLowerCase() === state.statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  function renderTable() {
    renderStats();

    const tbody = document.getElementById("staffTableBody");
    if (!tbody) return;

    const filtered = applyFilters();
    if (filtered.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="padding:16px;color:#6d8b7a;font-weight:800;">No staff accounts match your filters.</td></tr>';
      return;
    }

    const rows = filtered.map(function (s) {
      const isSelf = String(s.email).toLowerCase() === currentEmail;
      const initials = initialsFromName(s.fullName);
      const avColor = avatarColor(s.email || s.fullName);

      const editBtn = `
        <button type="button" class="action-btn" data-action="edit" data-id="${s.id}" aria-label="Edit staff">
          <i class="bi bi-pencil-fill"></i>
          Edit
        </button>`;

      const changePasswordBtn = `
        <button type="button" class="action-btn" data-action="change-password" data-id="${s.id}" aria-label="Change password">
          <i class="bi bi-key-fill"></i>
          Password
        </button>`;

      const deleteBtn = isSelf
        ? ""
        : `
        <button type="button" class="action-btn action-btn--danger" data-action="delete" data-id="${s.id}" aria-label="Delete staff">
          <i class="bi bi-trash-fill"></i>
          Delete
        </button>`;

      return `
        <tr>
          <td>
            <div class="avatar-cell">
              <div class="avatar-circle" style="background:${avColor};" aria-hidden="true">${initials}</div>
              <div class="staff-name-cell">
                <p class="staff-name-bold">${escapeHtml(s.fullName)}</p>
                <p class="staff-role-small">${String(s.role).toUpperCase()}</p>
              </div>
            </div>
          </td>
          <td class="email-cell">${escapeHtml(s.email)}</td>
          <td>${roleBadge(s.role)}</td>
          <td>${statusBadge(s.status)}</td>
          <td>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              ${editBtn}
              ${changePasswordBtn}
              ${deleteBtn}
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rows.join("");
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function openModal(mode, staff) {
    const overlay = document.getElementById("staffModalOverlay");
    if (!overlay) return;
    overlay.classList.remove("is-hidden");

    state.modalMode = mode;
    state.editId = staff && mode === "edit" ? staff.id : null;

    const title = document.getElementById("modalTitle");
    const subtitle = document.getElementById("modalSubtitle");
    const formError = document.getElementById("modalFormError");
    const errorEl = document.getElementById("modalFormError");
    const saveBtn = document.getElementById("modalSaveBtn");
    const passwordFieldRow = document.getElementById("passwordFieldRow");

    if (title) title.textContent = mode === "edit" ? "Edit Staff Account" : "Add New Staff Account";
    if (subtitle) subtitle.textContent =
      mode === "edit"
        ? "Update the staff member's details and access level."
        : "Enter the staff member's details. They will log in using their registered username and password.";
    if (saveBtn) saveBtn.textContent = mode === "edit" ? "Update Staff Account" : "Add Staff Account";

    if (errorEl) errorEl.classList.add("is-hidden");

    const fullNameInput = document.getElementById("staffFullName");
    const emailInput = document.getElementById("staffEmail");
    const roleSelect = document.getElementById("staffRoleSelect");
    const statusSelect = document.getElementById("staffStatusSelect");
    const passwordInput = document.getElementById("staffPassword");

    if (fullNameInput) fullNameInput.value = staff && staff.fullName ? staff.fullName : "";
    if (emailInput) emailInput.value = staff && staff.email ? staff.email : "";
    if (roleSelect) roleSelect.value = staff && staff.role ? String(staff.role).toLowerCase() : "staff";
    if (statusSelect) statusSelect.value = staff && staff.status ? String(staff.status).toLowerCase() : "active";
    if (passwordInput) passwordInput.value = "";

    // Show password field only when adding
    if (passwordFieldRow) {
      passwordFieldRow.style.display = mode === "add" ? "block" : "none";
      if (passwordInput) {
        passwordInput.required = mode === "add";
      }
    }

    // Email should be editable on edit for now (simple demo).
  }

  function closeModal() {
    const overlay = document.getElementById("staffModalOverlay");
    if (!overlay) return;
    overlay.classList.add("is-hidden");
    state.modalMode = "add";
    state.editId = null;
    const errorEl = document.getElementById("modalFormError");
    if (errorEl) errorEl.classList.add("is-hidden");
  }

  function setModalError(msg) {
    const errorEl = document.getElementById("modalFormError");
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.classList.remove("is-hidden");
  }

  function getModalValues() {
    const fullName = (document.getElementById("staffFullName") || {}).value || "";
    const email = (document.getElementById("staffEmail") || {}).value || "";
    const roleValue = (document.getElementById("staffRoleSelect") || {}).value || "staff";
    const statusValue = (document.getElementById("staffStatusSelect") || {}).value || "active";
    const password = (document.getElementById("staffPassword") || {}).value || "";
    return {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      role: roleValue,
      status: statusValue,
      password: password.trim(),
    };
  }

  function validateModal(values) {
    if (!values.fullName) return "Full Name is required.";
    if (!values.email) return "Email Address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return "Please enter a valid email address.";
    if (values.role !== "admin" && values.role !== "staff") return "Please select a role.";
    if (values.status !== "active" && values.status !== "inactive") return "Please select a status.";
    
    // Password validation only when adding (not editing)
    if (state.modalMode === "add") {
      if (!values.password) return "Password is required for new staff members.";
      if (values.password.length < 6) return "Password must be at least 6 characters.";
    }
    
    return null;
  }

  function nextId() {
    const max = state.staff.reduce(function (acc, s) {
      return Math.max(acc, Number(s.id) || 0);
    }, 0);
    return max + 1;
  }

  function handleSaveModal() {
    const values = getModalValues();
    const err = validateModal(values);
    if (err) {
      setModalError(err);
      return;
    }

    const existingSameEmail = state.staff.find(function (s) {
      return String(s.email).toLowerCase() === values.email;
    });

    if (state.modalMode === "add") {
      if (existingSameEmail) {
        setModalError("This email is already registered as a staff account.");
        return;
      }

      state.staff.push({
        id: nextId(),
        fullName: values.fullName,
        email: values.email,
        role: values.role,
        status: values.status,
        password: values.password,
      });
      saveStaff();
      closeModal();
      renderTable();
      return;
    }

    if (state.modalMode === "edit") {
      const id = state.editId;
      const staffIdx = state.staff.findIndex(function (s) {
        return Number(s.id) === Number(id);
      });
      if (staffIdx === -1) {
        setModalError("Unable to update. Staff record not found.");
        return;
      }

      // Keep same email as-is validation only; allow updating email in demo.
      if (existingSameEmail && String(existingSameEmail.id).toLowerCase() !== String(id).toLowerCase()) {
        setModalError("Another staff account already uses this email.");
        return;
      }

      state.staff[staffIdx] = {
        ...state.staff[staffIdx],
        fullName: values.fullName,
        email: values.email,
        role: values.role,
        status: values.status,
      };
      saveStaff();
      closeModal();
      renderTable();
    }
  }

  let changePasswordStaffId = null;

  function openChangePasswordModal(staff) {
    const overlay = document.getElementById("changePasswordModalOverlay");
    if (!overlay) return;
    
    overlay.classList.remove("is-hidden");
    changePasswordStaffId = staff.id;
    
    const staffNameEl = document.getElementById("changePasswordStaffName");
    const newPasswordEl = document.getElementById("changePasswordNewPassword");
    const confirmPasswordEl = document.getElementById("changePasswordConfirm");
    const errorEl = document.getElementById("changePasswordError");
    
    if (staffNameEl) staffNameEl.value = staff.fullName + " (" + staff.email + ")";
    if (newPasswordEl) newPasswordEl.value = "";
    if (confirmPasswordEl) confirmPasswordEl.value = "";
    if (errorEl) errorEl.classList.add("is-hidden");
  }

  function closeChangePasswordModal() {
    const overlay = document.getElementById("changePasswordModalOverlay");
    if (overlay) overlay.classList.add("is-hidden");
    changePasswordStaffId = null;
  }

  function setChangePasswordError(message) {
    const el = document.getElementById("changePasswordError");
    if (!el) return;
    el.textContent = message;
    el.classList.remove("is-hidden");
  }

  function handleChangePasswordSave() {
    const newPasswordEl = document.getElementById("changePasswordNewPassword");
    const confirmPasswordEl = document.getElementById("changePasswordConfirm");
    const newPassword = newPasswordEl ? String(newPasswordEl.value || "").trim() : "";
    const confirmPassword = confirmPasswordEl ? String(confirmPasswordEl.value || "").trim() : "";
    
    if (!newPassword) {
      setChangePasswordError("New password is required.");
      return;
    }
    
    if (newPassword.length < 6) {
      setChangePasswordError("Password must be at least 6 characters long.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setChangePasswordError("Passwords do not match.");
      return;
    }
    
    const staffIdx = state.staff.findIndex(function (s) {
      return Number(s.id) === changePasswordStaffId;
    });
    
    if (staffIdx === -1) {
      setChangePasswordError("Staff member not found.");
      return;
    }
    
    state.staff[staffIdx].password = newPassword;
    saveStaff();
    closeChangePasswordModal();
    renderTable();
  }

  function wireChangePasswordModal() {
    const overlay = document.getElementById("changePasswordModalOverlay");
    const closeBtn = document.getElementById("changePasswordCloseBtn");
    const cancelBtn = document.getElementById("changePasswordCancelBtn");
    const saveBtn = document.getElementById("changePasswordSaveBtn");
    
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeChangePasswordModal();
      });
    }
    if (closeBtn) closeBtn.addEventListener("click", closeChangePasswordModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeChangePasswordModal);
    if (saveBtn) saveBtn.addEventListener("click", handleChangePasswordSave);
  }

  function wireModal() {
    const overlay = document.getElementById("staffModalOverlay");
    const closeBtn = document.getElementById("modalCloseBtn");
    const cancelBtn = document.getElementById("modalCancelBtn");
    const saveBtn = document.getElementById("modalSaveBtn");

    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeModal();
      });
    }
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    if (saveBtn) saveBtn.addEventListener("click", handleSaveModal);
  }

  function wireTableActions() {
    const tbody = document.getElementById("staffTableBody");
    if (!tbody) return;

    tbody.addEventListener("click", function (e) {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-action");
      const id = Number(btn.getAttribute("data-id"));

      const staff = state.staff.find(function (s) {
        return Number(s.id) === id;
      });
      if (!staff) return;

      if (action === "edit") {
        openModal("edit", staff);
        return;
      }

      if (action === "change-password") {
        openChangePasswordModal(staff);
        return;
      }

      if (action === "delete") {
        const isSelf = String(staff.email).toLowerCase() === currentEmail;
        if (isSelf) return;

        const ok = window.confirm("Are you sure you want to delete this staff account?");
        if (!ok) return;

        state.staff = state.staff.filter(function (s) {
          return Number(s.id) !== id;
        });
        saveStaff();
        renderTable();
      }
    });
  }

  function wireFilters() {
    const searchInput = document.getElementById("staffSearchInput");
    const filterRole = document.getElementById("filterRole");
    const filterStatus = document.getElementById("filterStatus");

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        state.searchQuery = String(searchInput.value || "");
        renderTable();
      });
    }

    if (filterRole) {
      filterRole.addEventListener("change", function () {
        state.roleFilter = filterRole.value;
        renderTable();
      });
    }

    if (filterStatus) {
      filterStatus.addEventListener("change", function () {
        state.statusFilter = filterStatus.value;
        renderTable();
      });
    }
  }

  function wireAddButton() {
    const btnAdd = document.getElementById("btnAddStaff");
    if (!btnAdd) return;
    btnAdd.addEventListener("click", function () {
      openModal("add", null);
    });
  }

  function wireNavigation() {
    document.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function (e) {
        const href = link.getAttribute("href");
        if (href && href !== "#") {
          window.location.href = href;
        }
      });
    });
  }

  // Init
  loadStaff();
  wireFilters();
  wireAddButton();
  wireModal();  wireChangePasswordModal();  wireTableActions();
  wireNavigation();
  renderTable();
})();

