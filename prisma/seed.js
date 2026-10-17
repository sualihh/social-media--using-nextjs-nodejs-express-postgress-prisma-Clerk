const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();
const firstNames = [
  "Avery", "Jordan", "Riley", "Morgan", "Casey", "Taylor", "Quinn", "Cameron",
  "Parker", "Reese", "Rowan", "Skyler", "Jamie", "Finley", "Dakota",
];
const lastNames = [
  "Bennett", "Brooks", "Campbell", "Carter", "Collins", "Cooper", "Diaz",
  "Ellis", "Foster", "Gray",
];

async function main() {
  const users = Array.from({ length: 150 }, (_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[Math.floor(index / firstNames.length)];
    const handle = `hulux.demo.${String(index + 1).padStart(3, "0")}`;

    return {
      email: `${handle}@example.com`,
      username: handle,
      clerkId: `hulux-demo-${String(index + 1).padStart(3, "0")}`,
      name: `${firstName} ${lastName}`,
      bio: "Finding good conversations and little moments worth sharing.",
      location: ["New York", "London", "Toronto", "Nairobi", "Copenhagen"][index % 5],
      image: `https://i.pravatar.cc/160?img=${(index % 70) + 1}`,
    };
  });

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        username: user.username,
        clerkId: user.clerkId,
        name: user.name,
        bio: user.bio,
        location: user.location,
        image: user.image,
      },
      create: user,
    });
  }

  console.info(`Seeded ${users.length} Hulux demo users.`);
}

main()
  .catch((error) => {
    console.error("Failed to seed Hulux demo users:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
