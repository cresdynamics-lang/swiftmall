import {
  OrderStatus,
  PaymentMethod,
  PaymentState,
  type Order,
  type OrderItem,
  type Product,
} from "@prisma/client";
import { prisma } from "@/lib/db";

export type OrderWithItems = Order & {
  items: OrderItem[];
  customer?: { id: string; name: string; email: string; phone: string } | null;
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  NEW: "New",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  PAY_ON_ORDER: "Pay now (M-Pesa)",
  DEPOSIT: "Pay a deposit",
  CASH_ON_DELIVERY: "Cash on delivery",
  PAY_ON_DELIVERY: "Pay on delivery",
};

export function paymentStateFromMethod(method: PaymentMethod): PaymentState {
  switch (method) {
    case PaymentMethod.PAY_ON_ORDER:
      return PaymentState.PAID;
    case PaymentMethod.DEPOSIT:
      return PaymentState.PART_PAID;
    case PaymentMethod.CASH_ON_DELIVERY:
    case PaymentMethod.PAY_ON_DELIVERY:
      return PaymentState.TO_COLLECT;
  }
}

export function paymentNote(order: Pick<Order, "paymentMethod" | "paymentState" | "depositPaid" | "total">) {
  if (order.paymentState === PaymentState.PAID) return "Paid in full";
  if (order.paymentState === PaymentState.PART_PAID) {
    return `Part-paid · ${order.depositPaid.toLocaleString("en-KE")} paid`;
  }
  if (order.paymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
    return `To collect: KES ${order.total.toLocaleString("en-KE")}`;
  }
  if (order.paymentMethod === PaymentMethod.PAY_ON_DELIVERY) {
    return "Pay by M-Pesa on arrival";
  }
  return "Unpaid";
}

export type OrderFilter = "all" | "new" | "to_dispatch" | "part_paid" | "to_collect";

export function orderWhere(filter: OrderFilter) {
  switch (filter) {
    case "new":
      return { status: OrderStatus.NEW };
    case "to_dispatch":
      return {
        status: { in: [OrderStatus.NEW, OrderStatus.CONFIRMED, OrderStatus.PACKED] },
      };
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

export async function listOrders(filter: OrderFilter = "all"): Promise<OrderWithItems[]> {
  return prisma.order.findMany({
    where: orderWhere(filter),
    include: { items: true, customer: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });
}

export async function getOrderStats() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const [ordersToday, paidToday, toDispatch, lowStock] = await Promise.all([
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
  ]);

  return {
    ordersToday,
    salesToday: paidToday._sum.total ?? 0,
    toDispatch,
    lowStock,
  };
}

export type PlaceOrderInput = {
  name: string;
  phone: string;
  email: string;
  county: string;
  town: string;
  address: string;
  carrier?: string;
  paymentMethod: PaymentMethod;
  shipping: number;
  depositShare: number;
  lines: { productId: string; qty: number; size?: string }[];
};

export async function placeOrder(input: PlaceOrderInput) {
  if (!input.lines.length) throw new Error("Cart is empty");

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

  const subtotal = resolved.reduce((s, r) => s + r.product.price * r.qty, 0);
  const shipping = input.shipping;
  const total = subtotal + shipping;
  const paymentState = paymentStateFromMethod(input.paymentMethod);
  const depositPaid =
    input.paymentMethod === PaymentMethod.DEPOSIT
      ? Math.round(total * input.depositShare)
      : input.paymentMethod === PaymentMethod.PAY_ON_ORDER
        ? total
        : 0;

  const email = input.email.trim().toLowerCase();
  const number = await nextOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { email },
      update: {
        name: input.name.trim(),
        phone: input.phone.trim(),
        county: input.county,
      },
      create: {
        name: input.name.trim(),
        phone: input.phone.trim(),
        email,
        county: input.county,
      },
    });

    const created = await tx.order.create({
      data: {
        number,
        customerId: customer.id,
        customerName: input.name.trim(),
        phone: input.phone.trim(),
        email,
        county: input.county,
        town: input.town.trim(),
        address: input.address.trim(),
        carrier: input.carrier?.trim() || null,
        paymentMethod: input.paymentMethod,
        paymentState,
        status: OrderStatus.NEW,
        subtotal,
        shipping,
        total,
        depositPaid,
        items: {
          create: resolved.map((r) => ({
            productId: r.product.id,
            name: r.product.name,
            image: r.product.images[0] ?? "/products/p01.jpg",
            unitPrice: r.product.price,
            qty: r.qty,
            size: r.size ?? null,
          })),
        },
      },
      include: { items: true },
    });

    for (const r of resolved) {
      await tx.product.update({
        where: { id: r.product.id },
        data: { stock: { decrement: r.qty } },
      });
    }

    return created;
  });

  return order;
}
