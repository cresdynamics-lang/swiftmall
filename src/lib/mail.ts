import { business } from "@/lib/business";
import { prisma } from "@/lib/db";

type SendArgs = {
  to: string;
  subject: string;
  text: string;
  html: string;
  template: string;
  orderId?: string;
};

/**
 * Send via Resend from a @swiftmall.co.ke address with Reply-To gmail.
 * Never use From: @gmail.com through a third-party (auth would fail).
 */
export async function sendMail(args: SendArgs): Promise<{ ok: boolean; error?: string }> {
  const to = args.to.trim();
  if (!to || !to.includes("@")) {
    return { ok: false, error: "no_recipient" };
  }

  const row = await prisma.outboundEmail.create({
    data: {
      orderId: args.orderId,
      to,
      subject: args.subject,
      template: args.template,
      status: "queued",
    },
  });

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) {
    await prisma.outboundEmail.update({
      where: { id: row.id },
      data: { status: "skipped", error: "RESEND_API_KEY not set" },
    });
    return { ok: false, error: "no_provider" };
  }

  const from = `${business.mail.fromName} <${business.mail.fromAddress}>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: business.mail.replyTo,
        subject: args.subject,
        text: args.text,
        html: args.html,
      }),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      await prisma.outboundEmail.update({
        where: { id: row.id },
        data: { status: "failed", error: `${res.status} ${err}`.slice(0, 500) },
      });
      await prisma.adminAlert.create({
        data: {
          type: "email_failed",
          title: `Email failed: ${args.template}`,
          body: args.subject,
          href: args.orderId ? `/management/orders?id=${args.orderId}` : "/management/orders",
          orderId: args.orderId,
        },
      });
      return { ok: false, error: err };
    }
    await prisma.outboundEmail.update({
      where: { id: row.id },
      data: { status: "sent", sentAt: new Date(), error: "" },
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "send_error";
    await prisma.outboundEmail.update({
      where: { id: row.id },
      data: { status: "failed", error: msg.slice(0, 500) },
    });
    return { ok: false, error: msg };
  }
}

export async function sendOwnerAlert(subject: string, text: string, orderId?: string) {
  const recipients = [
    ...(process.env.ORDER_NOTIFY_EMAIL
      ? [process.env.ORDER_NOTIFY_EMAIL.trim()]
      : [...business.mail.alertRecipients]),
  ];
  const html = `<pre style="font-family:system-ui,sans-serif;white-space:pre-wrap;background:#111;color:#f5f5f5;padding:16px;">${escapeHtml(text)}</pre>`;
  await Promise.allSettled(
    recipients.map((to) =>
      sendMail({ to, subject, text, html, template: "owner_alert", orderId }),
    ),
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
