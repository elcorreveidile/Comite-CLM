-- 1. Campo cargo en miembros_comite
ALTER TABLE miembros_comite ADD COLUMN IF NOT EXISTS cargo text;

UPDATE miembros_comite SET cargo = 'Presidenta'        WHERE email = 'alamolda@ugr.es';
UPDATE miembros_comite SET cargo = 'Secretaria'        WHERE email = 'isabel.alvarez@clm.ugr.es';
UPDATE miembros_comite SET cargo = 'Secretaria General' WHERE email = 'benitezl@go.ugr.es';

-- 2. Tabla de comunicados
CREATE TABLE IF NOT EXISTS comunicados (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  asunto               text NOT NULL,
  cuerpo               text NOT NULL,
  estado               text NOT NULL DEFAULT 'pendiente_aprobacion'
                         CHECK (estado IN ('pendiente_aprobacion', 'enviado', 'rechazado')),
  creado_por           text NOT NULL,
  aprobado_por         text,
  destinatarios_count  int,
  enviado_at           timestamptz,
  created_at           timestamptz DEFAULT now()
);

ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;
-- Solo el service role puede acceder (gestionado desde el servidor)
CREATE POLICY "service_role_only" ON comunicados USING (false);
