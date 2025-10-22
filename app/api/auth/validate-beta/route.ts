import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { betaKey } = await request.json();

    if (!betaKey) {
      return NextResponse.json(
        { error: 'Beta key is required' },
        { status: 400 }
      );
    }

    const key = await prisma.betaKey.findUnique({
      where: { key: betaKey },
    });

    if (!key) {
      return NextResponse.json(
        { error: 'Invalid beta key' },
        { status: 404 }
      );
    }

    if (key.isUsed) {
      return NextResponse.json(
        { error: 'Beta key has already been used' },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Beta key validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
