/**
 * Static demo: sets session role and redirects to home.html.
 * In Laravel: POST to server; backend checks staff table and returns redirect or error.
 */
(function () {
  const DASHBOARD_URL_ADMIN = "home.html";
  const DASHBOARD_URL_STAFF = "home.html";
  const STORAGE_ROLE_KEY = "maternitrackRole";
  const STORAGE_EMAIL_KEY = "maternitrackEmail";
  const COMPAT_ROLE_KEYS = ["role", "userRole"];
  const COMPAT_EMAIL_KEYS = ["email", "userEmail"];
  const DEMO_ACCOUNTS = [
    {
      email: "admin@clinic.local",
      password: "admin123",
      role: "admin",
    },
    {
      email: "staff@clinic.local",
      password: "staff123",
      role: "staff",
    },
  ];

  const DEMO_UNAUTHORIZED_MARKERS = ["unauthorized", "notintable", "blocked@"];

  function getSelectedRole() {
    const selected = document.querySelector(".role-card.is-selected");
    return selected && selected.dataset.role === "staff" ? "staff" : "admin";
  }

  function setSelectedRole(role) {
    document.querySelectorAll(".role-card").forEach(function (btn) {
      const isOn = btn.dataset.role === role;
      btn.classList.toggle("is-selected", isOn);
      btn.setAttribute("aria-checked", isOn ? "true" : "false");
    });
  }

  function dashboardUrlForRole(role) {
    return role === "staff" ? DASHBOARD_URL_STAFF : DASHBOARD_URL_ADMIN;
  }

  function attemptLoginAfterServerOk(role, identifier) {
    const email = (identifier || "").trim();
    sessionStorage.setItem(STORAGE_ROLE_KEY, role);
    sessionStorage.setItem(STORAGE_EMAIL_KEY, email);
    localStorage.setItem(STORAGE_ROLE_KEY, role);
    localStorage.setItem(STORAGE_EMAIL_KEY, email);

    // Compatibility keys for older/newer scripts.
    COMPAT_ROLE_KEYS.forEach(function (key) {
      sessionStorage.setItem(key, role);
      localStorage.setItem(key, role);
    });
    COMPAT_EMAIL_KEYS.forEach(function (key) {
      sessionStorage.setItem(key, email);
      localStorage.setItem(key, email);
    });

    window.location.href = dashboardUrlForRole(role);
  }

  /**
   * Simulates Laravel: email/username allowed unless it matches demo "denied" patterns.
   */
  function isAuthorizedIdentifier(raw) {
    const value = (raw || "").trim().toLowerCase();
    if (!value) return false;
    return !DEMO_UNAUTHORIZED_MARKERS.some(function (marker) {
      return value.includes(marker);
    });
  }

  function showError(message) {
    const el = document.getElementById("loginError");
    if (!el) return;
    el.textContent = message;
    el.classList.remove("is-hidden");
  }

  function hideError() {
    const el = document.getElementById("loginError");
    if (!el) return;
    el.textContent = "";
    el.classList.add("is-hidden");
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function findDemoAccountByEmail(email) {
    const normalized = normalizeEmail(email);
    
    // First check demo accounts
    const demoAccount = DEMO_ACCOUNTS.find(function (acc) {
      return acc.email === normalized;
    });
    if (demoAccount) return demoAccount;
    
    // Then check stored staff accounts
    const staffJson = localStorage.getItem("maternitrackUsers");
    if (staffJson) {
      try {
        const staff = JSON.parse(staffJson);
        if (Array.isArray(staff)) {
          const found = staff.find(function (s) {
            return normalizeEmail(s.email) === normalized;
          });
          if (found) {
            return {
              email: found.email,
              password: found.password || "",
              role: found.role || "staff",
            };
          }
        }
      } catch (e) {
        // JSON parse error, ignore
      }
    }
    
    return null;
  }

  function handleAuthAction(identifier, password) {
    hideError();
    const selectedRole = getSelectedRole();
    const normalizedId = normalizeEmail(identifier);

    if (!isAuthorizedIdentifier(normalizedId)) {
      showError(
        "Access denied. You are not authorized to access this system."
      );
      return;
    }

    const account = findDemoAccountByEmail(normalizedId);

    // Manual login: require valid demo account and matching password.
    if (typeof password === "string") {
      if (!account || account.password !== password) {
        showError("Invalid credentials. Please use a registered account.");
        return;
      }

      // Keep selected role behavior, but prevent using staff account as admin.
      if (selectedRole === "admin" && account.role !== "admin") {
        showError("Access denied. You are not authorized to access this system.");
        return;
      }
      attemptLoginAfterServerOk(selectedRole, account.email);
      return;
    }

    // SSO button flow: use dummy account based on selected role.
    if (selectedRole === "admin") {
      attemptLoginAfterServerOk("admin", "admin@clinic.local");
    } else {
      attemptLoginAfterServerOk("staff", "staff@clinic.local");
    }
  }

  document.querySelectorAll(".role-card").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setSelectedRole(btn.dataset.role);
    });
  });

  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = document.getElementById("username");
      const password = document.getElementById("password");
      const id = username ? username.value : "";
      const pwd = password ? password.value : "";
      if (!form.reportValidity()) return;
      handleAuthAction(id, pwd);
    });
  }
})();
