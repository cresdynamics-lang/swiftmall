import { publishBanner, requireAdmin } from "@/app/management/actions";
import { BannerHeroImageField } from "@/components/admin/BannerHeroImageField";
import { listAllBanners } from "@/lib/banners";
import { prisma } from "@/lib/db";

export default async function AdminBannersPage() {
  await requireAdmin();
  const [banners, categories, products] = await Promise.all([
    listAllBanners(),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { live: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const primary = banners[0];

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold">Homepage banners</h1>
      <p className="mt-1 text-sm text-ink/55">
        Hero headline, compressed background image, department and offer tiles. The image is
        applied to that department&apos;s homepage carousel slide.
      </p>

      <form action={publishBanner} className="mt-6 max-w-lg space-y-4 rounded-xl bg-white p-5 ring-1 ring-ink/8">
        {primary?.id ? <input type="hidden" name="id" value={primary.id} /> : null}
        <h2 className="font-display text-lg font-bold">Homepage banner</h2>
        <BannerHeroImageField currentImage={primary?.backgroundImage} />
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Hero headline</span>
          <input
            name="headline"
            required
            defaultValue={primary?.headline ?? "Glow up."}
            className="w-full rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Subheadline</span>
          <input
            name="subheadline"
            defaultValue={primary?.subheadline ?? "Pay on delivery."}
            className="w-full rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Copy</span>
          <textarea
            name="copy"
            rows={3}
            defaultValue={
              primary?.copy ??
              "Skincare, hair care and wellness, delivered countrywide for a flat KES 250."
            }
            className="w-full rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">CTA label</span>
          <input
            name="ctaLabel"
            defaultValue={primary?.ctaLabel ?? "Shop Health & Beauty →"}
            className="w-full rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Department</span>
          <select
            name="categoryId"
            defaultValue={primary?.categoryId ?? categories[0]?.id}
            className="w-full rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Tile 1 product</span>
          <select
            name="tile1ProductId"
            defaultValue={primary?.tile1ProductId ?? products[0]?.id}
            className="w-full rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Tile 2 product</span>
          <select
            name="tile2ProductId"
            defaultValue={primary?.tile2ProductId ?? products[1]?.id}
            className="w-full rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-ink hover:bg-brand-dark"
        >
          Publish banner
        </button>
      </form>

      {banners.length > 1 ? (
        <p className="mt-4 text-sm text-ink/50">
          {banners.length} banners in the database. The first active banner is edited above; extras
          still rotate on the home page.
        </p>
      ) : null}
    </main>
  );
}
