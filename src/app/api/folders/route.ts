// src/app/api/folders/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// GET: 모든 폴더 목록 조회
export async function GET() {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    const allFiles = await fs.readdir(uploadDir, { withFileTypes: true });
    const folders = allFiles
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    return NextResponse.json(folders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to read folders' }, { status: 500 });
  }
}

// POST: 새 폴더 생성
export async function POST(request: Request) {
  try {
    const { folderName } = await request.json();
    if (!folderName || typeof folderName !== 'string' || folderName.includes('/') || folderName.includes('\\')) {
      return NextResponse.json({ message: 'Invalid folder name' }, { status: 400 });
    }

    const folderPath = path.join(uploadDir, folderName);
    await fs.mkdir(folderPath, { recursive: true });

    return NextResponse.json({ message: `Folder '${folderName}' created` }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to create folder' }, { status: 500 });
  }
}
