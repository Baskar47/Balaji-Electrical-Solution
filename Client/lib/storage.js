// Client-side storage & state management for Balaji Electricals Admin & Booking requests

const STORAGE_KEY = 'balaji_electricals_requests';
const AUTH_KEY = 'balaji_admin_auth';

export const INITIAL_REQUESTS = [
  {
    _id: 'req_101',
    name: 'Suresh K.',
    phone: '9840123456',
    service: 'Repairs & Service',
    date: '2026-08-15',
    status: 'Pending',
    notes: 'Ceiling fan making noisy sound in front hall. Need visit by 5 PM.',
    estimatedCost: '₹350',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  },
  {
    _id: 'req_102',
    name: 'Meena R.',
    phone: '9443198765',
    service: 'House Wiring',
    date: '2026-08-16',
    status: 'Contacted',
    notes: 'Kitchen power points addition + main switchboard safety test.',
    estimatedCost: '₹1,500',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  },
  {
    _id: 'req_103',
    name: 'Arun M.',
    phone: '9025249785',
    service: 'Inverter & UPS',
    date: '2026-08-14',
    status: 'Completed',
    notes: 'Microtek Inverter 1050VA installation + battery water check.',
    estimatedCost: '₹2,200',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
  },
  {
    _id: 'req_104',
    name: 'Vignesh P.',
    phone: '9789012345',
    service: 'New Installation',
    date: '2026-08-18',
    status: 'In Progress',
    notes: 'New shop lighting layout & MCB breaker box setup near main bazaar.',
    estimatedCost: '₹4,500',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() // 12 hours ago
  }
];

export function getStoredRequests() {
  if (typeof window === 'undefined') return INITIAL_REQUESTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
      return INITIAL_REQUESTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse requests from localStorage', err);
    return INITIAL_REQUESTS;
  }
}

export function saveRequests(requests) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (err) {
    console.error('Failed to save requests to localStorage', err);
  }
}

export function addRequestToStorage(data) {
  const requests = getStoredRequests();
  const newReq = {
    _id: 'req_' + Date.now(),
    name: data.name,
    phone: data.phone,
    service: data.service,
    date: data.date || data.preferredDate || new Date().toISOString().split('T')[0],
    preferredDate: data.date || data.preferredDate || new Date().toISOString().split('T')[0],
    status: 'Pending',
    notes: data.notes || '',
    estimatedCost: '',
    createdAt: new Date().toISOString()
  };
  const updated = [newReq, ...requests];
  saveRequests(updated);
  return newReq;
}

export function updateRequestInStorage(id, updates) {
  const requests = getStoredRequests();
  const updated = requests.map(r => r._id === id ? { ...r, ...updates } : r);
  saveRequests(updated);
  return updated;
}

export function deleteRequestFromStorage(id) {
  const requests = getStoredRequests();
  const updated = requests.filter(r => r._id !== id);
  saveRequests(updated);
  return updated;
}

export function getAdminAuth() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setAdminAuth(authData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
}

export function clearAdminAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}
