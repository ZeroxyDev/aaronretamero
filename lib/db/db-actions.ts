/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import {PrismaPg} from "@prisma/adapter-pg";
import {Prisma, PrismaClient} from "@prisma/client";

const globalForPrisma = globalThis as {
  __prismaClient__?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  const adapter = new PrismaPg({connectionString});

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function getPrismaClient() {
  if (globalForPrisma.__prismaClient__) {
    return globalForPrisma.__prismaClient__;
  }

  const client = createPrismaClient();

  if (!client) {
    return null;
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.__prismaClient__ = client;
  }

  return client;
}

type DelegateKey = Exclude<keyof PrismaClient, `$${string}` | symbol>;
type ClientLike = PrismaClient | Prisma.TransactionClient;

function createDbActions(client: ClientLike) {
  return {
    create: async <T extends DelegateKey>(
      model: T,
      args: PrismaClient[T] extends {create: (...input: any[]) => any}
        ? Parameters<PrismaClient[T]["create"]>[0]
        : never,
    ) => {
      return (client[model] as any).create(args);
    },

    findFirst: async <T extends DelegateKey>(
      model: T,
      args?: PrismaClient[T] extends {findFirst: (...input: any[]) => any}
        ? Parameters<PrismaClient[T]["findFirst"]>[0]
        : never,
    ) => {
      return (client[model] as any).findFirst(args);
    },

    findUnique: async <T extends DelegateKey>(
      model: T,
      args: PrismaClient[T] extends {findUnique: (...input: any[]) => any}
        ? Parameters<PrismaClient[T]["findUnique"]>[0]
        : never,
    ) => {
      return (client[model] as any).findUnique(args);
    },

    findMany: async <T extends DelegateKey>(
      model: T,
      args?: PrismaClient[T] extends {findMany: (...input: any[]) => any}
        ? Parameters<PrismaClient[T]["findMany"]>[0]
        : never,
    ) => {
      return (client[model] as any).findMany(args);
    },

    update: async <T extends DelegateKey>(
      model: T,
      args: PrismaClient[T] extends {update: (...input: any[]) => any}
        ? Parameters<PrismaClient[T]["update"]>[0]
        : never,
    ) => {
      return (client[model] as any).update(args);
    },

    updateMany: async <T extends DelegateKey>(
      model: T,
      args: PrismaClient[T] extends {updateMany: (...input: any[]) => any}
        ? Parameters<PrismaClient[T]["updateMany"]>[0]
        : never,
    ) => {
      return (client[model] as any).updateMany(args);
    },

    upsert: async <T extends DelegateKey>(
      model: T,
      args: PrismaClient[T] extends {upsert: (...input: any[]) => any}
        ? Parameters<PrismaClient[T]["upsert"]>[0]
        : never,
    ) => {
      return (client[model] as any).upsert(args);
    },

    delete: async <T extends DelegateKey>(
      model: T,
      args: PrismaClient[T] extends {delete: (...input: any[]) => any}
        ? Parameters<PrismaClient[T]["delete"]>[0]
        : never,
    ) => {
      return (client[model] as any).delete(args);
    },

    deleteMany: async <T extends DelegateKey>(
      model: T,
      args?: PrismaClient[T] extends {deleteMany: (...input: any[]) => any}
        ? Parameters<PrismaClient[T]["deleteMany"]>[0]
        : never,
    ) => {
      return (client[model] as any).deleteMany(args);
    },

    count: async <T extends DelegateKey>(
      model: T,
      args?: PrismaClient[T] extends {count: (...input: any[]) => any}
        ? Parameters<PrismaClient[T]["count"]>[0]
        : never,
    ) => {
      return (client[model] as any).count(args);
    },
  };
}

export type DbActions = ReturnType<typeof createDbActions>;
export const JSON_NULL = Prisma.JsonNull;
export type DbInputJsonValue = Prisma.InputJsonValue;

function assertPrismaClient() {
  const prisma = getPrismaClient();

  if (!prisma) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return prisma;
}

export const db = {
  create: async <T extends DelegateKey>(
    model: T,
    args: Parameters<ReturnType<typeof createDbActions>["create"]>[1],
  ) => createDbActions(assertPrismaClient()).create(model, args as never),
  findFirst: async <T extends DelegateKey>(
    model: T,
    args?: Parameters<ReturnType<typeof createDbActions>["findFirst"]>[1],
  ) => createDbActions(assertPrismaClient()).findFirst(model, args as never),
  findUnique: async <T extends DelegateKey>(
    model: T,
    args: Parameters<ReturnType<typeof createDbActions>["findUnique"]>[1],
  ) => createDbActions(assertPrismaClient()).findUnique(model, args as never),
  findMany: async <T extends DelegateKey>(
    model: T,
    args?: Parameters<ReturnType<typeof createDbActions>["findMany"]>[1],
  ) => createDbActions(assertPrismaClient()).findMany(model, args as never),
  update: async <T extends DelegateKey>(
    model: T,
    args: Parameters<ReturnType<typeof createDbActions>["update"]>[1],
  ) => createDbActions(assertPrismaClient()).update(model, args as never),
  updateMany: async <T extends DelegateKey>(
    model: T,
    args: Parameters<ReturnType<typeof createDbActions>["updateMany"]>[1],
  ) => createDbActions(assertPrismaClient()).updateMany(model, args as never),
  upsert: async <T extends DelegateKey>(
    model: T,
    args: Parameters<ReturnType<typeof createDbActions>["upsert"]>[1],
  ) => createDbActions(assertPrismaClient()).upsert(model, args as never),
  delete: async <T extends DelegateKey>(
    model: T,
    args: Parameters<ReturnType<typeof createDbActions>["delete"]>[1],
  ) => createDbActions(assertPrismaClient()).delete(model, args as never),
  deleteMany: async <T extends DelegateKey>(
    model: T,
    args?: Parameters<ReturnType<typeof createDbActions>["deleteMany"]>[1],
  ) => createDbActions(assertPrismaClient()).deleteMany(model, args as never),
  count: async <T extends DelegateKey>(
    model: T,
    args?: Parameters<ReturnType<typeof createDbActions>["count"]>[1],
  ) => createDbActions(assertPrismaClient()).count(model, args as never),
  disconnect: async () => {
    const prisma = getPrismaClient();
    return prisma?.$disconnect();
  },
  transaction: async <T>(callback: (transaction: DbActions) => Promise<T>) =>
    assertPrismaClient().$transaction((transaction) => callback(createDbActions(transaction))),
};
