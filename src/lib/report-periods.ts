export type ReportPeriod = "month" | "quarter" | "6m" | "year";

export const REPORT_PERIODS: {
  id: ReportPeriod;
  label: string;
  filename: string;
}[] = [
  { id: "month", label: "One month", filename: "month" },
  { id: "quarter", label: "1st quarter", filename: "q1" },
  { id: "6m", label: "6 months", filename: "6-months" },
  { id: "year", label: "One year", filename: "year" },
];

/** Inclusive date range for a report period (local calendar). */
export function rangeForPeriod(period: ReportPeriod, now = new Date()): {
  from: Date;
  to: Date;
  label: string;
} {
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  if (period === "month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    from.setHours(0, 0, 0, 0);
    return { from, to, label: "One month (this calendar month)" };
  }

  if (period === "quarter") {
    // 1st quarter of the current year: Jan 1 – Mar 31
    const from = new Date(now.getFullYear(), 0, 1);
    from.setHours(0, 0, 0, 0);
    const end = new Date(now.getFullYear(), 2, 31, 23, 59, 59, 999);
    return {
      from,
      to: end < to ? end : to,
      label: `1st quarter ${now.getFullYear()}`,
    };
  }

  if (period === "6m") {
    const from = new Date(now);
    from.setMonth(from.getMonth() - 6);
    from.setHours(0, 0, 0, 0);
    return { from, to, label: "Last 6 months" };
  }

  // year
  const from = new Date(now);
  from.setFullYear(from.getFullYear() - 1);
  from.setHours(0, 0, 0, 0);
  return { from, to, label: "Last 12 months" };
}

export function isReportPeriod(v: string | null | undefined): v is ReportPeriod {
  return v === "month" || v === "quarter" || v === "6m" || v === "year";
}
