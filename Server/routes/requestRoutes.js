const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const verifyAdminToken = require('../middleware/auth');
const mongoose = require('mongoose');

// In-memory fallback storage if MongoDB is not connected
let memoryRequests = [
  {
    _id: 'mem_101',
    name: 'Suresh K.',
    phone: '9840123456',
    service: 'Repairs & Service',
    preferredDate: '2026-08-15',
    status: 'Pending',
    notes: 'Ceiling fan making noisy sound in front hall. Need visit by 5 PM.',
    estimatedCost: '₹350',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  {
    _id: 'mem_102',
    name: 'Meena R.',
    phone: '9443198765',
    service: 'House Wiring',
    preferredDate: '2026-08-16',
    status: 'Contacted',
    notes: 'Kitchen power points addition + main switchboard safety test.',
    estimatedCost: '₹1,500',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
  }
];

// Helper to check DB connection status
const isDbConnected = () => mongoose.connection.readyState === 1;

// @route   POST /api/requests
// @desc    Submit a new service request (Client Public)
router.post('/', async (req, res) => {
  try {
    const { name, phone, service, date, preferredDate, notes, estimatedCost } = req.body;
    const reqDate = date || preferredDate;

    if (!name || !phone || !service || !reqDate) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (name, phone, service, date).'
      });
    }

    // Phone validation
    const cleanPhone = String(phone).replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit phone number.'
      });
    }

    if (isDbConnected()) {
      const newRequest = await Request.create({
        name,
        phone: cleanPhone,
        service,
        preferredDate: reqDate,
        status: 'Pending',
        notes: notes || '',
        estimatedCost: estimatedCost || ''
      });
      return res.status(201).json({
        success: true,
        message: 'Request submitted successfully!',
        data: newRequest
      });
    } else {
      // In-memory fallback
      const fallbackRequest = {
        _id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name,
        phone: cleanPhone,
        service,
        preferredDate: reqDate,
        status: 'Pending',
        notes: notes || '',
        estimatedCost: estimatedCost || '',
        createdAt: new Date()
      };
      memoryRequests.unshift(fallbackRequest);
      return res.status(201).json({
        success: true,
        message: 'Request submitted successfully!',
        data: fallbackRequest
      });
    }
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ success: false, message: 'Server error while submitting request.' });
  }
});

// @route   GET /api/requests
// @desc    Get all requests (Admin protected)
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const { status, search } = req.query;

    if (isDbConnected()) {
      let query = {};
      if (status && status !== 'All') {
        query.status = status;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { service: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } }
        ];
      }
      const requests = await Request.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: requests.length, data: requests });
    } else {
      let filtered = [...memoryRequests];
      if (status && status !== 'All') {
        filtered = filtered.filter(r => r.status === status);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(r => 
          (r.name && r.name.toLowerCase().includes(q)) || 
          (r.phone && r.phone.includes(q)) || 
          (r.service && r.service.toLowerCase().includes(q)) ||
          (r.notes && r.notes.toLowerCase().includes(q))
        );
      }
      return res.json({ success: true, count: filtered.length, data: filtered });
    }
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ success: false, message: 'Server error fetching requests.' });
  }
});

// @route   PATCH /api/requests/:id
// @desc    Update request status, notes or estimated cost (Admin protected)
router.patch('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, estimatedCost } = req.body;

    if (isDbConnected() && !id.startsWith('mem_')) {
      const updateData = {};
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost;

      const updated = await Request.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Request not found.' });
      }
      return res.json({ success: true, message: 'Request updated successfully.', data: updated });
    } else {
      const index = memoryRequests.findIndex(r => r._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Request not found.' });
      }
      if (status) memoryRequests[index].status = status;
      if (notes !== undefined) memoryRequests[index].notes = notes;
      if (estimatedCost !== undefined) memoryRequests[index].estimatedCost = estimatedCost;
      return res.json({ success: true, message: 'Request updated successfully.', data: memoryRequests[index] });
    }
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ success: false, message: 'Server error updating request.' });
  }
});

// @route   DELETE /api/requests/:id
// @desc    Delete a request (Admin protected)
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected() && !id.startsWith('mem_')) {
      const deleted = await Request.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Request not found.' });
      }
      return res.json({ success: true, message: 'Request deleted successfully.' });
    } else {
      const index = memoryRequests.findIndex(r => r._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Request not found.' });
      }
      memoryRequests.splice(index, 1);
      return res.json({ success: true, message: 'Request deleted successfully.' });
    }
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ success: false, message: 'Server error deleting request.' });
  }
});

module.exports = router;
