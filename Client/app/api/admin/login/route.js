import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'balaji_electricals_secret_jwt_key_2025_secure';

const VALID_CREDENTIALS = [
  { u: 'balaji', p: 'balaji123' },
  { u: 'admin', p: 'admin123' },
  { u: (process.env.ADMIN_USERNAME || '').trim(), p: (process.env.ADMIN_PASSWORD || '').trim() }
];

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Please enter both username and password.' },
        { status: 400 }
      );
    }

    const trimmedUser = String(username).trim();
    const inputPass = String(password).trim();

    // Strict validation
    const isValid = VALID_CREDENTIALS.some(
      c => c.u && c.u.toLowerCase() === trimmedUser.toLowerCase() && c.p === inputPass
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { username: trimmedUser },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      token,
      admin: { username: trimmedUser }
    });
  } catch (error) {
    console.error('Vercel API admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during login.' },
      { status: 500 }
    );
  }
}
