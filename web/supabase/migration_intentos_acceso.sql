-- Tabla de intentos de acceso no autorizados
CREATE TABLE IF NOT EXISTS intentos_acceso (
  id          bigserial PRIMARY KEY,
  ip          text,
  path        text,
  user_agent  text,
  intento_num integer NOT NULL DEFAULT 1,
  pais        text,
  ciudad      text,
  region      text,
  latitud     text,
  longitud    text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE intentos_acceso ENABLE ROW LEVEL SECURITY;

-- El middleware usa la clave anon para insertar
CREATE POLICY "anon_insert_intentos" ON intentos_acceso
  FOR INSERT TO anon WITH CHECK (true);

-- Solo el service_role puede leer (las páginas admin usan service_role_key)
-- Sin política SELECT para anon/authenticated = denegado por defecto
