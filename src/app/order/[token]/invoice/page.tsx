import { notFound } from "next/navigation";
import {
  business,
  formatOrderNumber,
  shopAddressDisplay,
  shopHoursDisplay,
} from "@/lib/business";
import { formatKes } from "@/lib/format";
import {
  getOrderByToken,
  paymentMethodLabel,
  paymentNote,
} from "@/lib/orders";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Order invoice",
};

type PageProps = { params: Promise<{ token: string }> };

export default async function OrderInvoicePage({ params }: PageProps) {
  const { token } = await params;
  const order = await getOrderByToken(token);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl bg-white px-4 py-10 text-ink print:py-4">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 pb-4">
        <div>
          <p className="font-display text-2xl font-bold">{business.brandName}</p>
          <p className="text-sm text-ink/60">{shopAddressDisplay()}</p>
          <p className="text-sm text-ink/60">
            {business.phone} · {business.email}
          </p>
          <p className="text-sm text-ink/60">Hours: {shopHoursDisplay()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-ink/45">Order invoice</p>
          <p className="font-display text-xl font-bold">
            {formatOrderNumber(order.number)}
          </p>
          <p className="text-xs text-ink/50">
            {new Date(order.createdAt).toLocaleString("en-KE", {
              timeZone: "Africa/Nairobi",
            })}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <p>
          <strong>Customer:</strong> {order.customerName}
          <br />
          {order.phone}
          {order.email ? (
            <>
              <br />
              {order.email}
            </>
          ) : null}
        </p>
        <p>
          <strong>{order.fulfilment === "PICKUP" ? "Pickup" : "Delivery"}:</strong>
          <br />
          {order.address || shopAddressDisplay()}
        </p>
      </div>

      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink/15 text-xs uppercase text-ink/50">
            <th className="py-2">Item</th>
            <th className="py-2">Qty</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i) => (
            <tr key={i.id} className="border-b border-ink/8">
              <td className="py-2">
                {i.name}
                {i.size ? ` (${i.size})` : ""}
                {i.sku ? (
                  <span className="block text-xs text-ink/45">SKU {i.sku}</span>
                ) : null}
              </td>
              <td className="py-2">{i.qty}</td>
              <td className="py-2 text-right">{formatKes(i.unitPrice * i.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatKes(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>{order.fulfilment === "PICKUP" ? "Pickup" : "Delivery"}</span>
          <span>{formatKes(order.shipping)}</span>
        </div>
        <div className="flex justify-between font-display text-base font-bold">
          <span>Total</span>
          <span>{formatKes(order.total)}</span>
        </div>
        <p className="pt-2 text-ink/65">
          Payment: {paymentMethodLabel[order.paymentMethod]} · {paymentNote(order)}
        </p>
      </div>

      <p className="mt-6 text-sm print:hidden">
        <a href="#" className="font-semibold underline" id="print-invoice">
          Print
        </a>
      </p>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.getElementById('print-invoice')?.addEventListener('click',function(e){e.preventDefault();window.print();});`,
        }}
      />
    </div>
  );
}
