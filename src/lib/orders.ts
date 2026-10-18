import { randomBytes } from "crypto";
import {
  DeliveryZone,
  FulfilmentType,
  OrderStatus,
  PaymentMethod,
  PaymentState,
  type Order,
  type OrderItem,
  type Product,
} from "@prisma/client";
import {
  business,
  deliveryFeeForZone,
  formatOrderNumber,
  zoneForCounty,
  type DeliveryZoneId,
} from "@/lib/business";
import { prisma } from "@/lib/db";
import { parseKenyaPhone } from "@/lib/store-config";

export type OrderWithItems = Order & {
  items: OrderItem[];
  customer?: { id: string; name: string; email: string | null; phone: string } | null;
  events?: { id: string; status: OrderStatus; note: string; actor: string; createdAt: Date }[];
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  NEW: "Order received — awaiting confirmation",
  CONFIRMED: "Confirmed",
  PACKED: "Preparing",
  DISPATCHED: "Dispatched",
  READY_FOR_PICKUP: "Ready for pickup",
  DELIVERED: "Delivered",
  COLLECTED: "Collected",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
  CUSTOMER_UNREACHABLE: "Customer unreachable",
  DELIVERY_REFUSED: "Delivery refused",
};

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  PAY_ON_ORDER: "Pay now (M-Pesa)",
  DEPOSIT: "Pay a deposit",
  CASH_ON_DELIVERY: "Pay on delivery",
  PAY_ON_DELIVERY: "Pay on delivery",
  PAY_AT_PICKUP: "Pay when you collect",
};

export const paymentStateLabel: Record<PaymentState, string> = {
  PAID: "Paid",
  PART_PAID: "Deposit confirmed (balance due)",
  TO_COLLECT: "Pay on delivery or at pickup (unpaid)",
  UNPAID: "Unpaid",
  AWAITING_MPESA: "Awaiting M-Pesa confirmation",
};

/** Never mark paid from customer claim — only claims / to-collect / awaiting. */
export function paymentStateFromMethod(method: PaymentMethod): PaymentState {
  switch (method) {
    case PaymentMethod.PAY_ON_ORDER:
    case PaymentMethod.DEPOSIT:
      return PaymentState.AWAITING_MPESA;
    case PaymentMethod.CASH_ON_DELIVERY:
    case PaymentMethod.PAY_ON_DELIVERY:
    case PaymentMethod.PAY_AT_PICKUP:
      return PaymentState.TO_COLLECT;
  }
}

export function paymentNote(
  order: Pick<
    Order,
    | "paymentMethod"
    | "paymentState"
    | "depositPaid"
    | "total"
    | "amountExpected"
    | "amountConfirmed"
  >,
) {
  if (order.paymentState === PaymentState.PAID) return "Paid in full";
  if (order.paymentState === PaymentState.PART_PAID) {
    const balance = order.total - order.amountConfirmed;
    return `Deposit confirmed · balance due KES ${balance.toLocaleString("en-KE")}`;
  }
  if (order.paymentState === PaymentState.AWAITING_MPESA) {
    return `Awaiting M-Pesa confirmation · expected KES ${order.amountExpected.toLocaleString("en-KE")}`;
  }
  if (
    order.paymentMethod === PaymentMethod.CASH_ON_DELIVERY ||
    order.paymentMethod === PaymentMethod.PAY_ON_DELIVERY ||
    order.paymentMethod === PaymentMethod.PAY_AT_PICKUP
  ) {
    return `To collect: KES ${order.total.toLocaleString("en-KE")}`;
  }
  return "Unpaid";
}

export type OrderFilter =
  | "all"
  | "new"
  | "awaiting_call"
  | "awaiting_mpesa"
  | "to_dispatch"
  | "pickup_ready"
  | "part_paid"
  | "to_collect";

export function orderWhere(filter: OrderFilter) {
  switch (filter) {
    case "new":
    case "awaiting_call":
      return { status: OrderStatus.NEW };
    case "awaiting_mpesa":
      return { paymentState: PaymentState.AWAITING_MPESA };
    case "to_dispatch":
      return {
        fulfilment: FulfilmentType.DELIVERY,
        status: { in: [OrderStatus.NEW, OrderStatus.CONFIRMED, OrderStatus.PACKED] },
      };
    case "pickup_ready":
      return { status: OrderStatus.READY_FOR_PICKUP };
    case "part_paid":
      return { paymentState: PaymentState.PART_PAID };
    case "to_collect":
      return { paymentState: PaymentState.TO_COLLECT };
    default:
      return {};
  }
}

export async function nextOrderNumber(): Promise<number> {
  const counter = await prisma.orderCounter.upsert({
    where: { id: "default" },
    update: { next: { increment: 1 } },
    create: { id: "default", next: 1043 },
  });
  return counter.next - 1;
}

