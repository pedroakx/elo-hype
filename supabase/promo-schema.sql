-- Rode este script no SQL Editor do Supabase DEPOIS do pricing-v2-schema.sql
--
-- Aplica a promoção de lançamento (50% OFF) também no preço que é
-- realmente cobrado — sem isso, o desconto só aparecia na tela pro
-- cliente, mas ele seria cobrado o valor cheio no Mercado Pago.
--
-- IMPORTANTE: o valor abaixo (0.50 = 50%) precisa ser sempre o MESMO
-- valor de DESCONTO_LANCAMENTO em src/data/pricing.js. Se mudar um,
-- muda o outro também, senão o preço mostrado diverge do cobrado.

create or replace function public.handle_pedido_insert()
returns trigger as $$
declare
  preco_calculado numeric;
  desconto_lancamento numeric := 0.50; -- precisa bater com DESCONTO_LANCAMENTO no front-end
begin
  preco_calculado := public.calcular_preco_pedido(
    NEW.servico, NEW.elo_atual, NEW.elo_desejado, NEW.quantidade, NEW.extras, NEW.lp_atual
  );

  if preco_calculado is null then
    raise exception 'Não foi possível calcular o preço deste pedido. Confira os dados enviados.';
  end if;

  NEW.preco := round(preco_calculado * (1 - desconto_lancamento), 2);
  NEW.status := 'pendente';
  NEW.payment_status := 'pendente';
  NEW.booster_id := null;
  NEW.mp_preference_id := null;
  NEW.mp_payment_id := null;
  NEW.comissao_percentual := null;
  NEW.comissao_valor := null;

  return NEW;
end;
$$ language plpgsql security definer;

-- (a trigger já existente continua apontando pra essa função,
-- não precisa recriá-la)
