/**
 * Finzo API Client
 * Drop this file in assets/js/api.js
 * Replace all localStorage.getItem('finzo_transactions') calls with:
 *   const txns = await FinzoAPI.getTransactions();
 */

const FINZO_API_BASE = "http://localhost:5000/api";

function getUserId() {
  // Replace with Firebase UID in production
  return window.__finzoUserId || localStorage.getItem("finzo_user_id") || "demo_user";
}

const _headers = () => ({
  "Content-Type": "application/json",
  "X-User-Id": getUserId(),
});

const FinzoAPI = {
  // ─── Transactions ────────────────────────
  async getTransactions() {
    const res = await fetch(`${FINZO_API_BASE}/transactions`, { headers: _headers() });
    const data = await res.json();
    // Also cache locally for offline use
    if (data.success) localStorage.setItem("finzo_transactions", JSON.stringify(data.transactions));
    return data.transactions || [];
  },

  async saveTransactions(transactions, filename = "upload") {
    const res = await fetch(`${FINZO_API_BASE}/transactions`, {
      method: "POST",
      headers: _headers(),
      body: JSON.stringify({ transactions, filename }),
    });
    return res.json();
  },

  async updateTransaction(id, updates) {
    const res = await fetch(`${FINZO_API_BASE}/transactions/${id}`, {
      method: "PATCH",
      headers: _headers(),
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteTransaction(id) {
    const res = await fetch(`${FINZO_API_BASE}/transactions/${id}`, {
      method: "DELETE",
      headers: _headers(),
    });
    return res.json();
  },

  // ─── Fraud ───────────────────────────────
  async getFraudAlerts() {
    const res = await fetch(`${FINZO_API_BASE}/fraud`, { headers: _headers() });
    return res.json();
  },

  async resolveAlert(txnId) {
    const res = await fetch(`${FINZO_API_BASE}/fraud/${txnId}/resolve`, {
      method: "POST", headers: _headers(),
    });
    return res.json();
  },

  async unresolveAlert(txnId) {
    const res = await fetch(`${FINZO_API_BASE}/fraud/${txnId}/unresolve`, {
      method: "POST", headers: _headers(),
    });
    return res.json();
  },

  // ─── Uploads ─────────────────────────────
  async getUploads() {
    const res = await fetch(`${FINZO_API_BASE}/uploads`, { headers: _headers() });
    const data = await res.json();
    return data.uploads || [];
  },

  async deleteUpload(uploadId) {
    const res = await fetch(`${FINZO_API_BASE}/uploads/${uploadId}`, {
      method: "DELETE", headers: _headers(),
    });
    return res.json();
  },

  // ─── Dashboard ───────────────────────────
  async getDashboard() {
    const res = await fetch(`${FINZO_API_BASE}/dashboard`, { headers: _headers() });
    return res.json();
  },

  // ─── Profile ─────────────────────────────
  async getProfile() {
    const res = await fetch(`${FINZO_API_BASE}/profile`, { headers: _headers() });
    const data = await res.json();
    return data.profile || {};
  },

  async updateProfile(profile) {
    const res = await fetch(`${FINZO_API_BASE}/profile`, {
      method: "PUT",
      headers: _headers(),
      body: JSON.stringify(profile),
    });
    return res.json();
  },

  // ─── Export ──────────────────────────────
  downloadExcel() {
    window.open(`${FINZO_API_BASE}/export/excel?user_id=${getUserId()}`, "_blank");
  },

  downloadCSV() {
    window.open(`${FINZO_API_BASE}/export/csv?user_id=${getUserId()}`, "_blank");
  },
};

// Make globally available
window.FinzoAPI = FinzoAPI;

// ─── Migration helper ────────────────────────────────────────────────────────
// Call this once to push existing localStorage data to the backend
window.migrateLocalStorageToBackend = async function () {
  const raw = localStorage.getItem("finzo_transactions");
  if (!raw) return console.log("Nothing to migrate.");
  const txns = JSON.parse(raw);
  const result = await FinzoAPI.saveTransactions(txns, "localStorage_migration");
  console.log("Migrated", result.count, "transactions to backend.");
};