export function newTrackingToken(): string {
  return randomBytes(24).toString("hex");
}

export async function listOrders(filter: OrderFilter = "all"): Promise<OrderWithItems[]> {
  return prisma.order.findMany({
    where: orderWhere(filter),
    include: { items: true, customer: true, events: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true, events: { orderBy: { createdAt: "asc" } } },
  });
}

export async function getOrderByToken(token: string): Promise<OrderWithItems | null> {
  if (!token || token.length < 32) return null;
  return prisma.order.findUnique({
    where: { trackingToken: token },
    include: { items: true, events: { orderBy: { createdAt: "asc" } } },
  });
}

export async function getOrderByNumberAndPhone(
  number: number,
  phone: string,
): Promise<OrderWithItems | null> {
  const normalised = parseKenyaPhone(phone);
  if (!Number.isFinite(number) || !normalised) return null;
  return prisma.order.findFirst({
    where: { number, phone: normalised },
    include: { items: true, events: { orderBy: { createdAt: "asc" } } },
  });
}

export async function getOrderByNumberAndEmail(
  number: number,
  email: string,
): Promise<OrderWithItems | null> {
  if (!Number.isFinite(number) || !email) return null;
  return prisma.order.findFirst({
    where: { number, email: email.trim().toLowerCase() },
    include: { items: true, customer: true },
  });
}

export async function getOrderStats() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const [ordersToday, paidToday, toDispatch, lowStock, awaitingMpesa, newOrders] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: start } } }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: start },
          paymentState: { in: [PaymentState.PAID, PaymentState.PART_PAID] },
        },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: {
          status: { in: [OrderStatus.NEW, OrderStatus.CONFIRMED, OrderStatus.PACKED] },
        },
      }),
      prisma.product.count({ where: { stock: { lte: 3 } } }),
      prisma.order.count({ where: { paymentState: PaymentState.AWAITING_MPESA } }),
      prisma.order.count({ where: { status: OrderStatus.NEW } }),
    ]);

  return {
    ordersToday,
    salesToday: paidToday._sum.total ?? 0,
    toDispatch,
    lowStock,
    awaitingMpesa,
    newOrders,
  };
}

export type PlaceOrderInput = {
  name: string;
  phone: string;
  email?: string;
  privacyConsent: boolean;
  fulfilment: "delivery" | "pickup";
  county?: string;
  town?: string;
  address?: string;
  streetBuilding?: string;
  landmark?: string;
  deliveryNotes?: string;
  collectorName?: string;
  paymentMethod: PaymentMethod;
  mpesaCode?: string;
  idempotencyKey?: string;
  lines: { productId: string; qty: number; size?: string }[];
};

function mapZone(id: DeliveryZoneId): DeliveryZone {
  return id === "nairobi" ? DeliveryZone.NAIROBI : DeliveryZone.UPCOUNTRY;
}

