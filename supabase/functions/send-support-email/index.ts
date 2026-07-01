// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

// ─── Environment ─────────────────────────────────────────────────────────────
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "onboarding@resend.dev";
const ADMIN_EMAIL = Deno.env.get("SUPPORT_EMAIL") ?? "pmcareeros@gmail.com";
const APP_URL = Deno.env.get("APP_URL") ?? "https://careeros.app";
const RESEND_URL = "https://api.resend.com/emails";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getResponseTime(category: string): string {
  const lower = (category ?? "").toLowerCase();
  if (lower.includes("bug")) return "12–24 hours";
  if (lower.includes("feature")) return "24–48 hours";
  return "1–2 business days";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      dateStyle: "long", timeStyle: "short", timeZone: "UTC",
    }) + " UTC";
  } catch {
    return iso;
  }
}

function priorityColor(priority: string): string {
  switch ((priority ?? "").toLowerCase()) {
    case "high": return "#e11d48";
    case "critical": return "#7c3aed";
    case "low": return "#64748b";
    default: return "#d97706";
  }
}

function metaRow(label: string, value: unknown): string {
  if (!value) return "";
  return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #334155;font-size:12px;font-weight:600;color:#94a3b8;width:38%;">${label}</td>
    <td style="padding:8px 0;border-bottom:1px solid #334155;font-size:12px;color:#f1f5f9;">${String(value)}</td>
  </tr>`;
}

// ─── Core send helper (verbose logging) ──────────────────────────────────────
async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  label: string;
}): Promise<{ success: boolean; status: number; body: unknown; emailId?: string }> {
  const ts = new Date().toISOString();

  // Verbose pre-send log
  console.log(`[${ts}] ───────────────────────────────────`);
  console.log(`[${ts}] [${opts.label}] Sending email`);
  console.log(`[${ts}] [${opts.label}] Recipient: ${opts.to}`);
  console.log(`[${ts}] [${opts.label}] From: Career OS Support <${FROM_EMAIL}>`);
  console.log(`[${ts}] [${opts.label}] Subject: ${opts.subject}`);

  const payload: Record<string, unknown> = {
    from: `Career OS Support <${FROM_EMAIL}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  };
  if (opts.replyTo) payload.reply_to = opts.replyTo;

  let res: Response;
  try {
    res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (fetchErr) {
    const errMsg = (fetchErr as Error).message;
    console.error(`[${new Date().toISOString()}] [${opts.label}] Network error reaching Resend: ${errMsg}`);
    return { success: false, status: 0, body: { error: errMsg } };
  }

  const body = await res.json().catch(() => ({})) as any;
  const ts2 = new Date().toISOString();

  // Verbose post-send log regardless of success/failure
  console.log(`[${ts2}] [${opts.label}] HTTP Status: ${res.status}`);
  console.log(`[${ts2}] [${opts.label}] Response Body: ${JSON.stringify(body)}`);

  if (!res.ok) {
    console.error(`[${ts2}] [${opts.label}] FAILED — HTTP ${res.status}: ${body?.message ?? body?.error ?? "Unknown error"}`);
    return { success: false, status: res.status, body };
  }

  const emailId = body?.id ?? "n/a";
  console.log(`[${ts2}] [${opts.label}] SENT SUCCESSFULLY — Email ID: ${emailId}`);
  return { success: true, status: res.status, body, emailId };
}

