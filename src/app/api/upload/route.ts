// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!imageFile) {
      return NextResponse.json({ message: 'No image file uploaded' }, { status: 400 });
    }

    // 파일을 버퍼로 변환
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    // 저장 경로 설정 및 폴더 생성
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });

    // 파일 저장
    const newFileName = `${Date.now()}-${imageFile.name}`;
    const newFilePath = path.join(uploadDir, newFileName);
    await fs.writeFile(newFilePath, buffer);

    // DB에 정보 저장
    const webFilePath = `/uploads/${folder}/${newFileName}`;
    const newImage = await prisma.image.create({
      data: {
        filename: newFileName,
        filepath: webFilePath,
        folder: folder,
      },
    });

    return NextResponse.json({ message: 'File uploaded successfully!', image: newImage }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error during file upload' }, { status: 500 });
  }
}