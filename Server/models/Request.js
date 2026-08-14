const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  service: {
    type: String,
    required: [true, 'Service type is required'],
    trim: true,
  },
  preferredDate: {
    type: String,
    required: [true, 'Preferred date is required'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Contacted', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  notes: {
    type: String,
    default: '',
  },
  estimatedCost: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Request', requestSchema);
