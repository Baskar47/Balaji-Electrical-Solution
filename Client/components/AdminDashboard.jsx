'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Phone, 
  MessageCircle, 
  Search, 
  RefreshCw, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Calendar, 
  Trash2, 
  Save, 
  FileText,
  X,
  Download,
  DollarSign,
  Wrench,
  BarChart3,
  Shield,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { 
  getAdminToken, 
  getAdminUser, 
  clearAdminAuth, 
  adminLogin, 
  fetchAdminRequests, 
  updateAdminRequest, 
  deleteAdminRequest 
} from '../lib/api';

export default function AdminDashboard({ onClose, onNavigateHome }) {
  const [authToken, setAuthToken] = useState(() => getAdminToken());
  const [adminUser, setAdminUser] = useState(() => getAdminUser());
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'services' | 'analytics'

  // Requests state
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingNotes, setEditingNotes] = useState({});
  const [editingCosts, setEditingCosts] = useState({});
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');
  const [apiErr, setApiErr] = useState('');

  // Services list
  const [servicesList] = useState([
    { id: 1, title: 'House Wiring', priceRange: '₹1,500 - ₹15,000', status: 'Active', desc: 'Safe, neat rewiring and new electrical points.' },
    { id: 2, title: 'Repairs & Service', priceRange: '₹200 - ₹800', status: 'Active', desc: 'Switches, fans, tripping and short circuits.' },
    { id: 3, title: 'Inverter & UPS', priceRange: '₹800 - ₹3,000', status: 'Active', desc: 'Backup power installation and maintenance.' },
    { id: 4, title: 'New Installation', priceRange: '₹1,000 - ₹10,000', status: 'Active', desc: 'Complete setup for homes, shops and offices.' }
  ]);

  // Load requests when auth changes or filters change
  useEffect(() => {
    if (authToken) {
      loadRequests();
    }
  }, [authToken, statusFilter]);

  const loadRequests = async () => {
    setLoading(true);
    setApiErr('');
    try {
      const data = await fetchAdminRequests(statusFilter, search);
      setRequests(data);
      
      const notesMap = {};
      const costsMap = {};
      data.forEach(r => { 
        notesMap[r._id] = r.notes || ''; 
        costsMap[r._id] = r.estimatedCost || '';
      });
      setEditingNotes(notesMap);
      setEditingCosts(costsMap);
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') {
        handleLogout();
        setLoginError('Session expired. Please log in again.');
      } else {
        setApiErr(err.message || 'Failed to load requests from server DB.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    const userToLogin = 'balaji';
    const passToLogin = 'balaji123';

    try {
      const result = await adminLogin(userToLogin, passToLogin);
      if (result.success && result.token) {
        setAuthToken(result.token);
        setAdminUser(result.admin || { username: userToLogin });
      }
    } catch (err) {
      setLoginError(err.message || 'Invalid username or password.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleQuickLogin = async () => {
    setUsername('balaji');
    setPassword('balaji123');
    setLoginError('');
    setLoggingIn(true);

    try {
      const result = await adminLogin('balaji', 'balaji123');
      if (result.success && result.token) {
        setAuthToken(result.token);
        setAdminUser(result.admin || { username: 'balaji' });
      }
    } catch (err) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    clearAdminAuth();
    setAuthToken(null);
    setAdminUser(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updatedItem = await updateAdminRequest(id, { status: newStatus });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
      showTempToast(`Status updated to "${newStatus}" in DB`);
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') handleLogout();
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleSaveNotesAndCost = async (id) => {
    try {
      const notesVal = editingNotes[id] || '';
      const costVal = editingCosts[id] || '';
      await updateAdminRequest(id, { notes: notesVal, estimatedCost: costVal });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, notes: notesVal, estimatedCost: costVal } : r));
      showTempToast('Saved notes & quote directly to DB');
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') handleLogout();
      alert(`Error saving details: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer request from the database?')) return;
    try {
      await deleteAdminRequest(id);
      setRequests(prev => prev.filter(r => r._id !== id));
      showTempToast('Request deleted from DB');
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') handleLogout();
      alert(`Error deleting request: ${err.message}`);
    }
  };

  const showTempToast = (msg) => {
    setSavedSuccessMsg(msg);
    setTimeout(() => setSavedSuccessMsg(''), 3500);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Service', 'Preferred Date', 'Status', 'Cost Estimate', 'Notes', 'Created At'];
    const rows = requests.map(r => [
      r._id,
      `"${r.name || ''}"`,
      `"${r.phone || ''}"`,
      `"${r.service || ''}"`,
      `"${r.preferredDate || r.date || ''}"`,
      `"${r.status || 'Pending'}"`,
      `"${r.estimatedCost || ''}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
      `"${r.createdAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `balaji_electricals_db_requests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Client side search filter over fetched list
  const filteredRequests = requests.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.phone?.includes(q) ||
      r.service?.toLowerCase().includes(q) ||
      r.notes?.toLowerCase().includes(q)
    );
  });

  // Calculate metrics
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const contactedCount = requests.filter(r => r.status === 'Contacted').length;
  const inProgressCount = requests.filter(r => r.status === 'In Progress').length;
  const completedCount = requests.filter(r => r.status === 'Completed').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Unauthenticated Lock Screen
  if (!authToken) {
    return (
      <div className="admin-lockscreen-wrapper">
        <div className="admin-login-card animate-in fade-in zoom-in">
          <div className="admin-login-header">
            <div className="admin-brand-icon">
              <Zap size={28} fill="currentColor" />
            </div>
            <h2>Balaji Electrical Solution</h2>
            <p className="subtitle">Database Admin Portal</p>
          </div>

          {loginError && (
            <div className="admin-error-box">
              <AlertCircle size={16} /> {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label className="admin-label">Admin Username</label>
              <input 
                type="text" 
                className="admin-input"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Enter username" 
                required 
              />
            </div>
            <div className="form-group">
              <label className="admin-label">Password</label>
              <input 
                type="password" 
                className="admin-input"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter password" 
                required 
              />
            </div>
            <button type="submit" className="admin-btn-primary" disabled={loggingIn}>
              {loggingIn ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="spin" /> Authenticating...
                </span>
              ) : 'Access Admin Dashboard'}
            </button>
          </form>


          {onNavigateHome && (
            <div className="admin-back-link">
              <button onClick={onNavigateHome} className="admin-link-button">
                <ArrowLeft size={14} /> Return to Main Website
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-app-container">
      {/* Toast Banner */}
      {savedSuccessMsg && (
        <div className="admin-toast-banner">
          <CheckCircle2 size={16} /> {savedSuccessMsg}
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <div className="admin-brand-logo">
            <Zap size={22} fill="currentColor" />
          </div>
          <div>
            <h1 className="admin-app-title">Balaji Electrical Solution <span>Admin DB Portal</span></h1>
            <p className="admin-app-sub">Database Mode • Logged in as <strong>{adminUser?.username || 'Admin'}</strong></p>
          </div>
        </div>

        <div className="admin-topbar-right">
          {onNavigateHome && (
            <button onClick={onNavigateHome} className="admin-nav-btn outline">
              <ArrowLeft size={15} /> Website View
            </button>
          )}
          <button onClick={exportCSV} className="admin-nav-btn secondary">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={handleLogout} className="admin-nav-btn danger">
            <LogOut size={15} /> Exit
          </button>
        </div>
      </header>

      {/* Main Tabs Header */}
      <div className="admin-tabs-bar">
        <button 
          className={`admin-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <FileText size={17} /> Live Requests DB ({totalCount})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <Wrench size={17} /> Services Catalogue ({servicesList.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={17} /> Analytics & Performance
        </button>
      </div>

      {apiErr && (
        <div style={{ margin: '15px 24px 0', background: '#fef2f2', border: '1px solid #fca5a5', padding: '12px 16px', borderRadius: '8px', color: '#991b1b', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> <span>{apiErr}</span>
          </div>
          <button onClick={loadRequests} style={{ background: '#991b1b', color: '#fff', border: 0, padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Retry Connection</button>
        </div>
      )}

      {/* TAB 1: SERVICE REQUESTS */}
      {activeTab === 'requests' && (
        <>
          {/* Quick Metrics Bar */}
          <div className="admin-metrics-grid">
            <div className="metric-card">
              <div className="metric-icon total">
                <FileText size={22} />
              </div>
              <div>
                <span className="metric-val">{totalCount}</span>
                <span className="metric-label">Total DB Bookings</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon pending">
                <Clock size={22} />
              </div>
              <div>
                <span className="metric-val">{pendingCount}</span>
                <span className="metric-label">Pending Action</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon contacted">
                <UserCheck size={22} />
              </div>
              <div>
                <span className="metric-val">{contactedCount}</span>
                <span className="metric-label">Contacted Customers</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon progress">
                <Zap size={22} />
              </div>
              <div>
                <span className="metric-val">{inProgressCount}</span>
                <span className="metric-label">Jobs In Progress</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon completed">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <span className="metric-val">{completedCount}</span>
                <span className="metric-label">Completed ({completionRate}%)</span>
              </div>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="admin-filter-container">
            <div className="admin-search-input-wrap">
              <Search size={17} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by customer name, phone number, service..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="clear-search" onClick={() => setSearch('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="admin-filter-pills">
              {['All', 'Pending', 'Contacted', 'In Progress', 'Completed', 'Cancelled'].map(st => (
                <button
                  key={st}
                  className={`filter-pill ${statusFilter === st ? 'active' : ''}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>

            <button onClick={loadRequests} className="admin-refresh-btn" title="Reload requests from server DB">
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
            </button>
          </div>

          {/* Requests Content List */}
          {loading ? (
            <div className="admin-empty-state" style={{ minHeight: '260px' }}>
              <RefreshCw size={36} className="spin empty-icon" />
              <h3>Loading Database Requests...</h3>
              <p>Fetching real-time customer data from backend server</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="admin-empty-state">
              <AlertCircle size={38} className="empty-icon" />
              <h3>No Customer Requests Found in Database</h3>
              <p>{search ? `No customer enquiries matching "${search}"` : `No requests found under status "${statusFilter}"`}</p>
              {search && (
                <button onClick={() => setSearch('')} className="admin-btn-secondary mt-2">
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            <div className="admin-cards-grid">
              {filteredRequests.map(req => {
                const formattedPhone = (req.phone || '').replace(/\D/g, '');
                const waLink = `https://wa.me/91${formattedPhone}?text=${encodeURIComponent(`Hello ${req.name}, regarding your electrical service request for ${req.service} - Balaji Electricals`)}`;
                const callLink = `tel:${formattedPhone}`;
                const dateDisplay = req.preferredDate || req.date || 'Asap';
                const createdTime = req.createdAt ? new Date(req.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently';

                return (
                  <div className="admin-req-card" key={req._id}>
                    <div className="req-card-header">
                      <div>
                        <h3 className="req-customer-name">{req.name}</h3>
                        <div className="req-meta-line">
                          <Calendar size={13} /> Preferred: <strong>{dateDisplay}</strong>
                        </div>
                      </div>
                      <span className={`status-badge st-${(req.status || 'Pending').toLowerCase().replace(/\s+/g, '-')}`}>
                        {req.status || 'Pending'}
                      </span>
                    </div>

                    <div className="req-details-grid">
                      <div className="detail-item">
                        <span className="label">Service Required:</span>
                        <span className="val highlight">{req.service}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Phone:</span>
                        <span className="val">{req.phone}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Logged On:</span>
                        <span className="val muted">{createdTime}</span>
                      </div>
                    </div>

                    {/* Quick Call & WhatsApp Action Buttons */}
                    <div className="req-action-buttons">
                      <a href={callLink} className="action-btn call-btn">
                        <Phone size={14} /> Call Customer
                      </a>
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className="action-btn wa-btn">
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                    </div>

                    {/* Status Select & Delete */}
                    <div className="req-status-row">
                      <label className="status-label">Update DB Status:</label>
                      <select 
                        className="status-dropdown" 
                        value={req.status || 'Pending'} 
                        onChange={(e) => handleStatusChange(req._id, e.target.value)}
                      >
                        <option value="Pending">Pending ⏳</option>
                        <option value="Contacted">Contacted 📞</option>
                        <option value="In Progress">In Progress ⚡</option>
                        <option value="Completed">Completed ✅</option>
                        <option value="Cancelled">Cancelled ❌</option>
                      </select>

                      <button 
                        className="delete-icon-btn" 
                        onClick={() => handleDelete(req._id)} 
                        title="Delete Request from Database"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Notes & Pricing Quote Inputs */}
                    <div className="req-notes-box">
                      <div className="notes-box-header">
                        <span>Visit Notes & Estimated Quote</span>
                        <button 
                          onClick={() => handleSaveNotesAndCost(req._id)}
                          className="save-notes-btn"
                        >
                          <Save size={13} /> Save to DB
                        </button>
                      </div>
                      
                      <div className="cost-input-row">
                        <DollarSign size={14} className="cost-icon" />
                        <input 
                          type="text" 
                          placeholder="Estimated Quote (e.g. ₹450)"
                          value={editingCosts[req._id] || ''}
                          onChange={(e) => setEditingCosts(prev => ({ ...prev, [req._id]: e.target.value }))}
                          className="cost-input"
                        />
                      </div>

                      <textarea 
                        className="notes-textarea"
                        rows={2}
                        placeholder="Add address, visit notes, parts needed..."
                        value={editingNotes[req._id] || ''}
                        onChange={(e) => setEditingNotes(prev => ({ ...prev, [req._id]: e.target.value }))}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: SERVICES MANAGEMENT */}
      {activeTab === 'services' && (
        <div className="admin-services-tab">
          <div className="tab-section-header">
            <div>
              <h2>Services Catalogue & Pricing</h2>
              <p>Overview of electrical services offered to customers in Manalurpet</p>
            </div>
          </div>

          <div className="services-admin-grid">
            {servicesList.map(srv => (
              <div key={srv.id} className="service-admin-card">
                <div className="svc-header">
                  <div className="svc-title-icon">
                    <Zap size={18} />
                    <h3>{srv.title}</h3>
                  </div>
                  <span className="svc-status-pill">{srv.status}</span>
                </div>
                <p className="svc-desc">{srv.desc}</p>
                <div className="svc-price-row">
                  <span>Standard Price Range:</span>
                  <strong>{srv.priceRange}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="admin-analytics-tab">
          <div className="tab-section-header">
            <div>
              <h2>Database Analytics Overview</h2>
              <p>Key service statistics and performance summary directly from backend database</p>
            </div>
          </div>

          <div className="analytics-summary-cards">
            <div className="analytics-card">
              <h3>Service Breakdown</h3>
              <ul className="breakdown-list">
                {['House Wiring', 'Repairs & Service', 'Inverter & UPS', 'New Installation'].map(cat => {
                  const count = requests.filter(r => r.service === cat).length;
                  const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                  return (
                    <li key={cat}>
                      <div className="breakdown-info">
                        <span>{cat}</span>
                        <strong>{count} ({pct}%)</strong>
                      </div>
                      <div className="progress-bg">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="analytics-card">
              <h3>Customer Contact & Conversion</h3>
              <div className="conversion-stats">
                <div className="stat-row">
                  <span>Total Enquiries Received:</span>
                  <strong>{totalCount}</strong>
                </div>
                <div className="stat-row">
                  <span>Customers Contacted:</span>
                  <strong>{contactedCount + inProgressCount + completedCount}</strong>
                </div>
                <div className="stat-row">
                  <span>Visits Successfully Completed:</span>
                  <strong className="text-emerald">{completedCount}</strong>
                </div>
                <div className="stat-row">
                  <span>Success Rate:</span>
                  <strong className="text-primary">{completionRate}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