// ─── User Confirmation Email ──────────────────────────────────────────────────
async function sendUserConfirmation(ticket: any) {
  const responseTime = getResponseTime(ticket.category);
  const submittedAt = formatDate(ticket.created_at);

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /><title>Support Request Received</title></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <tr>
          <td style="background:linear-gradient(135deg,#0284c7 0%,#0369a1 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
            <span style="color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">&#127919; Career OS</span>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:0.5px;text-transform:uppercase;font-weight:500;">Support Center</p>
          </td>
        </tr>

        <tr>
          <td style="background:#ffffff;padding:40px;">
            <div style="text-align:center;margin-bottom:24px;">
              <span style="display:inline-block;background:#dcfce7;color:#15803d;font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;padding:6px 16px;border-radius:99px;">&#10003; Request Received</span>
            </div>
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f172a;text-align:center;">We've got your message</h1>
            <p style="margin:0 0 32px;font-size:14px;color:#64748b;text-align:center;line-height:1.7;">Hi ${ticket.name},<br/>Thank you for reaching out. Our team will review your request and respond as soon as possible.</p>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px;">
              <p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#94a3b8;">Ticket Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:600;color:#64748b;width:40%;">Ticket Reference</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:800;color:#0284c7;">${ticket.ticket_code}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:600;color:#64748b;">Category</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;">${ticket.category}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:600;color:#64748b;">Subject</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;">${ticket.subject}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:600;color:#64748b;">Status</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;"><span style="background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px;text-transform:uppercase;">Open</span></td></tr>
                <tr><td style="padding:10px 0;font-size:13px;font-weight:600;color:#64748b;">Submitted</td><td style="padding:10px 0;font-size:13px;color:#0f172a;">${submittedAt}</td></tr>
              </table>
            </div>

            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#1e40af;">&#9203; Expected Response Time</p>
              <p style="margin:0;font-size:13px;color:#3b82f6;">${responseTime}</p>
            </div>

            <div style="text-align:center;margin-bottom:28px;">
              <a href="${APP_URL}" style="display:inline-block;background:linear-gradient(135deg,#0284c7,#0369a1);color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:10px;">Visit Career OS &#8594;</a>
            </div>

            <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">Need to add more information? Simply reply to this email and we'll continue the conversation.</p>
          </td>
        </tr>

        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#94a3b8;">Career OS &#183; PM Tracker</p>
            <p style="margin:0;font-size:11px;color:#cbd5e1;">Your data is kept private and never shared with third parties.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return sendEmail({
    to: ticket.email,
    subject: `\u2705 We've received your support request (${ticket.ticket_code})`,
    html,
    replyTo: ADMIN_EMAIL,
    label: "User Confirmation",
  });
}

