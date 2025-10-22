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

    const wallets = await prisma.wallet.findMany({
      where: { userId: session.user.id },
      orderBy: { addedAt: 'desc' },
    });

    return NextResponse.json({ wallets });
  } catch (error) {
    console.error('Get wallets error:', error);
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

    const { address, chain, label } = await request.json();

    if (!address || !chain) {
      return NextResponse.json(
        { error: 'Address and chain are required' },
        { status: 400 }
      );
    }

    // Check if wallet already exists
    const existing = await prisma.wallet.findUnique({
      where: {
        userId_address_chain: {
          userId: session.user.id,
          address,
          chain,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Wallet already exists' },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.create({
      data: {
        address,
        chain,
        label,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error('Add wallet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('id');

    if (!walletId) {
      return NextResponse.json(
        { error: 'Wallet ID is required' },
        { status: 400 }
      );
    }

    // Verify wallet belongs to user
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet || wallet.userId !== session.user.id) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    await prisma.wallet.delete({
      where: { id: walletId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete wallet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
