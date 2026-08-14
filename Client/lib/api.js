// API client helper for Balaji Electrical Solution Frontend & Admin Portal

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ADMIN_TOKEN_KEY = 'balaji_admin_jwt_token';
const ADMIN_USER_KEY = 'balaji_admin_user_info';

// Helper for local auth storage
export function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getAdminUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setAdminAuth(token, user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function clearAdminAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

// Client Public: Submit a booking request
export async function submitBookingRequest(data) {
  try {
    const response = await fetch(`${API_BASE}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to submit booking request.');
    }
    return result;
  } catch (error) {
    console.error('API submitBookingRequest error:', error);
    throw error;
  }
}

// Admin: Login
export async function adminLogin(username, password) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Invalid admin credentials.');
    }

    if (result.success && result.token) {
      setAdminAuth(result.token, result.admin || { username });
    }
    return result;
  } catch (error) {
    console.error('API adminLogin error:', error);
    throw error;
  }
}

// Admin: Fetch all requests
export async function fetchAdminRequests(status = 'All', search = '') {
  const token = getAdminToken();
  if (!token) {
    throw new Error('UNAUTHORIZED');
  }

  const queryParams = new URLSearchParams();
  if (status && status !== 'All') queryParams.append('status', status);
  if (search) queryParams.append('search', search);

  const response = await fetch(`${API_BASE}/api/requests?${queryParams.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    clearAdminAuth();
    throw new Error('UNAUTHORIZED');
  }

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch requests.');
  }

  return result.data || [];
}

// Admin: Update request (status, notes, estimatedCost)
export async function updateAdminRequest(id, updates) {
  const token = getAdminToken();
  if (!token) {
    throw new Error('UNAUTHORIZED');
  }

  const response = await fetch(`${API_BASE}/api/requests/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });

  if (response.status === 401) {
    clearAdminAuth();
    throw new Error('UNAUTHORIZED');
  }

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to update request.');
  }

  return result.data;
}

// Admin: Delete request
export async function deleteAdminRequest(id) {
  const token = getAdminToken();
  if (!token) {
    throw new Error('UNAUTHORIZED');
  }

  const response = await fetch(`${API_BASE}/api/requests/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    clearAdminAuth();
    throw new Error('UNAUTHORIZED');
  }

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to delete request.');
  }

  return result;
}
