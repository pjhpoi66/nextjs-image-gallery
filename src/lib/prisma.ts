// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// 개발 환경에서 불필요한 Prisma Client 생성을 막기 위함
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;