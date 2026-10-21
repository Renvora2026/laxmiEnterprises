// Enterprise authentication & access registry service

const STORAGE_KEY_CREDENTIALS = "le_user_credentials";
const STORAGE_KEY_AUTH_USER = "le_current_user";
const STORAGE_KEY_AUTO_EXPORT_PREF = "le_auto_export_login_excel";

export const INITIAL_CREDENTIALS = [
  {
    id: "AUTH-001",
    username: "admin@laxmienterprises.com",
    password: "Admin@123",
    name: "Chaitrali Shevtekar",
    role: "Super Administrator",
    timestamp: "2026-10-07 09:30:00",
    status: "Active / Verified",
    loginMethod: "System Superadmin Account",
    device: "Windows Desktop"
  },
  {
    id: "AUTH-002",
    username: "rahul.ops@laxmienterprises.com",
    password: "Warehouse@2026",
    name: "Rahul Deshmukh",
    role: "Warehouse & Inventory",
    timestamp: "2026-10-07 11:15:00",
    status: "Active / Verified",
    loginMethod: "Operations Portal",
    device: "Warehouse Workstation"
  },
  {
    id: "AUTH-003",
    username: "pooja.sales@laxmienterprises.com",
    password: "Sales@2026",
    name: "Pooja Patil",
    role: "Commercial Sales",
    timestamp: "2026-10-06 16:45:00",
    status: "Active / Verified",
    loginMethod: "Commercial Terminal",
    device: "Corporate Laptop"
  },
  {
    id: "AUTH-004",
    username: "amit.acc@laxmienterprises.com",
    password: "Finance@2026",
    name: "Amit Kulkarni",
    role: "Tax & Accounts",
    timestamp: "2026-10-05 14:20:00",
    status: "Active / Verified",
    loginMethod: "Finance Gateway",
    device: "Accounts PC"
  }
];

/**
 * Retrieve all registered/logged credentials from localStorage
 */
export function getStoredCredentials() {
  const saved = localStorage.getItem(STORAGE_KEY_CREDENTIALS);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEY_CREDENTIALS, JSON.stringify(INITIAL_CREDENTIALS));
  return INITIAL_CREDENTIALS;
}

/**
 * Save credentials array to localStorage
 */
export function saveStoredCredentials(credentials) {
  localStorage.setItem(STORAGE_KEY_CREDENTIALS, JSON.stringify(credentials));
}

/**
 * Get current logged in user session
 */
export function getCurrentUser() {
  const saved = localStorage.getItem(STORAGE_KEY_AUTH_USER);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }
  return null;
}

/**
 * Set current logged in user
 */
export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
  }
}

/**
 * Logout current user
 */
export function logoutUser() {
  localStorage.removeItem(STORAGE_KEY_AUTH_USER);
}

/**
 * Get whether auto-download Excel on login is preferred
 */
export function getAutoExportPreference() {
  const val = localStorage.getItem(STORAGE_KEY_AUTO_EXPORT_PREF);
  return val === null ? true : val === "true";
}

/**
 * Save preference for auto-download Excel
 */
export function setAutoExportPreference(pref) {
  localStorage.setItem(STORAGE_KEY_AUTO_EXPORT_PREF, String(pref));
}

/**
 * Record user credentials (username, password, role, etc.) into the Excel ledger
 * and update authentication session.
 */
export function recordAndAuthenticateUser({
  username,
  password,
  role = "Authorized User",
  name,
  isNewRegistration = false,
  autoDownloadExcel = false
}) {
  const credentials = [...getStoredCredentials()];
  const cleanUsername = String(username || "").trim();
  const cleanPassword = String(password || "").trim();
  const cleanName = name ? name.trim() : cleanUsername.split("@")[0] || "Authorized User";

  const existingIndex = credentials.findIndex(
    c => c.username.toLowerCase() === cleanUsername.toLowerCase()
  );

  const now = new Date();
  const timestampStr = now.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  let userRecord;

  if (existingIndex >= 0) {
    // Update existing user credentials in ledger
    userRecord = {
      ...credentials[existingIndex],
      password: cleanPassword, // Always capture and store entered password in Excel ledger
      role: role || credentials[existingIndex].role,
      name: cleanName || credentials[existingIndex].name,
      timestamp: timestampStr,
      status: "Active / Authenticated",
      loginMethod: isNewRegistration ? "Account Details Updated" : "Portal User Sign-In",
      device: "Web Browser Client"
    };
    credentials[existingIndex] = userRecord;
  } else {
    // Append new credential record
    let highestNum = 0;
    credentials.forEach(c => {
      const match = c.id && c.id.match(/AUTH-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > highestNum) highestNum = num;
      }
    });
    const newId = `AUTH-${String(highestNum + 1).padStart(3, "0")}`;

    userRecord = {
      id: newId,
      username: cleanUsername,
      password: cleanPassword, // Stored in Excel ledger
      name: cleanName,
      role: role || "Operations Staff",
      timestamp: timestampStr,
      status: isNewRegistration ? "Newly Registered Account" : "Active / Authenticated",
      loginMethod: isNewRegistration ? "Self Registration" : "Custom Credentials Sign-In",
      device: "Web Browser Client"
    };
    credentials.unshift(userRecord);
  }

  saveStoredCredentials(credentials);
  setCurrentUser(userRecord);

  return {
    user: userRecord,
    credentials,
    exportedFileName: null
  };
}

/**
 * Direct helper to download all stored credentials as JSON file
 */
export function exportAllCredentialsToFile() {
  const creds = getStoredCredentials();
  const blob = new Blob([JSON.stringify(creds, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `User_Credentials_Registry_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return { fileName: a.download };
}

/**
 * Remove a specific credential by ID
 */
export function deleteCredentialById(id) {
  const creds = getStoredCredentials().filter(c => c.id !== id);
  saveStoredCredentials(creds);
  return creds;
}

/**
 * Reset credentials to default test accounts
 */
export function resetCredentialsToDefault() {
  saveStoredCredentials(INITIAL_CREDENTIALS);
  return INITIAL_CREDENTIALS;
}
