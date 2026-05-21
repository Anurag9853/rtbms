/**
 * api.js — Centralized API helpers for RTBMS
 * Re-uses the configured axios instance from authStore (token + interceptors).
 */
import { API } from '../stores/authStore';

// ── Inventory ────────────────────────────────────────────────────────────────

export const inventoryApi = {
  /** GET /inventory?city=X */
  getAll: (city) =>
    API.get('/inventory', { params: city ? { city } : {} }).then((r) => r.data),

  /** GET /inventory/search?group=O-&city=Delhi */
  search: (group, city) =>
    API.get('/inventory/search', { params: { group, city } }).then((r) => r.data),

  /** GET /inventory/low-stock */
  getLowStock: () =>
    API.get('/inventory/low-stock').then((r) => r.data),

  /** PATCH /inventory/:id — operation: 'add' | 'subtract' | 'set' */
  update: (id, payload) =>
    API.patch(`/inventory/${id}`, payload).then((r) => r.data),
};

// ── Blood Requests ───────────────────────────────────────────────────────────

export const requestsApi = {
  /** GET /requests with optional filters */
  getAll: (params = {}) =>
    API.get('/requests', { params }).then((r) => r.data),

  /** GET /requests/:id */
  getOne: (id) =>
    API.get(`/requests/${id}`).then((r) => r.data),

  /** POST /requests */
  create: (data) =>
    API.post('/requests', data).then((r) => r.data),

  /** PATCH /requests/:id */
  update: (id, data) =>
    API.patch(`/requests/${id}`, data).then((r) => r.data),

  /** DELETE /requests/:id */
  cancel: (id) =>
    API.delete(`/requests/${id}`).then((r) => r.data),

  /** GET /requests/emergency */
  getEmergencies: () =>
    API.get('/requests/emergency').then((r) => r.data),

  /** POST /requests/:id/donate */
  donate: (id, units) =>
    API.post(`/requests/${id}/donate`, { units }).then((r) => r.data),

  /** PATCH /donations/:id/status */
  updateDonationStatus: (id, status) =>
    API.patch(`/donations/${id}/status`, { status }).then((r) => r.data),
};

// ── Donors ───────────────────────────────────────────────────────────────────

export const donorsApi = {
  /** GET /donors */
  getAll: (params = {}) =>
    API.get('/donors', { params }).then((r) => r.data),

  /** GET /donors/:userId */
  getOne: (userId) =>
    API.get(`/donors/${userId}`).then((r) => r.data),

  /** PATCH /donors/:userId/availability */
  updateAvailability: (userId, isAvailable) =>
    API.patch(`/donors/${userId}/availability`, { is_available: isAvailable }).then((r) => r.data),

  /** GET /donors/:userId/history */
  getHistory: (userId) =>
    API.get(`/donors/${userId}/history`).then((r) => r.data),

  /** GET /donors/:userId/eligibility */
  getEligibility: (userId) =>
    API.get(`/donors/${userId}/eligibility`).then((r) => r.data),
};

// ── Analytics ────────────────────────────────────────────────────────────────

export const analyticsApi = {
  /** GET /analytics/summary */
  getSummary: () =>
    API.get('/analytics/summary').then((r) => r.data),

  /** GET /analytics/inventory */
  getInventoryTrend: () =>
    API.get('/analytics/inventory').then((r) => r.data),

  /** GET /analytics/donors */
  getDonorGrowth: () =>
    API.get('/analytics/donors').then((r) => r.data),

  /** GET /analytics/requests */
  getRequestStats: () =>
    API.get('/analytics/requests').then((r) => r.data),
};

// ── Blood Banks ──────────────────────────────────────────────────────────────

export const bloodBanksApi = {
  getAll: (params = {}) =>
    API.get('/blood-banks', { params }).then((r) => r.data),
  getOne: (id) =>
    API.get(`/blood-banks/${id}`).then((r) => r.data),
};

// ── Campaigns ────────────────────────────────────────────────────────────────

export const campaignsApi = {
  getAll: (params = {}) =>
    API.get('/campaigns', { params }).then((r) => r.data),
  rsvp: (id) =>
    API.post(`/campaigns/${id}/rsvp`).then((r) => r.data),
  cancelRsvp: (id) =>
    API.delete(`/campaigns/${id}/rsvp`).then((r) => r.data),
};

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  updateProfile: (data) =>
    API.patch('/auth/profile', data).then((r) => r.data),
  changePassword: (data) =>
    API.patch('/auth/password', data).then((r) => r.data),
};

// ── Users (admin) ─────────────────────────────────────────────────────────────

export const usersApi = {
  getAll: (params = {}) =>
    API.get('/users', { params }).then((r) => r.data),
  updateRole: (id, role) =>
    API.patch(`/users/${id}/role`, { role }).then((r) => r.data),
  delete: (id) =>
    API.delete(`/users/${id}`).then((r) => r.data),
};
