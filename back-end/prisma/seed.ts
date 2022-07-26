import { prisma } from "../src/database.js";

async function main() {
  await prisma.recommendation.upsert({
    where: { name: "海市蜃樓" },
    update: {},
    create: {
      name: "海市蜃樓",
      youtubeLink: "https://www.youtube.com/watch?v=qyhu1xEauQo",
    },
  });
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