// ─── Admin Notification Email ─────────────────────────────────────────────────
async function sendAdminNotification(ticket: any) {
  const meta = ticket.metadata ?? {};
  const submittedAt = formatDate(ticket.created_at);
  const pColor = priorityColor(ticket.priority);
  const isAuthenticated = ticket.user_id ? "Authenticated" : "Guest";

  // Build attachment section only if attachment_url is present
  const attachmentSection = ticket.attachment_url
    ? `<tr>
        <td style="background:#1e293b;border-left:1px solid #334155;border-right:1px solid #334155;padding:0 32px 24px;">
          <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748b;">Screenshot Attachment</p>
          <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:14px 18px;">
            <a href="${APP_URL}" style="color:#38bdf8;font-size:13px;word-break:break-all;">View via signed URL in Supabase: ${ticket.attachment_url}</a>
          </div>
        </td>
      </tr>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /><title>New Support Ticket</title></head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:32px 16px;">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">

        <tr>
          <td style="background:#1e293b;border:1px solid #334155;border-radius:16px 16px 0 0;padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td><span style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Career OS &#183; Admin Dashboard</span><h1 style="margin:6px 0 0;color:#f1f5f9;font-size:20px;font-weight:800;">&#128680; New Support Ticket</h1></td>
              <td align="right" style="vertical-align:top;"><span style="display:inline-block;background:${pColor};color:#ffffff;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:5px 12px;border-radius:6px;">${(ticket.priority ?? "NORMAL").toUpperCase()}</span></td>
            </tr></table>
          </td>
        </tr>

        <tr>
          <td style="background:#1e293b;border-left:1px solid #334155;border-right:1px solid #334155;padding:0 32px 24px;">
            <div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:20px;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748b;">Ticket Details</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${metaRow("Ticket Code", ticket.ticket_code)}
                ${metaRow("Submitted", submittedAt)}
                ${metaRow("Name", ticket.name)}
                ${metaRow("Email", ticket.email)}
                ${metaRow("Account Type", isAuthenticated)}
                ${metaRow("User ID", ticket.user_id ?? "Guest (not authenticated)")}
                ${metaRow("Category", ticket.category)}
                ${metaRow("Priority", ticket.priority)}
                ${metaRow("Subject", ticket.subject)}
              </table>
            </div>
          </td>
        </tr>

        <tr>
          <td style="background:#1e293b;border-left:1px solid #334155;border-right:1px solid #334155;padding:0 32px 24px;">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748b;">Message</p>
            <div style="background:#0f172a;border:1px solid #334155;border-left:3px solid #0284c7;border-radius:8px;padding:16px 20px;">
              <p style="margin:0;font-size:13px;color:#cbd5e1;line-height:1.7;white-space:pre-wrap;">${ticket.message ?? "(no message)"}</p>
            </div>
          </td>
        </tr>

        ${attachmentSection}

        <tr>
          <td style="background:#1e293b;border-left:1px solid #334155;border-right:1px solid #334155;padding:0 32px 24px;">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748b;">System Diagnostics</p>
            <div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${metaRow("Browser", meta.browser)}
                ${metaRow("OS", meta.os)}
                ${metaRow("Viewport", meta.viewport)}
                ${metaRow("Language", meta.language)}
                ${metaRow("Timezone", meta.timezone)}
                ${metaRow("Route", meta.route)}
                ${metaRow("Theme", meta.theme)}
                ${metaRow("App Version", meta.version ?? meta.appVersion)}
              </table>
            </div>
          </td>
        </tr>

        <tr>
          <td style="background:#1e293b;border:1px solid #334155;border-top:0;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#475569;">Career OS &#183; Internal Admin Notification &#183; ${submittedAt}</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `\uD83D\uDEA8 [${(ticket.priority ?? "NORMAL").toUpperCase()}] New Support Ticket (${ticket.ticket_code}) \u2014 ${ticket.category}`,
    html,
    label: "Admin Notification",
  });
}

// ─── Main handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const ts = new Date().toISOString();

  try {
    if (!RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY secret");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing Supabase environment variables");

    const body = await req.json();
    const { ticketId } = body;

    if (!ticketId) {
      return new Response(JSON.stringify({ error: "Missing ticketId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[${ts}] ═══════════════════════════════════════`);
    console.log(`[${ts}] Processing email notifications`);
    console.log(`[${ts}] Ticket ID: ${ticketId}`);
    console.log(`[${ts}] FROM_EMAIL configured: ${FROM_EMAIL}`);
    console.log(`[${ts}] ADMIN_EMAIL configured: ${ADMIN_EMAIL}`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: ticket, error: fetchError } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (fetchError || !ticket) {
      console.error(`[${ts}] Ticket fetch failed for ID ${ticketId}:`, fetchError?.message);
      throw new Error(fetchError?.message ?? "Ticket not found");
    }

    console.log(`[${ts}] Ticket Code: ${ticket.ticket_code}`);
    console.log(`[${ts}] User Email: ${ticket.email}`);
    console.log(`[${ts}] User ID: ${ticket.user_id ?? "null (guest)"}`);
    console.log(`[${ts}] Category: ${ticket.category}`);

    // Idempotency guard — prevent duplicate sends
    if (ticket.email_sent_at) {
      console.log(`[${ts}] Already emailed at ${ticket.email_sent_at} — skipping duplicate send.`);
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "already_sent" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send both emails independently — one failure never blocks the other
    console.log(`[${ts}] Starting parallel email send...`);
    const [userResult, adminResult] = await Promise.allSettled([
      sendUserConfirmation(ticket),
      sendAdminNotification(ticket),
    ]);

    const finishTs = new Date().toISOString();

    // Type-safe access to PromiseSettledResult values
    const isFulfilled = <T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> => result.status === "fulfilled";

    const userSuccess = isFulfilled(userResult) && userResult.value.success;
    const adminSuccess = isFulfilled(adminResult) && adminResult.value.success;

    const userEmailId = isFulfilled(userResult) ? (userResult.value.emailId ?? null) : null;
    const adminEmailId = isFulfilled(adminResult) ? (adminResult.value.emailId ?? null) : null;

    const userStatus = userSuccess ? "success" : "failed";
    const adminStatus = adminSuccess ? "success" : "failed";

    let userErrStr: string | null = null;
    if (!userSuccess) {
      if (userResult.status === "rejected") {
        userErrStr = String(userResult.reason);
      } else if (isFulfilled(userResult)) {
        userErrStr = (userResult.value.body as any)?.message ?? (userResult.value.body as any)?.error ?? JSON.stringify(userResult.value.body);
      }
    }

    let adminErrStr: string | null = null;
    if (!adminSuccess) {
      if (adminResult.status === "rejected") {
        adminErrStr = String(adminResult.reason);
      } else if (isFulfilled(adminResult)) {
        adminErrStr = (adminResult.value.body as any)?.message ?? (adminResult.value.body as any)?.error ?? JSON.stringify(adminResult.value.body);
      }
    }

    console.log(`[${finishTs}] ─── Detailed Delivery Tracking ───`);
    console.log(`[${finishTs}] Ticket ID: ${ticketId}`);
    console.log(`[${finishTs}] Ticket Code: ${ticket.ticket_code}`);
    console.log(`[${finishTs}] User Email: ${ticket.email}`);
    console.log(`[${finishTs}] User Email Status: ${userStatus}`);
    console.log(`[${finishTs}] User Resend ID: ${userEmailId}`);
    console.log(`[${finishTs}] User Resend Status/Response: ${isFulfilled(userResult) ? JSON.stringify(userResult.value.body) : "Rejected"}`);
    console.log(`[${finishTs}] User Error Detail: ${userErrStr}`);
    console.log(`[${finishTs}] ─────────────────────────────────────`);
    console.log(`[${finishTs}] Admin Email: ${ADMIN_EMAIL}`);
    console.log(`[${finishTs}] Admin Email Status: ${adminStatus}`);
    console.log(`[${finishTs}] Admin Resend ID: ${adminEmailId}`);
    console.log(`[${finishTs}] Admin Resend Status/Response: ${isFulfilled(adminResult) ? JSON.stringify(adminResult.value.body) : "Rejected"}`);
    console.log(`[${finishTs}] Admin Error Detail: ${adminErrStr}`);
    console.log(`[${finishTs}] ════════════════════════════════════════`);

    // Persist email delivery status in the database
    const updatePayload: Record<string, any> = {
      user_email_status: userStatus,
      admin_email_status: adminStatus,
      user_email_sent_at: userSuccess ? finishTs : null,
      admin_email_sent_at: adminSuccess ? finishTs : null,
      user_email_error: userErrStr,
      admin_email_error: adminErrStr,
      user_resend_id: userEmailId,
      admin_resend_id: adminEmailId,
      updated_at: finishTs,
    };

    if (userSuccess || adminSuccess) {
      updatePayload.email_sent_at = finishTs;
    }

    const { error: dbUpdateErr } = await supabase
      .from("support_tickets")
      .update(updatePayload)
      .eq("id", ticketId);

    if (dbUpdateErr) {
      console.error(`[${finishTs}] Failed to update support_tickets delivery status:`, dbUpdateErr.message);
    } else {
      console.log(`[${finishTs}] Successfully persisted email delivery tracking in DB.`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        userEmailSent: userSuccess,
        adminEmailSent: adminSuccess,
        ticketCode: ticket.ticket_code,
        userEmailId,
        adminEmailId,
        userEmailError: userErrStr,
        adminEmailError: adminErrStr,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Fatal error:`, (error as Error).message);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
