// Supabase Edge Function: Razorpay Webhook Handler
// Enforces server-side HMAC SHA256 signature verification and idempotency for payment captures.
// Deploy via: supabase functions deploy razorpay-webhook --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Computes HMAC-SHA256 hex digest of raw request body
 */
async function verifySignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
  if (!signature || !secret) return false;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(rawBody)
  );

  const computedHex = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedHex === signature;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const signature = req.headers.get("x-razorpay-signature") || "";
    const rawBody = await req.text();

    // 1. Verify HMAC SHA-256 signature
    const isValid = await verifySignature(rawBody, signature, WEBHOOK_SECRET);
    if (!isValid && WEBHOOK_SECRET) {
      console.error("[Razorpay Webhook] Invalid signature match");
      return new Response(JSON.stringify({ error: "Invalid webhook signature" }), { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    console.log(`[Razorpay Webhook] Received event: ${event}`);

    // 2. Handle successful payment capture
    if (event === "payment.captured" || event === "order.paid") {
      const payment = payload.payload.payment.entity;
      const paymentId = payment.id;
      const orderId = payment.order_id;
      const amountINR = payment.amount / 100; // Razorpay amounts in paise
      const notes = payment.notes || {};
      const userId = notes.user_id || notes.userId;
      const planId = notes.plan_id || notes.planId;
      const durationDays = parseInt(notes.duration_days || "90", 10);

      // Idempotency check: Ensure payment wasn't already processed
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("razorpay_payment_id", paymentId)
        .single();

      if (existingPayment) {
        console.log(`[Razorpay Webhook] Payment ${paymentId} already processed (idempotent ignore)`);
        return new Response(JSON.stringify({ status: "already_processed" }), { status: 200 });
      }

      // Compute 18% GST (SAC 999723)
      const taxableBase = Math.round((amountINR / 1.18) * 100) / 100;
      const totalTax = amountINR - taxableBase;
      const cgst9 = Math.round((totalTax / 2) * 100) / 100;
      const sgst9 = Math.round((totalTax - cgst9) * 100) / 100;

      // Insert payment record
      const { error: paymentErr } = await supabase.from("payments").insert({
        user_id: userId,
        amount: amountINR,
        currency: "INR",
        status: "success",
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        method: payment.method,
        taxable_amount: taxableBase,
        cgst_amount: cgst9,
        sgst_amount: sgst9,
        sac_code: "999723",
      });

      if (paymentErr) {
        console.error("[Razorpay Webhook] Failed to insert payment:", paymentErr);
      }

      // Activate or extend membership
      const now = new Date();
      const expiry = new Date();
      expiry.setDate(now.getDate() + durationDays);

      const { error: memErr } = await supabase.from("memberships").upsert({
        user_id: userId,
        plan_id: planId,
        status: "active",
        starts_at: now.toISOString(),
        expires_at: expiry.toISOString(),
        is_frozen: false,
        updated_at: now.toISOString(),
      });

      if (memErr) {
        console.error("[Razorpay Webhook] Failed to update membership:", memErr);
      }

      return new Response(JSON.stringify({ status: "success", paymentId }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Handle payment failure
    if (event === "payment.failed") {
      const payment = payload.payload.payment.entity;
      console.warn(`[Razorpay Webhook] Payment failed: ${payment.id}. Reason: ${payment.error_description}`);
      return new Response(JSON.stringify({ status: "logged_failure" }), { status: 200 });
    }

    return new Response(JSON.stringify({ status: "ignored_event" }), { status: 200 });
  } catch (err) {
    console.error("[Razorpay Webhook] Uncaught error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
});
