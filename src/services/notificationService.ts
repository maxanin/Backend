type NotifyChannel = "console" | "webhook";

export type NotificationPayload = {
  type: "quotation_created" | "invoice_created";
  tenantId: string;
  customerRef?: number;
  number?: number;
  date?: string;
  amount?: number;
  description?: string;
  extra?: Record<string, unknown>;
};

export async function notify(channel: NotifyChannel, payload: NotificationPayload) {
  switch (channel) {
    case "webhook":
      try {
        const url = process.env.NOTIFY_WEBHOOK_URL;
        if (!url) return;
        await (await import("axios")).default.post(url, payload, { timeout: 5000 });
      } catch {}
      break;
    default:
      // fallback
      // eslint-disable-next-line no-console
      console.log("[Notify]", JSON.stringify(payload));
  }
}
