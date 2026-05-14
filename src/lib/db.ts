import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../prisma/generated/prisma/client'

const connectionString = `${process.env.POSTGRES_PRISMA_URL}`
const baseConnectionString = connectionString.split('?')[0]

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient, pool: Pool }

if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool({
    connectionString: baseConnectionString,
    ssl: { rejectUnauthorized: false }
  })
}

const adapter = new PrismaPg(globalForPrisma.pool)

export const db = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db