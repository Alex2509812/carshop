-- =====================================================
-- CarShop: Historial de compras (pedidos)
-- Ejecutar en: Supabase → SQL Editor → New query
-- =====================================================

-- Tabla de pedidos
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  fecha timestamptz not null default now(),
  total numeric not null,
  status text not null default 'pending', -- pending | approved | failed
  preference_id text -- id de Mercado Pago (evita duplicados)
);

-- Ítems de cada pedido
create table if not exists pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  producto_id int not null references productos(id),
  cantidad int not null,
  precio numeric not null -- precio al momento de comprar
);

create index if not exists idx_pedido_items_pedido on pedido_items(pedido_id);
create index if not exists idx_pedidos_status on pedidos(status);
create index if not exists idx_pedidos_user on pedidos(user_id);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
alter table pedidos enable row level security;
alter table pedido_items enable row level security;

-- Usuario: insertar solo SUS pedidos
drop policy if exists "insertar propio" on pedidos;
create policy "insertar propio" on pedidos
  for insert with check (auth.uid() = user_id);

-- Usuario: ver solo SUS pedidos
drop policy if exists "ver propios" on pedidos;
create policy "ver propios" on pedidos
  for select using (auth.uid() = user_id);

-- Usuario: ver solo items de SUS pedidos
drop policy if exists "ver items propios" on pedido_items;
create policy "ver items propios" on pedido_items
  for select using (
    exists (
      select 1 from pedidos p
      where p.id = pedido_id and p.user_id = auth.uid()
    )
  );

-- Usuario: insertar items en SUS pedidos
drop policy if exists "insertar items propios" on pedido_items;
create policy "insertar items propios" on pedido_items
  for insert with check (
    exists (
      select 1 from pedidos p
      where p.id = pedido_id and p.user_id = auth.uid()
    )
  );
