import { NextResponse } from 'next/server';
import { generateAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('ADMIN_EMAIL or ADMIN_PASSWORD not configured in environment');
      return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
    }

    // Constant-time comparison to avoid timing attacks
    const emailMatch = email === adminEmail;
    const passwordMatch = password === adminPassword;

    if (!emailMatch || !passwordMatch) {
      // Same message for both wrong email and wrong password
      return NextResponse.json({ message: 'Invalid admin credentials.' }, { status: 401 });
    }

    const token = generateAdminToken();

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
