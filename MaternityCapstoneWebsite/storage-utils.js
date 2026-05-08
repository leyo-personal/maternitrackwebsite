// Shared storage keys
const STORAGE_ROLE_KEY = "maternitrackRole";
const STORAGE_EMAIL_KEY = "maternitrackEmail";
const COMPAT_ROLE_KEYS = ["role", "userRole"];
const COMPAT_EMAIL_KEYS = ["email", "userEmail"];

// Read from storage with fallback for backwards compatibility
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
