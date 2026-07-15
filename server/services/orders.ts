import "server-only";
import { prisma } from "@/lib/db";
import { ORDER_TRANSITIONS, type OrderStatus, type Role } from "@/lib/enums";
import { recomputeCarrierAggregates } from "./carrier-aggregates";

export async function getCarrierByUserId(userId: string) {
  return prisma.carrier.findUnique({ where: { userId } });
}

export async function getCarrierOrders(carrierId: string, statuses: OrderStatus[]) {
  return prisma.order.findMany({
    where: { carrierId, status: { in: statuses } },
    orderBy: { createdAt: "desc" },
    include: { carrier: { select: { slug: true } } },
  });
}

export type TransitionResult = { ok: true } | { ok: false; error: string };

/** Змінює статус замовлення з валідацією дозволених переходів + побічні ефекти. */
export async function transitionOrder(params: {
  orderId: string;
  toStatus: OrderStatus;
  byRole: Role;
  carrierId?: string; // якщо задано — перевіряємо власність
  note?: string;
}): Promise<TransitionResult> {
  const { orderId, toStatus, byRole, carrierId, note } = params;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false, error: "Order not found." };
  if (carrierId && order.carrierId !== carrierId) return { ok: false, error: "Not your order." };

  const from = order.status as OrderStatus;
  const allowed = ORDER_TRANSITIONS[from] ?? [];
  if (!allowed.includes(toStatus)) {
    return { ok: false, error: `Cannot move from ${from} to ${toStatus}.` };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: toStatus,
      confirmedAt: toStatus === "BOOKING_CONFIRMED" ? new Date() : order.confirmedAt,
      completedAt: toStatus === "COMPLETED" ? new Date() : order.completedAt,
      cancelledAt: toStatus === "CANCELLED" ? new Date() : order.cancelledAt,
      cancelledByRole: toStatus === "CANCELLED" ? byRole : order.cancelledByRole,
      statusHistory: { create: { fromStatus: from, toStatus, changedByRole: byRole, note } },
    },
  });

  // Побічні ефекти
  if (toStatus === "COMPLETED") {
    // Запит на відгук — лог листа (реальна відправка через SMTP окремо).
    await prisma.emailLog.create({
      data: { to: order.contactEmail, template: "review_request", orderId: order.id, status: "queued" },
    });
    await recomputeCarrierAggregates(order.carrierId);
  }
  if (toStatus === "CANCELLED") {
    await recomputeCarrierAggregates(order.carrierId);
  }

  return { ok: true };
}
