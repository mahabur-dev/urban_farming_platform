import app from './app';
import config from './app/config';
import prisma from './app/db/prisma';

const PORT = config.port;

const main = async () => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error: any) {
    console.error('❌ Error starting server:', error.message || error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

main();
