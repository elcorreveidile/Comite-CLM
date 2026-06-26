# Comité CLM · Sección Sindical UGT

Web oficial de la Sección Sindical UGT del Centro de Lenguas Modernas (CLM) de la Universidad de Granada.

**Versión:** v1.1  
**URL:** https://ugt.comiteclm.com  
**Stack:** Next.js · Supabase · Brevo · Vercel

---

## Funcionalidades

### Web pública
- Página de inicio con información del comité
- Aviso legal, política de privacidad y cookies

### Panel del trabajador (`/panel`)
- Login con email/contraseña
- Gestión del perfil y preferencias de comunicados

### Panel de administración (`/admin`)
Acceso restringido por roles: **Superadmin**, **Presidenta**, **Secretaria**

| Sección | Descripción |
|---|---|
| Comunicados | Redacción, envío y seguimiento de emails masivos |
| Trabajadores | CRUD de la plantilla con soporte para departamentos |
| Miembros del comité | Gestión de los miembros y sus cargos |
| Avisos | Avisos visibles en el panel del trabajador |
| Votaciones | Creación y seguimiento de votaciones internas |
| Propuestas | Buzón de propuestas de los trabajadores |
| Documentos | Repositorio de documentos descargables |
| Calendario | Eventos y reuniones del comité |
| Intentos de acceso | Log de intentos de login a rutas protegidas |

#### Comunicados — detalle
- Envío inmediato o programado (cron cada 5 min)
- Destinatarios: todos, comité, departamento o trabajadores específicos
- Adjuntos hasta 20 MB (Supabase Storage)
- Plantillas reutilizables
- Historial de lecturas por trabajador (pixel de seguimiento)
- Flujo de aprobación: Secretaria redacta → Presidenta aprueba y envía

---

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
BREVO_API_KEY=
CRON_SECRET=                      # auto-inyectado por Vercel
NEXT_PUBLIC_SITE_URL=https://ugt.comiteclm.com
```

---

## Base de datos (Supabase)

Tablas principales:

| Tabla | Descripción |
|---|---|
| `trabajadores` | Plantilla de personal |
| `miembros_comite` | Miembros del comité con cargo y rol |
| `comunicados` | Comunicados con estado y metadatos de envío |
| `plantillas_comunicado` | Plantillas reutilizables para comunicados |
| `comunicado_lecturas` | Registro de aperturas por email (pixel tracking) |
| `avisos` | Avisos visibles en el panel del trabajador |
| `votaciones` | Votaciones internas |
| `propuestas` | Propuestas de trabajadores |
| `documentos` | Documentos descargables |
| `eventos_calendario` | Eventos del calendario |
| `login_intentos` | Log de intentos de acceso sospechosos |

---

## Desarrollo local

```bash
cd web
npm install
npm run dev
```

Abre http://localhost:3000

---

## Despliegue

El proyecto se despliega automáticamente en Vercel al mergear a `main`.  
El cron `/api/cron/enviar-programados` se ejecuta cada 5 minutos para procesar envíos programados.
