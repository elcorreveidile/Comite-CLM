-- Añade columna adjuntos a la tabla comunicados
ALTER TABLE comunicados
  ADD COLUMN IF NOT EXISTS adjuntos JSONB NOT NULL DEFAULT '[]'::jsonb;
