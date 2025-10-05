import FileManager from "@/components/FileManager";
import fs from 'fs/promises';
import path from 'path';

async function getInitialFolders(): Promise<string[]> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  try {

    await fs.mkdir(uploadDir, { recursive: true });

    const allFiles = await fs.readdir(uploadDir, { withFileTypes: true });
    const folders = allFiles
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    return folders;
  } catch (error) {
    console.error("Failed to read initial folders:", error);
    return [];
  }
}

export default async function HomePage() {
  const initialFolders = await getInitialFolders();

  return (
      <main className="bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto py-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">파일 탐색기</h1>
          <FileManager initialFolders={initialFolders} />
        </div>
      </main>
  );
}
