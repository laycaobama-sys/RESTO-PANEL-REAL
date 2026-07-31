// Resend email service — lazy-initialized client.
// All keys are read from process.env; never hardcoded.

import { Resend } from "resend";

let resendInstance: Resend | null = null;

/** Lazy Resend client. Throws if RESEND_API_KEY is not configured. */
export function getResend(): Resend {
  if (!resendInstance) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY not configured");
    resendInstance = new Resend(key);
  }
  return resendInstance;
}

const FROM_DOMAIN = process.env.RESEND_FROM_DOMAIN ?? "restopanel.com";
const FROM_ADDRESS = `RestoPanel <noreply@${FROM_DOMAIN}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export interface EmailResult {
  id: string;
}

/** Wraps resend.emails.send so we return a consistent id shape. */
async function send(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<EmailResult> {
  const resend = getResend();
  const result = await resend.emails.send({
    from: FROM_ADDRESS,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
  if (result.error) {
    throw new Error(`Resend error: ${result.error.message}`);
  }
  return { id: result.data?.id ?? "" };
}

/** Reservation confirmation payload (kept as a typed struct — no `any`). */
export interface ReservationDetails {
  restaurantName: string;
  guestName: string;
  date: string;
  time: string;
  partySize: number;
  zone?: string;
}

/** Sends the welcome email after a tenant signs up. */
export async function sendWelcomeEmail(
  to: string,
  restaurantName: string,
): Promise<EmailResult> {
  return send({
    to,
    subject: `Bienvenido a RestoPanel, ${restaurantName}!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">¡Bienvenido a RestoPanel!</h1>
        <p>Hola,</p>
        <p>Tu restaurante <strong>${escapeHtml(restaurantName)}</strong> está listo para operar.</p>
        <p>Ya puedes acceder a tu panel y empezar a configurar tu negocio.</p>
        <a href="${APP_URL}" style="background: #10B981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 16px 0;">Ir al panel</a>
        <p>Si necesitas ayuda, responde a este email.</p>
        <p>— El equipo de RestoPanel</p>
      </div>
    `,
  });
}

/** Sends a password-reset email with a one-time reset link. */
export async function sendPasswordReset(
  to: string,
  resetLink: string,
): Promise<EmailResult> {
  return send({
    to,
    subject: "RestoPanel — Restablece tu contraseña",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Restablecer contraseña</h1>
        <p>Has solicitado restablecer tu contraseña en RestoPanel.</p>
        <p>Haz clic en el botón para elegir una nueva contraseña. Este enlace expirará en 60 minutos.</p>
        <a href="${resetLink}" style="background: #10B981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 16px 0;">Restablecer contraseña</a>
        <p style="color: #6b7280; font-size: 14px;">Si no solicitaste este correo, puedes ignorarlo.</p>
        <p>— El equipo de RestoPanel</p>
      </div>
    `,
  });
}

/** Sends an invoice email with a link to the hosted invoice URL. */
export async function sendInvoiceEmail(
  to: string,
  invoiceUrl: string,
): Promise<EmailResult> {
  return send({
    to,
    subject: "RestoPanel — Tu factura",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Tu factura está disponible</h1>
        <p>Puedes ver y descargar tu factura en el siguiente enlace:</p>
        <a href="${invoiceUrl}" style="background: #10B981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 16px 0;">Ver factura</a>
        <p>Gracias por confiar en RestoPanel.</p>
        <p>— El equipo de RestoPanel</p>
      </div>
    `,
  });
}

/** Sends a reservation confirmation email with full reservation details. */
export async function sendReservationConfirmation(
  to: string,
  details: ReservationDetails,
): Promise<EmailResult> {
  const zoneLine = details.zone
    ? `<li><strong>Zona:</strong> ${escapeHtml(details.zone)}</li>`
    : "";
  return send({
    to,
    subject: `Reserva confirmada — ${details.restaurantName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">¡Reserva confirmada!</h1>
        <p>Hola <strong>${escapeHtml(details.guestName)}</strong>,</p>
        <p>Tu reserva en <strong>${escapeHtml(details.restaurantName)}</strong> está confirmada.</p>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Fecha:</strong> ${escapeHtml(details.date)}</li>
          <li><strong>Hora:</strong> ${escapeHtml(details.time)}</li>
          <li><strong>Comensales:</strong> ${details.partySize}</li>
          ${zoneLine}
        </ul>
        <p>Te esperamos.</p>
        <p>— El equipo de ${escapeHtml(details.restaurantName)}</p>
      </div>
    `,
  });
}

/** Escapes HTML special characters to prevent injection in interpolated values. */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
