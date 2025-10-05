import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prisma';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// DELETE: 특정 폴더 및 내용 삭제
export async function DELETE(
    request: Request,
    { params }: { params: Promise <{ folderName: string }> }
) {
  const {folderName} = await params;
  try {
    // 1. DB에서 관련 이미지 레코드 삭제
    await prisma.image.deleteMany({
      where: { folder: folderName },
    });

    // 2. 파일 시스템에서 폴더 및 내용 삭제
    const folderPath = path.join(uploadDir, folderName);
    await fs.rm(folderPath, { recursive: true, force: true });

    return NextResponse.json({ message: `Folder '${folderName}' and its contents deleted` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: `Failed to delete folder '${folderName}'` }, { status: 500 });
  }
}
