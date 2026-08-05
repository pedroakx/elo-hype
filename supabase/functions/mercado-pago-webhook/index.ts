// supabase/functions/mercado-pago-webhook/index.ts
//
// Recebe as notificações do Mercado Pago sempre que o status de um
// pagamento muda, confirma os detalhes direto na API do Mercado Pago
// (nunca confia cegamente no que a notificação diz) e atualiza o pedido.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const url = new URL(req.url);

    // O Mercado Pago manda o id do pagamento por query string
    // (formato novo: ?data.id=123&type=payment) ou no corpo da requisição.
    let paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");

    if (!paymentId && req.method === "POST") {
      try {
        const body = await req.json();
        paymentId = body?.data?.id || body?.id;
      } catch {
        // corpo vazio ou inválido, tudo bem, seguimos sem paymentId
      }
    }

    if (!paymentId) {
      return new Response("ok", { status: 200 });
    }

    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN");

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${mpAccessToken}` } }
    );

    if (!paymentResponse.ok) {
      // Pode ser uma notificação de teste ou de outro tipo de evento — ignora.
      return new Response("ok", { status: 200 });
    }

    const payment = await paymentResponse.json();
    const pedidoId = payment.external_reference;

    if (!pedidoId) {
      return new Response("ok", { status: 200 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    let novoStatus = null;
    if (payment.status === "approved") novoStatus = "pago";
    if (payment.status === "rejected" || payment.status === "cancelled") novoStatus = "cancelado";

    if (novoStatus) {
      await supabaseAdmin
        .from("pedidos")
        .update({
          payment_status: novoStatus,
          mp_payment_id: String(payment.id)
        })
        .eq("id", pedidoId);
    }

    return new Response("ok", { status: 200 });

  } catch (err) {
    console.error(err);
    // Sempre responde 200 pro Mercado Pago não ficar reenviando em loop
    return new Response("ok", { status: 200 });
  }
});
