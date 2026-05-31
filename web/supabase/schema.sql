-- ============================================================
-- ESQUEMA SUPABASE — Comité de Empresa CLM · UGR
-- ============================================================

-- TRABAJADORES
create table if not exists trabajadores (
  id bigint generated always as identity primary key,
  nombre text not null,
  email text not null unique,
  departamento text,
  telefono text,
  notas text,
  created_at timestamptz default now()
);

alter table trabajadores enable row level security;
create policy "Lectura autenticada" on trabajadores for select to authenticated using (true);
create policy "Escritura autenticada" on trabajadores for insert to authenticated with check (true);
create policy "Actualización autenticada" on trabajadores for update to authenticated using (true);
create policy "Borrado autenticado" on trabajadores for delete to authenticated using (true);


-- AVISOS
create table if not exists avisos (
  id bigint generated always as identity primary key,
  titulo text not null,
  cuerpo text not null,
  publicado boolean not null default false,
  created_at timestamptz default now()
);

alter table avisos enable row level security;
create policy "Lectura autenticada" on avisos for select to authenticated using (true);
create policy "Escritura autenticada" on avisos for insert to authenticated with check (true);
create policy "Actualización autenticada" on avisos for update to authenticated using (true);
create policy "Borrado autenticado" on avisos for delete to authenticated using (true);


-- VOTACIONES
create table if not exists votaciones (
  id bigint generated always as identity primary key,
  titulo text not null,
  descripcion text,
  opciones text[] not null,
  activa boolean not null default false,
  created_at timestamptz default now()
);

alter table votaciones enable row level security;
create policy "Lectura autenticada" on votaciones for select to authenticated using (true);
create policy "Escritura autenticada" on votaciones for insert to authenticated with check (true);
create policy "Actualización autenticada" on votaciones for update to authenticated using (true);
create policy "Borrado autenticado" on votaciones for delete to authenticated using (true);


-- VOTOS
create table if not exists votos (
  id bigint generated always as identity primary key,
  votacion_id bigint not null references votaciones(id) on delete cascade,
  opcion text not null,
  trabajador_email text not null,
  created_at timestamptz default now(),
  unique(votacion_id, trabajador_email)
);

alter table votos enable row level security;
create policy "Lectura autenticada" on votos for select to authenticated using (true);
create policy "Inserción autenticada" on votos for insert to authenticated with check (true);


-- EVENTOS DE CALENDARIO
create table if not exists eventos_calendario (
  id bigint generated always as identity primary key,
  titulo text not null,
  fecha date not null,
  hora text,
  lugar text,
  descripcion text,
  created_at timestamptz default now()
);

alter table eventos_calendario enable row level security;
create policy "Lectura autenticada" on eventos_calendario for select to authenticated using (true);
create policy "Escritura autenticada" on eventos_calendario for insert to authenticated with check (true);
create policy "Actualización autenticada" on eventos_calendario for update to authenticated using (true);
create policy "Borrado autenticado" on eventos_calendario for delete to authenticated using (true);


-- PROPUESTAS
create table if not exists propuestas (
  id bigint generated always as identity primary key,
  titulo text not null,
  cuerpo text not null,
  anonima boolean not null default false,
  trabajador_id bigint references trabajadores(id) on delete set null,
  revisada boolean not null default false,
  respuesta text,
  created_at timestamptz default now()
);

alter table propuestas enable row level security;
create policy "Lectura autenticada" on propuestas for select to authenticated using (true);
create policy "Escritura autenticada" on propuestas for insert to authenticated with check (true);
create policy "Actualización autenticada" on propuestas for update to authenticated using (true);
create policy "Borrado autenticado" on propuestas for delete to authenticated using (true);


-- DOCUMENTOS
create table if not exists documentos (
  id bigint generated always as identity primary key,
  titulo text not null,
  descripcion text,
  url text,
  categoria text,
  created_at timestamptz default now()
);

alter table documentos enable row level security;
create policy "Lectura autenticada" on documentos for select to authenticated using (true);
create policy "Escritura autenticada" on documentos for insert to authenticated with check (true);
create policy "Actualización autenticada" on documentos for update to authenticated using (true);
create policy "Borrado autenticado" on documentos for delete to authenticated using (true);
