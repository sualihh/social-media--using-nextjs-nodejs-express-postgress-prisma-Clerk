// Import PrismaClient (database client)
import  { PrismaClient }  from "@prisma/client";

// Function that creates a new PrismaClient instance
const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Tell TypeScript that we are adding a global variable
// called prismaGlobal to globalThis
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
}   & typeof global;

// Use existing PrismaClient if it exists,
// otherwise create a new one
const prisma =
  globalThis.prismaGlobal ?? prismaClientSingleton();

// Export Prisma so it can be used in other files

export default prisma;

// In development, save PrismaClient on globalThis
// to prevent multiple database connections during hot reload
if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
