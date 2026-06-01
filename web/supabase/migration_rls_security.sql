-- ============================================================
-- MIGRACIÓN DE SEGURIDAD: Row-Level Security en todas las tablas
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- ============================================================

-- Todas las operaciones públicas están BLOQUEADAS.
-- Toda la lógica de negocio usa la service_role_key desde Server Actions
-- (nunca expuesta al navegador), por lo que denegar acceso anónimo
-- y autenticado por defecto es la configuración correcta.

-- ── trabajadores ──────────────────────────────────────────────
ALTER TABLE trabajadores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_all_trabajadores" ON trabajadores;
CREATE POLICY "deny_all_trabajadores" ON trabajadores
  AS RESTRICTIVE USING (false);

-- ── miembros_comite ───────────────────────────────────────────
ALTER TABLE miembros_comite ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_all_miembros" ON miembros_comite;
CREATE POLICY "deny_all_miembros" ON miembros_comite
  AS RESTRICTIVE USING (false);

-- ── avisos ────────────────────────────────────────────────────
ALTER TABLE avisos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_all_avisos" ON avisos;
CREATE POLICY "deny_all_avisos" ON avisos
  AS RESTRICTIVE USING (false);

-- ── votaciones ────────────────────────────────────────────────
ALTER TABLE votaciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_all_votaciones" ON votaciones;
CREATE POLICY "deny_all_votaciones" ON votaciones
  AS RESTRICTIVE USING (false);

-- ── votos ─────────────────────────────────────────────────────
ALTER TABLE votos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_all_votos" ON votos;
CREATE POLICY "deny_all_votos" ON votos
  AS RESTRICTIVE USING (false);

-- ── propuestas ────────────────────────────────────────────────
ALTER TABLE propuestas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_all_propuestas" ON propuestas;
CREATE POLICY "deny_all_propuestas" ON propuestas
  AS RESTRICTIVE USING (false);

-- ── comunicados ───────────────────────────────────────────────
ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_all_comunicados" ON comunicados;
CREATE POLICY "deny_all_comunicados" ON comunicados
  AS RESTRICTIVE USING (false);

-- ── documentos ────────────────────────────────────────────────
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_all_documentos" ON documentos;
CREATE POLICY "deny_all_documentos" ON documentos
  AS RESTRICTIVE USING (false);

-- ── eventos_calendario ────────────────────────────────────────
ALTER TABLE eventos_calendario ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_all_eventos" ON eventos_calendario;
CREATE POLICY "deny_all_eventos" ON eventos_calendario
  AS RESTRICTIVE USING (false);

-- NOTA: La service_role_key de Supabase omite el RLS por diseño,
-- por lo que los Server Actions siguen funcionando con normalidad.
-- El acceso anónimo y autenticado sin service_role queda completamente bloqueado.
