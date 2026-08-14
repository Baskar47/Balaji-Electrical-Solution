import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'balaji_electricals_secret_jwt_key_2025_secure';

// Shared memory store for serverless mode
global.vercelRequests = global.vercelRequests || [
  {
    _id: 'req_101',
    name: 'Suresh K.',
    phone: '9840123456',
    service: 'Repairs & Service',
    preferredDate: '2026-08-15',
    status: 'Pending',
    notes: 'Ceiling fan making noisy sound in front hall. Need visit by 5 PM.',
    estimatedCost: '₹350',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    _id: 'req_102',
    name: 'Meena R.',
    phone: '9443198765',
    service: 'House Wiring',
    preferredDate: '2026-08-16',
    status: 'Contacted',
    notes: 'Kitchen power points addition + main switchboard safety test.',
    estimatedCost: '₹1,500',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

function verifyToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

// GET /api/requests (Admin protected)
export async function GET(request) {
  const decoded = verifyToken(request);
  if (!decoded) {
    return NextResponse.json({ success: false, message: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  let list = [...global.vercelRequests];

  if (status && status !== 'All') {
    list = list.filter(r => r.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(r =>
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.phone && r.phone.includes(q)) ||
      (r.service && r.service.toLowerCase().includes(q)) ||
      (r.notes && r.notes.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({ success: true, count: list.length, data: list });
}

// POST /api/requests (Public Client Booking)
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, service, date, preferredDate, notes, estimatedCost } = body || {};
    const reqDate = date || preferredDate;

    if (!name || !phone || !service || !reqDate) {
      return NextResponse.json(
        { success: false, message: 'Please fill in all required fields (name, phone, service, date).' },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit phone number.' },
        { status: 400 }
      );
    }

    const newReq = {
      _id: 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: String(name).trim(),
      phone: cleanPhone,
      service: String(service).trim(),
      preferredDate: reqDate,
      status: 'Pending',
      notes: notes || '',
      estimatedCost: estimatedCost || '',
      createdAt: new Date().toISOString()
    };

    global.vercelRequests.unshift(newReq);

    return NextResponse.json({
      success: true,
      message: 'Request submitted successfully!',
      data: newReq
    }, { status: 201 });
  } catch (error) {
    console.error('Vercel API submit request error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while submitting request.' },
      { status: 500 }
    );
  }
}
