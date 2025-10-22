import { NextRequest, NextResponse } from 'next/server';
import { fetchWalletBalance } from '@/lib/balance-service';
import { ChainType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { address, chain } = await request.json();

    if (!address || !chain) {
      return NextResponse.json(
        { error: 'Address and chain are required' },
        { status: 400 }
      );
    }

    const result = await fetchWalletBalance(address, chain as ChainType);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in balance API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
