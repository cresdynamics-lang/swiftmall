import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  isReportPeriod,
  rangeForPeriod,
  REPORT_PERIODS,
} from "@/lib/report-periods";

export const dynamic = "force-dynamic";

function csvEscape(value: string | number | null | undefined) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(request: Request) {
  const jar = await cookies();
  if (jar.get("swiftmall_admin")?.value !== "1") {
    return NextResponse.redirect(new URL("/management/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const periodParam = searchParams.get("period");
  if (!isReportPeriod(periodParam)) {
    return NextResponse.json(
      { error: "Use period=month|quarter|6m|year" },
      { status: 400 },
    );
  }

  const { from, to, label } = rangeForPeriod(periodParam);
  const meta = REPORT_PERIODS.find((p) => p.id === periodParam)!;

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: from, lte: to } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const totalSales = orders.reduce((s, o) => s + o.total, 0);
  const byCounty = new Map<string, { count: number; sales: number }>();
  for (const o of orders) {
    const row = byCounty.get(o.county) ?? { count: 0, sales: 0 };
    row.count += 1;
    row.sales += o.total;
    byCounty.set(o.county, row);
  }

  const lines: string[] = [];
  lines.push(`Swiftmall sales report — ${label}`);
  lines.push(`From,${from.toISOString()}`);
  lines.push(`To,${to.toISOString()}`);
  lines.push(`Orders,${orders.length}`);
  lines.push(`Total sales (KES),${totalSales}`);
  lines.push("");
  lines.push("Orders by county");
  lines.push("County,Orders,Sales (KES)");
  for (const [county, row] of [...byCounty.entries()].sort(
    (a, b) => b[1].count - a[1].count,
  )) {
    lines.push([csvEscape(county), row.count, row.sales].join(","));
  }
  lines.push("");
  lines.push("Order detail");
  lines.push(
    "Order #,Date,Customer,Phone,Email,County,Town,Status,Payment,Subtotal,Shipping,Total,Items",
  );
  for (const o of orders) {
    const items = o.items
      .map((i) => `${i.qty}× ${i.name}${i.size ? ` (${i.size})` : ""}`)
      .join("; ");
    lines.push(
      [
        o.number,
        o.createdAt.toISOString(),
        csvEscape(o.customerName),
        csvEscape(o.phone),
        csvEscape(o.email),
        csvEscape(o.county),
        csvEscape(o.town),
        o.status,
        o.paymentMethod,
        o.subtotal,
        o.shipping,
        o.total,
        csvEscape(items),
      ].join(","),
    );
  }

  const body = lines.join("\n");
  const stamp = to.toISOString().slice(0, 10);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="swiftmall-report-${meta.filename}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
