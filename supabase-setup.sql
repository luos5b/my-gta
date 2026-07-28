-- Table pour tous les votes (attentes, priorités, craintes, liberté, trailer, plateforme)
create table if not exists votes (
  category text not null,
  option_id text not null,
  count integer not null default 0,
  primary key (category, option_id)
);

-- Table pour les commentaires
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  created_at timestamptz not null default now()
);

-- Table pour le nombre de participants (une seule ligne)
create table if not exists participants (
  id int primary key default 1,
  count integer not null default 0
);
insert into participants (id, count) values (1, 0) on conflict (id) do nothing;

-- Autoriser la lecture et l'écriture publique (site sans compte utilisateur)
alter table votes enable row level security;
alter table comments enable row level security;
alter table participants enable row level security;

create policy "public read votes" on votes for select using (true);
create policy "public write votes" on votes for insert with check (true);
create policy "public update votes" on votes for update using (true);

create policy "public read comments" on comments for select using (true);
create policy "public write comments" on comments for insert with check (true);

create policy "public read participants" on participants for select using (true);
create policy "public update participants" on participants for update using (true);
