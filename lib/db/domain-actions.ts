import "server-only";
import type {Reflection, ReflectionSummary} from "@/lib/reflections";
import {db} from "./db-actions";

type ReflectionLike = Pick<ReflectionSummary, "entryId" | "views">;

export const domainActions = {
  reflectionView: {
    findUnique: async (args: Parameters<typeof db.findUnique<"reflectionView">>[1]) =>
      db.findUnique("reflectionView", args),
    findFirst: async (args?: Parameters<typeof db.findFirst<"reflectionView">>[1]) =>
      db.findFirst("reflectionView", args),
    findMany: async (args?: Parameters<typeof db.findMany<"reflectionView">>[1]) =>
      db.findMany("reflectionView", args),
    create: async (args: Parameters<typeof db.create<"reflectionView">>[1]) =>
      db.create("reflectionView", args),
    update: async (args: Parameters<typeof db.update<"reflectionView">>[1]) =>
      db.update("reflectionView", args),
    updateMany: async (args: Parameters<typeof db.updateMany<"reflectionView">>[1]) =>
      db.updateMany("reflectionView", args),
    upsert: async (args: Parameters<typeof db.upsert<"reflectionView">>[1]) =>
      db.upsert("reflectionView", args),
    delete: async (args: Parameters<typeof db.delete<"reflectionView">>[1]) =>
      db.delete("reflectionView", args),
    count: async (args?: Parameters<typeof db.count<"reflectionView">>[1]) =>
      db.count("reflectionView", args),
    incrementViews: async (entryId: string) =>
      db.upsert("reflectionView", {
        where: {entryId},
        create: {
          entryId,
          views: 1,
        },
        update: {
          views: {
            increment: 1,
          },
        },
      }),
    getViewsMap: async (entryIds: readonly string[]) => {
      if (!process.env.DATABASE_URL || entryIds.length === 0) {
        return {} as Record<string, number>;
      }

      try {
        const items = await db.findMany("reflectionView", {
          where: {
            entryId: {
              in: [...entryIds],
            },
          },
          select: {
            entryId: true,
            views: true,
          },
        });

        return Object.fromEntries(
          items.map((item: {entryId: string; views: number}) => [item.entryId, item.views]),
        ) as Record<string, number>;
      } catch (error) {
        console.error("Unable to load reflection views.", error);
        return {} as Record<string, number>;
      }
    },
    getViewCount: async (entryId: string) => {
      const view = await domainActions.reflectionView.findUnique({
        where: {entryId},
        select: {views: true},
      });

      return view?.views ?? 0;
    },
    recordView: async (entryId: string, visitorId: string) => {
      if (!process.env.DATABASE_URL) {
        return null;
      }

      try {
        return await db.transaction(async (transaction) => {
          const existingVisitor = await transaction.findUnique("reflectionViewVisitor", {
            where: {
              entryId_visitorId: {
                entryId,
                visitorId,
              },
            },
            select: {
              id: true,
            },
          });

          if (existingVisitor) {
            const currentView = await transaction.findUnique("reflectionView", {
              where: {entryId},
              select: {views: true},
            });

            return {
              entryId,
              isNew: false,
              views: currentView?.views ?? 0,
            };
          }

          await transaction.create("reflectionViewVisitor", {
            data: {
              entryId,
              visitorId,
            },
          });

          const view = await transaction.upsert("reflectionView", {
            where: {entryId},
            create: {
              entryId,
              views: 1,
            },
            update: {
              views: {
                increment: 1,
              },
            },
          });

          return {
            entryId,
            isNew: true,
            views: view.views,
          };
        });
      } catch (error) {
        console.error("Unable to record reflection view.", error);
        return null;
      }
    },
  },

  reflectionViewVisitor: {
    findUnique: async (args: Parameters<typeof db.findUnique<"reflectionViewVisitor">>[1]) =>
      db.findUnique("reflectionViewVisitor", args),
    findFirst: async (args?: Parameters<typeof db.findFirst<"reflectionViewVisitor">>[1]) =>
      db.findFirst("reflectionViewVisitor", args),
    findMany: async (args?: Parameters<typeof db.findMany<"reflectionViewVisitor">>[1]) =>
      db.findMany("reflectionViewVisitor", args),
    create: async (args: Parameters<typeof db.create<"reflectionViewVisitor">>[1]) =>
      db.create("reflectionViewVisitor", args),
    update: async (args: Parameters<typeof db.update<"reflectionViewVisitor">>[1]) =>
      db.update("reflectionViewVisitor", args),
    updateMany: async (args: Parameters<typeof db.updateMany<"reflectionViewVisitor">>[1]) =>
      db.updateMany("reflectionViewVisitor", args),
    upsert: async (args: Parameters<typeof db.upsert<"reflectionViewVisitor">>[1]) =>
      db.upsert("reflectionViewVisitor", args),
    delete: async (args: Parameters<typeof db.delete<"reflectionViewVisitor">>[1]) =>
      db.delete("reflectionViewVisitor", args),
    count: async (args?: Parameters<typeof db.count<"reflectionViewVisitor">>[1]) =>
      db.count("reflectionViewVisitor", args),
  },
};

function mergeReflectionViews<T extends ReflectionLike>(
  items: readonly T[],
  viewsMap: Record<string, number>,
) {
  return items.map((item) => ({
    ...item,
    views: viewsMap[item.entryId] ?? item.views,
  })) as T[];
}

export async function withReflectionViews<T extends ReflectionLike>(items: readonly T[]) {
  const viewsMap = await domainActions.reflectionView.getViewsMap(
    items.map((item) => item.entryId),
  );

  return mergeReflectionViews(items, viewsMap);
}

export async function withReflectionView<T extends Reflection>(item: T) {
  const [reflection] = await withReflectionViews([item]);
  return reflection ?? item;
}