export async function placeOrder(input: PlaceOrderInput) {
  if (!input.lines.length) throw new Error("Cart is empty");
  if (!input.privacyConsent) throw new Error("Please accept the privacy notice to continue");

  const phone = parseKenyaPhone(input.phone);
  if (!phone) throw new Error("Enter a valid Kenyan phone (07xx, 01xx or +254)");

  if (input.idempotencyKey) {
    const existing = await prisma.order.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      include: { items: true },
    });
    if (existing) return existing;
  }

  const fulfilment =
    input.fulfilment === "pickup" ? FulfilmentType.PICKUP : FulfilmentType.DELIVERY;

  if (fulfilment === FulfilmentType.PICKUP && !business.pickup.enabled) {
    throw new Error("Pickup is not available right now");
  }

  let zoneId: DeliveryZoneId | null = null;
  let shipping = 0;
  if (fulfilment === FulfilmentType.DELIVERY) {
    if (!input.county?.trim() || !input.town?.trim()) {
      throw new Error("County and town / area are required for delivery");
    }
    const addr =
      input.streetBuilding?.trim() ||
      input.address?.trim() ||
      "";
    if (!addr) throw new Error("Street and building are required for delivery");
    zoneId = zoneForCounty(input.county);
    shipping = deliveryFeeForZone(zoneId);
  } else {
    shipping = business.pickup.feeKes;
    if (!input.collectorName?.trim()) {
      throw new Error("Name of the person collecting is required for pickup");
    }
  }

  // Pickup: no deposit
  if (
    fulfilment === FulfilmentType.PICKUP &&
    input.paymentMethod === PaymentMethod.DEPOSIT
  ) {
    throw new Error("Deposit is not available for pickup orders");
  }
  if (
    fulfilment === FulfilmentType.PICKUP &&
    (input.paymentMethod === PaymentMethod.CASH_ON_DELIVERY ||
      input.paymentMethod === PaymentMethod.PAY_ON_DELIVERY)
  ) {
    throw new Error("Use pay when you collect for pickup orders");
  }

  const products = await prisma.product.findMany({
    where: { id: { in: input.lines.map((l) => l.productId) }, live: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const resolved: { product: Product; qty: number; size?: string }[] = [];
  for (const line of input.lines) {
    const product = byId.get(line.productId);
    if (!product) throw new Error("A product in your cart is no longer available");
    if (product.stock < line.qty) {
      throw new Error(`${product.name} only has ${product.stock} in stock`);
    }
    if (product.sizes.length > 0) {
      if (!line.size || !product.sizes.includes(line.size)) {
        throw new Error(`Please choose a valid size for ${product.name}`);
      }
    }
    resolved.push({ product, qty: line.qty, size: line.size });
  }

  const { parseSizePrices, priceForProduct } = await import("@/lib/product-price");
  const priced = resolved.map((r) => ({
    ...r,
    unitPrice: priceForProduct(
      {
        price: r.product.price,
        sizes: r.product.sizes,
        sizePrices: parseSizePrices(r.product.sizePrices),
      },
      r.size,
    ),
  }));
  const subtotal = priced.reduce((s, r) => s + r.unitPrice * r.qty, 0);
  const total = subtotal + shipping;
  const paymentState = paymentStateFromMethod(input.paymentMethod);
  const amountExpected =
    input.paymentMethod === PaymentMethod.DEPOSIT
      ? Math.round(total * business.payments.depositShare)
      : input.paymentMethod === PaymentMethod.PAY_ON_ORDER
        ? total
        : 0;
  const depositPaid = 0; // only after admin confirms

  const email = (input.email ?? "").trim().toLowerCase();
  const number = await nextOrderNumber();
  const trackingToken = newTrackingToken();

  const streetBuilding =
    input.streetBuilding?.trim() || input.address?.trim() || "";
  const addressParts = [
    streetBuilding,
    input.landmark?.trim(),
    input.town?.trim(),
    input.county?.trim(),
  ].filter(Boolean);

  const order = await prisma.$transaction(async (tx) => {
    let customerId: string | null = null;
    if (email) {
      const customer = await tx.customer.upsert({
        where: { email },
        update: {
          name: input.name.trim(),
          phone,
          county: input.county?.trim() || undefined,
        },
        create: {
          name: input.name.trim(),
          phone,
          email,
          county: input.county?.trim() || undefined,
        },
      });
      customerId = customer.id;
    }

    const created = await tx.order.create({
      data: {
        number,
        trackingToken,
        customerId,
        customerName: input.name.trim(),
        phone,
        email,
        privacyConsent: true,
        fulfilment,
        zone: zoneId ? mapZone(zoneId) : null,
        county: input.county?.trim() || "",
        town: input.town?.trim() || "",
        address:
          fulfilment === FulfilmentType.PICKUP
            ? business.shop.addressLine
            : addressParts.join(", "),
        streetBuilding,
        landmark: input.landmark?.trim() || "",
        deliveryNotes: input.deliveryNotes?.trim() || "",
        collectorName: input.collectorName?.trim() || "",
        paymentMethod: input.paymentMethod,
        paymentState,
        status: OrderStatus.NEW,
        subtotal,
        shipping,
        total,
        depositPaid,
        amountExpected,
        amountConfirmed: 0,
        mpesaCode: (input.mpesaCode ?? "").trim().toUpperCase(),
        idempotencyKey: input.idempotencyKey || null,
        items: {
          create: priced.map((r) => ({
            productId: r.product.id,
            name: r.product.name,
            sku: r.product.sku ?? "",
            image: r.product.images[0] || "/brand/favicon-32.png",
            unitPrice: r.unitPrice,
            qty: r.qty,
            size: r.size ?? null,
          })),
        },
        events: {
          create: {
            status: OrderStatus.NEW,
            note: "Order placed",
            actor: "customer",
            notify: true,
          },
        },
      },
      include: { items: true, events: true },
    });

    for (const r of resolved) {
      await tx.product.update({
        where: { id: r.product.id },
        data: { stock: { decrement: r.qty } },
      });
    }

    await tx.adminAlert.create({
      data: {
        type: "new_order",
        title: `New order ${formatOrderNumber(number)}`,
        body: `${input.name.trim()} · KES ${total.toLocaleString("en-KE")}`,
        href: `/management/orders?id=${created.id}`,
        orderId: created.id,
      },
    });

    if (created.mpesaCode) {
      await tx.adminAlert.create({
        data: {
          type: "mpesa_code",
          title: `M-Pesa code on ${formatOrderNumber(number)}`,
          body: created.mpesaCode,
          href: `/management/orders?id=${created.id}`,
          orderId: created.id,
        },
      });
    }

    return created;
  });

  return order;
}

export { formatOrderNumber };
