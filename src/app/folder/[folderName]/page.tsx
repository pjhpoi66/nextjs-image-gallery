import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Image as ImageType } from '@prisma/client';
import UploadForm from './UploadForm';

export default async function FolderPage({ params }: { params: { folderName: string } }) {
  const { folderName } = params;

  // 컴포넌트 내에서 직접 데이터 fetch
  const images: ImageType[] = await prisma.image.findMany({
    where: { folder: folderName },
    orderBy: { createdAt: 'desc' },
  });

  return (
      <div className="container">
        <Link href="/">← 뒤로가기</Link>
        <h1>폴더: {folderName}</h1>

        <UploadForm folderName={folderName} />

        <div className="image-grid">
          {images.map((image) => (
              <div key={image.id} className="image-card">
                <img src={image.filepath} alt={image.filename} />
              </div>
          ))}
          {images.length === 0 && <p>이 폴더에 이미지가 없습니다.</p>}
        </div>
      </div>
  );
}