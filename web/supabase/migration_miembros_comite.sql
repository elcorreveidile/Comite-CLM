-- ============================================================
-- MIGRACIÓN: tabla miembros_comite
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

create table if not exists miembros_comite (
  id bigint generated always as identity primary key,
  nombre text not null,
  email text not null unique,
  sindicato text not null check (sindicato in ('CCOO', 'UGT')),
  cargo text,
  activo boolean not null default true,
  created_at timestamptz default now()
);

alter table miembros_comite enable row level security;

-- Lectura permitida a usuarios autenticados (necesario para el middleware)
create policy "Lectura autenticada" on miembros_comite
  for select to authenticated using (true);

-- Escritura solo via service role (server actions con check de super admin)

-- Datos iniciales
insert into miembros_comite (nombre, email, sindicato) values
  ('Benjamín Prieto',              'benjamin.prieto@clm.ugr.es', 'UGT'),
  ('Agustina García García',       'agustinagg@yahoo.es',        'UGT'),
  ('Javier Benítez',               'benitezl@go.ugr.es',         'UGT'),
  ('Isabel Álvarez',               'isabel.alvarez@clm.ugr.es',  'CCOO'),
  ('Fiona Baird',                  'fbaird@ugr.es',              'CCOO'),
  ('Ramón Barquero',               'ramon.barquero@clm.ugr.es',  'CCOO'),
  ('M.ª Ángeles Lamolda González', 'alamolda@ugr.es',            'CCOO'),
  ('África Morales',               'africam@ugr.es',             'CCOO'),
  ('Giorgia Pordenoni',            'gpordenoni@ugr.es',          'CCOO')
on conflict (email) do nothing;
