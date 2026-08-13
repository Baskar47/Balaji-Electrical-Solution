require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

const app = express();

// Connect Database
connectDB();

// Seed Default Admin User if DB connected
const seedDefaultAdmin = async () => {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await Admin.findOne({ username: adminUsername });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await Admin.create({ username: adminUsername, password: hashedPassword });
      console.log(`[Admin Seed] Default admin created: ${adminUsername}`);
    }
  } catch (err) {
    console.log('[Admin Seed Note] Skipping automatic admin seed:', err.message);
  }
};

// Delay seed slightly for db connection
setTimeout(seedDefaultAdmin, 2000);

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for dev flexibility
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Balaji Electricals API Backend',
    timestamp: new Date()
  });
});

// Routes
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Route not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Balaji Electricals Backend Server running on port ${PORT}`);
  console.log(`📍 API Health: http://localhost:${PORT}/api/health`);
  console.log(`=================================================`);
});
