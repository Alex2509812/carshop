-- =====================================================
-- CarShop: Datos de ejemplo para probar recomendaciones
-- Ejecutar en: Supabase → SQL Editor → New query
--
-- Inserta 8 pedidos de ejemplo (status='approved')
-- con productos reales del catálogo para que el
-- algoritmo de reglas de asociación funcione ya.
--
-- Idempotente: puede re-ejecutarse sin duplicar.
-- =====================================================

do $$
declare
  v_user uuid;
  v_pedido_id uuid;
  v_total numeric;
begin
  -- ── Buscar un usuario existente ─────────────────────────────
  select id into v_user from auth.users order by created_at asc limit 1;

  if v_user is null then
    raise notice 'No hay usuarios en auth.users — registra un usuario primero';
    return;
  end if;

  -- ── Limpiar seeds anteriores ────────────────────────────────
  delete from pedido_items
    where pedido_id in (select id from pedidos where preference_id like 'seed-%');
  delete from pedidos where preference_id like 'seed-%';

  -- ── Pedido 1: Shampoo + Cera + Guante ───────────────────────
  select coalesce(sum(p.precio), 0) into v_total
    from productos p where p.id in (2, 11, 13);
  insert into pedidos (user_id, total, status, preference_id)
    values (v_user, v_total, 'approved', 'seed-1')
    returning id into v_pedido_id;
  insert into pedido_items (pedido_id, producto_id, cantidad, precio)
    select v_pedido_id, p.id, 1, p.precio from productos p where p.id in (2, 11, 13);

  -- ── Pedido 2: Shampoo + Cera + Desengrasante ────────────────
  select coalesce(sum(p.precio), 0) into v_total
    from productos p where p.id in (2, 11, 14);
  insert into pedidos (user_id, total, status, preference_id)
    values (v_user, v_total, 'approved', 'seed-2')
    returning id into v_pedido_id;
  insert into pedido_items (pedido_id, producto_id, cantidad, precio)
    select v_pedido_id, p.id, 1, p.precio from productos p where p.id in (2, 11, 14);

  -- ── Pedido 3: Shampoo + Guante + Polish ─────────────────────
  select coalesce(sum(p.precio), 0) into v_total
    from productos p where p.id in (2, 13, 15);
  insert into pedidos (user_id, total, status, preference_id)
    values (v_user, v_total, 'approved', 'seed-3')
    returning id into v_pedido_id;
  insert into pedido_items (pedido_id, producto_id, cantidad, precio)
    select v_pedido_id, p.id, 1, p.precio from productos p where p.id in (2, 13, 15);

  -- ── Pedido 4: LEDs + Alerón + Applicator ────────────────────
  select coalesce(sum(p.precio), 0) into v_total
    from productos p where p.id in (12, 1, 19);
  insert into pedidos (user_id, total, status, preference_id)
    values (v_user, v_total, 'approved', 'seed-4')
    returning id into v_pedido_id;
  insert into pedido_items (pedido_id, producto_id, cantidad, precio)
    select v_pedido_id, p.id, 1, p.precio from productos p where p.id in (12, 1, 19);

  -- ── Pedido 5: LEDs + Alerón + Reset ─────────────────────────
  select coalesce(sum(p.precio), 0) into v_total
    from productos p where p.id in (12, 1, 16);
  insert into pedidos (user_id, total, status, preference_id)
    values (v_user, v_total, 'approved', 'seed-5')
    returning id into v_pedido_id;
  insert into pedido_items (pedido_id, producto_id, cantidad, precio)
    select v_pedido_id, p.id, 1, p.precio from productos p where p.id in (12, 1, 16);

  -- ── Pedido 6: LEDs + Applicator + Toalla ────────────────────
  select coalesce(sum(p.precio), 0) into v_total
    from productos p where p.id in (12, 19, 18);
  insert into pedidos (user_id, total, status, preference_id)
    values (v_user, v_total, 'approved', 'seed-6')
    returning id into v_pedido_id;
  insert into pedido_items (pedido_id, producto_id, cantidad, precio)
    select v_pedido_id, p.id, 1, p.precio from productos p where p.id in (12, 19, 18);

  -- ── Pedido 7: IronX + Polish + Reset + Cera ─────────────────
  select coalesce(sum(p.precio), 0) into v_total
    from productos p where p.id in (17, 15, 16, 11);
  insert into pedidos (user_id, total, status, preference_id)
    values (v_user, v_total, 'approved', 'seed-7')
    returning id into v_pedido_id;
  insert into pedido_items (pedido_id, producto_id, cantidad, precio)
    select v_pedido_id, p.id, 1, p.precio from productos p where p.id in (17, 15, 16, 11);

  -- ── Pedido 8: Shampoo + Cera + Toalla ───────────────────────
  select coalesce(sum(p.precio), 0) into v_total
    from productos p where p.id in (2, 11, 18);
  insert into pedidos (user_id, total, status, preference_id)
    values (v_user, v_total, 'approved', 'seed-8')
    returning id into v_pedido_id;
  insert into pedido_items (pedido_id, producto_id, cantidad, precio)
    select v_pedido_id, p.id, 1, p.precio from productos p where p.id in (2, 11, 18);

  raise notice 'Se insertaron 8 pedidos de ejemplo (seed) para el usuario %', v_user;
end $$;
