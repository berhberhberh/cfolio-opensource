import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Simple auth check - you should replace this with proper admin authentication
    const authHeader = request.headers.get('authorization');
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate a random beta key
    const key = randomBytes(16).toString('hex');

    const betaKey = await prisma.betaKey.create({
      data: { key },
    });

    return NextResponse.json({
      success: true,
      betaKey: betaKey.key,
    });
  } catch (error) {
    console.error('Beta key generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
