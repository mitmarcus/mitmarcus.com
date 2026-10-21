import { PrismaNeon } from '@prisma/adapter-neon';

import { PrismaClient } from '../generated/prisma/client';

const globalForPrisma = globalThis as unknown as {
	prisma?: PrismaClient;
};

const adapter = new PrismaNeon({
	connectionString: process.env.DATABASE_URL,
});

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}

export default prisma;
