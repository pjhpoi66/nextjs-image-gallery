"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // next/router -> next/navigation

export default function UploadForm({ folderName }: { folderName: string }) {
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folderName);

    // API 경로는 그대로 사용
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      alert('업로드 성공!');
      router.refresh(); // App Router에서는 router.refresh()로 데이터 갱신
    } else {
      alert('업로드 실패.');
    }
  };

  return (
      <form onSubmit={handleUpload} className="upload-form">
        <h3>이 폴더에 이미지 업로드</h3>
        <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
            required
        />
        <button type="submit">업로드</button>
      </form>
  );
}