import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prisma';

// DELETE: 특정 이미지 삭제
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const {imageId} = await params;
    const imgId : number = parseInt(imageId);

    if (isNaN(imgId)) {
      return NextResponse.json({ message: 'Invalid image ID' }, { status: 400 });
    }

    // 1. DB에서 이미지 정보 조회
    const image = await prisma.image.findUnique({
      where: { id: imgId },
    });

    if (!image) {
      return NextResponse.json({ message: 'Image not found' }, { status: 404 });
    }

    // 2. 파일 시스템에서 실제 파일 삭제
    const filePath = path.join(process.cwd(), 'public', image.filepath);
    try {
      await fs.unlink(filePath);
    } catch {
      console.warn(`File not found, but proceeding to delete DB record: ${filePath}`);
    }


    // 3. DB에서 이미지 레코드 삭제
    await prisma.image.delete({
      where: { id: imgId },
    });

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to delete image' }, { status: 500 });
  }
}
