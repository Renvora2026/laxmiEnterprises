// Enterprise JWT Authentication & Session Service
import { erpApi } from "./api";

const TOKEN_KEY = "le_jwt_token";
const USER_KEY = "le_auth_user";

/**
 * Retrieve saved JWT token
 */
export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

/**
 * Retrieve authenticated user
 */
export function getCurrentUser() {
  const saved = localStorage.getItem(USER_KEY);
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
 * Save authentication token and user session
 */
export function saveAuthSession(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Clear authentication session and logout
 */
export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Validate active session with backend MySQL database
 */
export async function verifyCurrentSession() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await erpApi.getMe();
    if (res?.data) {
      const user = res.data;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    }
  } catch (err) {
    console.warn("Session expired or invalid:", err.message);
    logoutUser();
    return null;
  }
  return null;
}
