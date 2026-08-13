const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const verifyAdminToken = require('../middleware/auth');
const mongoose = require('mongoose');

// In-memory fallback storage if MongoDB is not connected
let memoryRequests = [];

// Helper to check DB connection status
const isDbConnected = () => mongoose.connection.readyState === 1;

// @route   POST /api/requests
// @desc    Submit a new service request (Client Public)
router.post('/', async (req, res) => {
  try {
    const { name, phone, service, date } = req.body;

    if (!name || !phone || !service || !date) {
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
        preferredDate: date,
        status: 'Pending',
        notes: ''
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
        preferredDate: date,
        status: 'Pending',
        notes: '',
        createdAt: new Date()
      };
      memoryRequests.unshift(fallbackRequest);
      return res.status(201).json({
        success: true,
        message: 'Request submitted successfully! (Memory mode)',
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
          { service: { $regex: search, $options: 'i' } }
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
          r.name.toLowerCase().includes(q) || 
          r.phone.includes(q) || 
          r.service.toLowerCase().includes(q)
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
// @desc    Update request status or notes (Admin protected)
router.patch('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (isDbConnected() && !id.startsWith('mem_')) {
      const updateData = {};
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;

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
