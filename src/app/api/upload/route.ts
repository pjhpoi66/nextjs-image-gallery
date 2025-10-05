// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {

  /**
   * 파일 이름을 URL 및 파일 시스템에서 안전하게 사용할 수 있도록 변환합니다.
   * 이 함수는 POST 핸들러 내부에 위치하여 스코프 문제를 방지합니다.
   * @param filename 원본 파일 이름
   * @returns 변환된 파일 이름
   */
  const sanitizeFilename = (filename: string): string => {
    const extension = path.extname(filename);
    const name = path.basename(filename, extension);

    // 1. 모든 비-ASCII 문자를 제거합니다. (한글, 한자 등)
    const asciiName = name.replace(/[^\x00-\x7F]/g, '');
    // 2. 안전하지 않은 문자(공백, 특수문자 등)를 하이픈(-)으로 변경합니다.
    const sanitized = asciiName.replace(/[^a-zA-Z0-9_.-]/g, '-').replace(/-+/g, '-');

    // 파일 이름이 비어있으면 랜덤 문자열을 생성합니다.
    const finalName = sanitized || Math.random().toString(36).substring(7);

    return `${finalName}${extension}`;
  };

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!imageFile) {
      return NextResponse.json({ message: 'No image file uploaded' }, { status: 400 });
    }

    // 파일을 버퍼로 변환
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    const originalFilename = imageFile.name;
    const sanitized = sanitizeFilename(originalFilename);
    const newFileName = `${Date.now()}-${sanitized}`;

    // 저장 경로 설정 및 폴더 생성
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });

    // 파일 저장
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