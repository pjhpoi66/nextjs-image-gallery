"use client";

import {useState, useCallback} from 'react';
import {Image as ImageType} from '@prisma/client';
import ImagePreviewModal from './ImagePreviewModal';

// 아이콘 SVG 컴포넌트
const FolderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
         className="w-16 h-16 text-yellow-500">
      <path
          d="M19.5 21a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-5.25a3 3 0 0 1-2.65-1.5L9.75 1.5a3 3 0 0 0-2.65-1.5H4.5a3 3 0 0 0-3 3v15a3 3 0 0 0 3 3h15Z"/>
    </svg>
);

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-black">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
    </svg>
);


type Item = { type: 'folder', name: string } | { type: 'image', data: ImageType };

export default function FileManager({initialFolders}: { initialFolders: string[] }) {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [items, setItems] = useState<Item[]>(initialFolders.map(f => ({type: 'folder', name: f})));
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFolderContents = useCallback(async (folderName: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/images/${folderName}`);
      const images: ImageType[] = await res.json();
      setItems(images.map(img => ({type: 'image', data: img})));
      setCurrentPath(`/${folderName}`);
    } catch (error) {
      console.error("Failed to fetch images:", error);
      alert('이미지를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRootFolders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/folders');
      const folders: string[] = await res.json();
      setItems(folders.map(f => ({type: 'folder', name: f})));
      setCurrentPath('/');
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      alert('폴더를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDoubleClick = (item: Item) => {
    if (item.type === 'folder') {
      fetchFolderContents(item.name);
    } else {
      setSelectedImage(item.data);
    }
  };

  const handleGoBack = () => {
    if (currentPath !== '/') {
      fetchRootFolders();
    }
  };

  const handleCreateFolder = async () => {
    const folderName = prompt('새 폴더의 이름을 입력하세요:');
    if (folderName) {
      await fetch('/api/folders', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({folderName}),
      });
      fetchRootFolders(); // 목록 갱신
    }
  };

  const handleDelete = async (item: Item) => {
    const confirmDelete = confirm(`정말로 '${item.type === 'folder' ? item.name : item.data.filename}' 항목을 삭제하시겠습니까?`);
    if (confirmDelete) {
      if (item.type === 'folder') {
        await fetch(`/api/folders/${item.name}`, {method: 'DELETE'});
        fetchRootFolders();
      } else {
        // 👇 이 부분의 URL 경로를 수정합니다.
        await fetch(`/api/image/${item.data.id}`, {method: 'DELETE'});
        fetchFolderContents(item.data.folder);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || currentPath === '/') return;

    const folderName = currentPath.slice(1);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folderName);

    await fetch('/api/upload', {method: 'POST', body: formData});
    fetchFolderContents(folderName);
  };


  return (
      <div className="p-4 sm:p-8 font-sans">
        <div className="bg-white rounded-lg shadow-xl p-6 min-h-[70vh]">
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b">
            <div className="flex items-center gap-4">
              {currentPath !== '/' && (
                  <button onClick={handleGoBack} className="p-2 hover:bg-gray-200 rounded-full">
                    <BackIcon/>
                  </button>
              )}
              <h2 className="text-xl font-semibold text-gray-700">현재 경로: {currentPath}</h2>
            </div>
            {currentPath === '/' ? (
                <button onClick={handleCreateFolder}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">새 폴더</button>
            ) : (
                <div>
                  <label htmlFor="file-upload"
                         className="cursor-pointer px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    이미지 업로드
                  </label>
                  <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload}/>
                </div>
            )}
          </div>

          {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <p>로딩 중...</p>
              </div>
          ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 pt-6">
                {items.map((item, index) => (
                    <div key={index} className="relative group">
                      <div onDoubleClick={() => handleDoubleClick(item)} className="flex flex-col items-center p-2 text-center bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-all duration-200 aspect-square justify-between">
                        {item.type === 'folder' ? (
                            <>
                              <FolderIcon />
                              <span className="text-sm font-medium break-all w-full px-1 text-black">{item.name}</span>
                            </>
                        ) : (
                            <>
                              <div className="w-full flex-grow flex items-center justify-center overflow-hidden p-1">
                                <img src={item.data.filepath} alt={item.data.filename} className="max-w-full max-h-full object-contain rounded-md" />
                              </div>
                              <span className="mt-1 text-xs font-medium text-gray-700 w-full truncate px-1">
                        {item.data.filename}
                      </span>
                            </>
                        )}
                      </div>
                      <button onClick={() => handleDelete(item)}
                              className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        ✕
                      </button>
                    </div>
                ))}
              </div>
          )}
          {items.length === 0 && !isLoading && <p className="text-center pt-10 text-gray-500">항목이 없습니다.</p>}
        </div>

        {selectedImage && (
            <ImagePreviewModal image={selectedImage} onClose={() => setSelectedImage(null)}/>
        )}
      </div>
  );
}
