import axios from "axios";

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return "http://localhost:5000/api/v1";
  const clean = envUrl.trim().replace(/\/+$/, "");
  if (clean.endsWith("/api/v1") || clean.endsWith("/api")) {
    return clean;
  }
  return `${clean}/api/v1`;
};

const API_BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Attach JWT Bearer Token to all requests
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("le_jwt_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Standardize API responses & handle 401 unauthenticated
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized, clean invalid token
      localStorage.removeItem("le_jwt_token");
      localStorage.removeItem("le_auth_user");
    }
    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred while communicating with the backend.";
    return Promise.reject(new Error(errorMsg));
  }
);

// ERP API Modules
export const erpApi = {
  // Health Check
  checkHealth: () => {
    const rootUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
    return axios.get(`${rootUrl}/api/health`);
  },

  // Master Synchronization (MySQL Database <-> Frontend)
  getAllData: () => apiClient.get("/sync/all"),
  syncClients: (clients) => apiClient.post("/sync/clients", clients),
  syncInvoices: (invoices) => apiClient.post("/sync/invoices", invoices),
  syncPurchases: (purchases) => apiClient.post("/sync/purchases", purchases),
  syncProducts: (products) => apiClient.post("/sync/products", products),
  syncInventory: (inventory) => apiClient.post("/sync/inventory", inventory),
  syncExpoLeads: (expoLeads) => apiClient.post("/sync/expo", expoLeads),
  syncCompany: (company) => apiClient.post("/sync/company", company),

  // Auth & Profile Management (MySQL backed with JWT & Bcrypt)
  login: (credentials) => apiClient.post("/auth/login", credentials),
  register: (userData) => apiClient.post("/auth/register", userData),
  getMe: () => apiClient.get("/auth/me"),
  updateProfile: (profileData) => apiClient.put("/auth/profile", profileData),
  updatePassword: (passwords) => apiClient.put("/auth/password", passwords),
  getUsers: () => apiClient.get("/auth/users"),
  createUser: (userData) => apiClient.post("/auth/users", userData),
  deleteUser: (id) => apiClient.delete(`/auth/users/${id}`),

  // Direct CRUD
  getClients: (params) => apiClient.get("/clients", { params }),
  getClient: (id) => apiClient.get(`/clients/${id}`),
  createClient: (data) => apiClient.post("/clients", data),
  updateClient: (id, data) => apiClient.put(`/clients/${id}`, data),
  deleteClient: (id) => apiClient.delete(`/clients/${id}`),

  getProducts: () => apiClient.get("/products"),
  createProduct: (data) => apiClient.post("/products", data),
  updateProduct: (id, data) => apiClient.put(`/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),

  getInventory: () => apiClient.get("/inventory"),
  updateStock: (productId, data) => apiClient.put(`/inventory/${productId}`, data),

  getPurchases: () => apiClient.get("/purchases"),
  createPurchase: (data) => apiClient.post("/purchases", data),
  updatePurchase: (id, data) => apiClient.put(`/purchases/${id}`, data),
  deletePurchase: (id) => apiClient.delete(`/purchases/${id}`),

  getInvoices: () => apiClient.get("/invoices"),
  createInvoice: (data) => apiClient.post("/invoices", data),
  recordPayment: (id, data) => apiClient.post(`/invoices/${id}/payment`, data),
  deleteInvoice: (id) => apiClient.delete(`/invoices/${id}`),

  getLeads: () => apiClient.get("/expo"),
  createLead: (data) => apiClient.post("/expo", data),
  updateLead: (id, data) => apiClient.put(`/expo/${id}`, data),
  markBroadcast: (ids) => apiClient.post("/expo/broadcast", { ids }),

  getCompany: () => apiClient.get("/company"),
  updateCompany: (data) => apiClient.put("/company", data),

  getDashboardStats: () => apiClient.get("/dashboard/stats"),
};

export default erpApi;
