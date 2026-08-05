// supabase/functions/create-preference/index.ts
//
// Cria uma preferência de pagamento no Mercado Pago para um pedido específico.
// Chamada pelo front-end (Solicitar.jsx) depois que o pedido é criado no banco.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Não autenticado." }, 401);
    }

    // Cliente autenticado como o usuário que fez a requisição
    // (valida o token e já respeita as regras de RLS do banco)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_ANON_KEY"),
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return json({ error: "Não autenticado." }, 401);
    }

    const { pedidoId, titulo } = await req.json();

    if (!pedidoId) {
      return json({ error: "Dados incompletos." }, 400);
    }

    // Confirma que o pedido existe, pertence a este usuário e ainda não foi pago
    const { data: pedido, error: pedidoError } = await supabase
      .from("pedidos")
      .select("id, user_id, preco, payment_status")
      .eq("id", pedidoId)
      .single();

    if (pedidoError || !pedido || pedido.user_id !== user.id) {
      return json({ error: "Pedido não encontrado." }, 404);
    }

    if (pedido.payment_status === "pago") {
      return json({ error: "Este pedido já foi pago." }, 409);
    }

    if (!pedido.preco) {
      return json({ error: "Pedido sem valor definido." }, 400);
    }

    const siteUrl = Deno.env.get("SITE_URL");
    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN");

    const preferenceBody = {
      items: [
        {
          title: titulo || "Serviço Elo Hype",
          quantity: 1,
          unit_price: Number(pedido.preco),
          currency_id: "BRL"
        }
      ],
      external_reference: pedidoId,
      back_urls: {
        success: `${siteUrl}/pagamento/retorno?status=approved`,
        pending: `${siteUrl}/pagamento/retorno?status=pending`,
        failure: `${siteUrl}/pagamento/retorno?status=failure`
      },
      auto_return: "approved",
      notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercado-pago-webhook`
    };

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mpAccessToken}`
      },
      body: JSON.stringify(preferenceBody)
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Erro Mercado Pago:", mpData);
      return json({ error: "Não foi possível criar o pagamento." }, 502);
    }

    // Salva o id da preferência no pedido, pra rastrear depois
    await supabase
      .from("pedidos")
      .update({ mp_preference_id: mpData.id })
      .eq("id", pedidoId);

    return json({ init_point: mpData.init_point });

  } catch (err) {
    console.error(err);
    return json({ error: "Erro interno." }, 500);
  }
});

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
