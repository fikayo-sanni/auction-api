import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// const USER_ID = '916315ac-dcb9-47c4-82e5-6a58c6c0d3a5';

async function main() {
  console.log(`Start seeding ...`);

  // await prisma.user.create({
  //   data: {
  //     id: USER_ID,
  //   },
  // });

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
