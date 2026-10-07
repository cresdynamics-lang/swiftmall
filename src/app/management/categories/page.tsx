import { moveCategory, requireAdmin, saveCategory } from "@/app/management/actions";
import { prisma } from "@/lib/db";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
      products: { select: { gender: true } },
    },
  });

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold">Categories</h1>
      <p className="mt-1 text-sm text-ink/55">
        Homepage department order follows this list. Changes save to Postgres.
      </p>

      <section className="mt-6 max-w-2xl rounded-xl bg-white p-5 ring-1 ring-ink/8">
        <ul className="divide-y divide-ink/8">
          {categories.map((c, index) => {
            const mens = c.products.filter((p) => p.gender === "MENS").length;
            const womens = c.products.filter((p) => p.gender === "WOMENS").length;
            return (
              <li key={c.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-ink/50">
                      {c._count.products} products · /{c.slug}
                    </p>
                    {c.slug === "fashion" ? (
                      <p className="mt-1 text-xs text-ink/45">
                        ↳ Men&apos;s Fashion ({mens}) · ↳ Women&apos;s Fashion ({womens})
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <form action={moveCategory}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button
                        type="submit"
                        disabled={index === 0}
                        className="rounded border border-ink/15 px-2 py-1 text-xs font-semibold disabled:opacity-30"
                      >
                        Up
                      </button>
                    </form>
                    <form action={moveCategory}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button
                        type="submit"
                        disabled={index === categories.length - 1}
                        className="rounded border border-ink/15 px-2 py-1 text-xs font-semibold disabled:opacity-30"
                      >
                        Down
                      </button>
                    </form>
                  </div>
                </div>
                <form action={saveCategory} className="mt-3 grid gap-2 sm:grid-cols-2">
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="slug" value={c.slug} />
                  <input
                    name="name"
                    defaultValue={c.name}
                    className="rounded-md border border-ink/15 px-3 py-2 text-sm"
                    placeholder="Name"
                  />
                  <input
                    name="shortName"
                    defaultValue={c.shortName}
                    className="rounded-md border border-ink/15 px-3 py-2 text-sm"
                    placeholder="Short name"
                  />
                  <input
                    name="blurb"
                    defaultValue={c.blurb}
                    className="sm:col-span-2 rounded-md border border-ink/15 px-3 py-2 text-sm"
                    placeholder="Blurb"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white sm:col-span-2 sm:w-fit"
                  >
                    Save category
                  </button>
                </form>
              </li>
            );
          })}
        </ul>

        <form action={saveCategory} className="mt-6 space-y-2 border-t border-ink/10 pt-4">
          <h2 className="font-display text-base font-bold">+ Add category</h2>
          <input
            name="name"
            required
            placeholder="Name"
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
          <input
            name="shortName"
            placeholder="Short name"
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
          <input
            name="blurb"
            placeholder="Blurb"
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-ink"
          >
            Add category
          </button>
        </form>
      </section>
    </main>
  );
}
