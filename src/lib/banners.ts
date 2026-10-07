import { prisma } from "@/lib/db";

export async function listActiveBanners() {
  return prisma.homepageBanner.findMany({
    where: { active: true },
    include: {
      category: true,
      tile1Product: { include: { category: true } },
      tile2Product: { include: { category: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function listAllBanners() {
  return prisma.homepageBanner.findMany({
    include: {
      category: true,
      tile1Product: true,
      tile2Product: true,
    },
    orderBy: { sortOrder: "asc" },
  });
}
