create table if not exists public.myeongun_orders (
  order_id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  payment_key_hash text not null unique,
  amount integer not null check (amount > 0),
  status text not null check (status in ('DONE', 'CANCELED', 'PARTIAL_CANCELED')),
  method text not null,
  approved_at timestamptz not null,
  reading_fingerprint text not null,
  recovery_token_hash text not null,
  payload_ciphertext text not null,
  payload_iv text not null,
  payload_auth_tag text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists myeongun_orders_recovery_token_hash_idx
  on public.myeongun_orders (recovery_token_hash);
create index if not exists myeongun_orders_user_id_idx
  on public.myeongun_orders (user_id, created_at desc);

alter table public.myeongun_orders enable row level security;

revoke all on table public.myeongun_orders from anon, authenticated;
grant select, insert, update on table public.myeongun_orders to service_role;

comment on table public.myeongun_orders is
  'Server-only payment and encrypted reading recovery records. No browser role access.';
