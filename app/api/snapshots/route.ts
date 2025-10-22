import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get last 7 days of snapshots
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const snapshots = await prisma.portfolioSnapshot.findMany({
      where: {
        userId: session.user.id,
        timestamp: { gte: sevenDaysAgo },
      },
      orderBy: { timestamp: 'asc' },
    });

    return NextResponse.json({ snapshots });
  } catch (error) {
    console.error('Get snapshots error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { totalValue, assetValues } = await request.json();

    if (typeof totalValue !== 'number' || !Array.isArray(assetValues)) {
      return NextResponse.json(
        { error: 'Invalid snapshot data' },
        { status: 400 }
      );
    }

    // Check if we should take a snapshot (avoid duplicates within 30 min)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentSnapshot = await prisma.portfolioSnapshot.findFirst({
      where: {
        userId: session.user.id,
        timestamp: { gte: thirtyMinutesAgo },
      },
      orderBy: { timestamp: 'desc' },
    });

    // If recent snapshot exists and value hasn't changed much, don't create new one
    if (recentSnapshot) {
      const valueChange = Math.abs(totalValue - recentSnapshot.totalValue);
      const percentChange =
        recentSnapshot.totalValue > 0
          ? (valueChange / recentSnapshot.totalValue) * 100
          : 0;

      if (percentChange < 0.5) {
        return NextResponse.json({
          snapshot: recentSnapshot,
          message: 'Using recent snapshot',
        });
      }
    }

    const snapshot = await prisma.portfolioSnapshot.create({
      data: {
        totalValue,
        assetValues,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error('Create snapshot error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
