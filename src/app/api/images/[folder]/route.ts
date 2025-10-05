// pages/api/images/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ folder: string }> }
) {
  const { folder } = await params;

  try {
    const images = await prisma.image.findMany({
      where: {
        folder: folder,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Failed to fetch images:', error);
    return NextResponse.json({ message: 'Failed to fetch images' }, { status: 500 });
  }
}
