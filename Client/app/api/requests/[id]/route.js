import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'balaji_electricals_secret_jwt_key_2025_secure';

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

// PATCH /api/requests/[id]
export async function PATCH(request, { params }) {
  const decoded = verifyToken(request);
  if (!decoded) {
    return NextResponse.json({ success: false, message: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json();
  const { status, notes, estimatedCost } = body || {};

  const list = global.vercelRequests || [];
  const index = list.findIndex(r => r._id === id);

  if (index === -1) {
    return NextResponse.json({ success: false, message: 'Request not found.' }, { status: 404 });
  }

  if (status) list[index].status = status;
  if (notes !== undefined) list[index].notes = notes;
  if (estimatedCost !== undefined) list[index].estimatedCost = estimatedCost;

  return NextResponse.json({
    success: true,
    message: 'Request updated successfully.',
    data: list[index]
  });
}

// DELETE /api/requests/[id]
export async function DELETE(request, { params }) {
  const decoded = verifyToken(request);
  if (!decoded) {
    return NextResponse.json({ success: false, message: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id } = params;
  const list = global.vercelRequests || [];
  const index = list.findIndex(r => r._id === id);

  if (index === -1) {
    return NextResponse.json({ success: false, message: 'Request not found.' }, { status: 404 });
  }

  list.splice(index, 1);

  return NextResponse.json({
    success: true,
    message: 'Request deleted successfully.'
  });
}
