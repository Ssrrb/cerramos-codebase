import "server-only";

import { keys } from "./keys";

export type PaymentStatus =
  | "not_required"
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled";

export interface NormalizedPaymentEvent {
  eventType: string;
  externalEventId?: string;
  externalReference?: string;
  payload: unknown;
  status: PaymentStatus;
}

export interface PaymentProviderAdapter {
  authorize(order: object, payload: object): Promise<object>;
  cancel(paymentId: string): Promise<object>;
  createCheckoutSession(order: object): Promise<object>;
  normalizeStatus(input: unknown): PaymentStatus;
  parseWebhook(
    payload: unknown,
    headers: Headers
  ): Promise<NormalizedPaymentEvent>;
  refund(paymentId: string, amount?: number): Promise<object>;
  verifyWebhook(payload: string, headers: Headers): Promise<boolean>;
}

const config = keys();

export const pagopar = config.PAGOPAR_API_URL
  ? {
      provider: "pagopar_upay" as const,
      apiUrl: config.PAGOPAR_API_URL,
      commerceId: config.PAGOPAR_COMMERCE_ID,
      branchId: config.PAGOPAR_BRANCH_ID,
      publicKey: config.PAGOPAR_PUBLIC_KEY,
      privateKey: config.PAGOPAR_PRIVATE_KEY,
    }
  : undefined;

export const normalizeStatus = (input: unknown): PaymentStatus => {
  const value = String(input ?? "").toLowerCase();

  if (["approved", "paid", "success"].includes(value)) {
    return "paid";
  }

  if (["authorized"].includes(value)) {
    return "authorized";
  }

  if (["failed", "error", "rejected"].includes(value)) {
    return "failed";
  }

  if (["expired"].includes(value)) {
    return "expired";
  }

  if (["cancelled", "canceled"].includes(value)) {
    return "cancelled";
  }

  return "pending";
};

export const verifyWebhook = async (payload: string, headers: Headers) => {
  const secret = config.PAGOPAR_WEBHOOK_SECRET;

  if (!secret) {
    return false;
  }

  const providedSecret = headers.get("x-cerramos-webhook-secret");

  return Boolean(payload) && providedSecret === secret;
};

export const parseWebhook = async (
  payload: unknown,
  headers: Headers
): Promise<NormalizedPaymentEvent> => {
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  return {
    eventType: String(record.eventType ?? record.event ?? "payment.updated"),
    externalEventId: record.id ? String(record.id) : undefined,
    externalReference: record.reference ? String(record.reference) : undefined,
    status: normalizeStatus(record.status),
    payload: {
      ...record,
      signature: headers.get("x-cerramos-webhook-secret") ?? undefined,
    },
  };
};
