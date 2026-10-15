# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

React + TypeScript + Vite frontend for "Becas VOAE" (UNAH), a management system covering four
built subsystems reachable from the sidebar: Estudiantes (student scholarships), Giras (field
trips), PROCAD (sports/arts programme) and Voluntariado (volunteering), plus several still-unbuilt
sections (Pagos, Mantenimientos, Seguridad).

## Commands

```
npm run dev       # start Vite dev server
npm run build     # tsc -b (project references) then vite build
npm run lint      # oxlint
npm run preview   # preview a production build
```

There is no test runner configured in this repo. Type-check alone: `npx tsc -b`.

`tsconfig.app.json` is strict in ways that fail `npm run build` (not just lint): `noUnusedLocals` /
`noUnusedParameters` (an unused import or param is a build error), `verbatimModuleSyntax` (type-only
imports must use `import type`), and `erasableSyntaxOnly` (no `enum`, namespaces, or constructor
parameter properties — use union types / `as const` objects; declare class fields explicitly).

Some source files use CRLF line endings and others LF. When editing with a script, normalise before
matching multi-line strings and restore the original endings on write.

## Repo context

The git root is this `FrontEnd-Gestiones-VOAE/` folder; its parent `proyecto-giras/` is not a repo.
Two sibling folders there are backend-side: `bd_voae_script/DbVoae_final.sql` (unified SQL Server
schema, one schema each for Catalogo/Voluntariado/Procad/Giras — the reference for API field names and
for the mocks still in use) and `FuncionesLambdaGestionesVOAE/` (AWS Lambda API, one function per domain:
`voae-catalogo`, `voae-giras`, `voae-voluntariado`, `voae-procad`, `voae-reporteria`; this app talks to all
five). `LOCAL PROCAD/` (HTML prototypes) is gitignored reference material. `README.md` is
the Vite template and currently contains unresolved merge-conflict markers — don't treat it as
documentation.

## Architecture

**Routing is driven by two parallel files that must be kept in sync:**
- `src/router/navigation.ts` — declares every sidebar entry (`navigationItems`), including items
  that don't have a real page yet. `Sidebar.tsx` renders purely from this list.
- `src/App.tsx` — declares the actual `<Route>` tree. Every `navigationItems` entry needs a
  matching route; entries without a built page point to `PaginaEnConstruccion` (a placeholder
  page take a `seccion`/`titulo` prop) rather than being left unrouted.

When adding a new sidebar item, add it in both places, and either build a real page or wire it to
`PaginaEnConstruccion`.

**What talks to the API and what is still mocked.** Giras and Voluntariado (admin screens and Portal Estudiante)
read and write only through the API. PROCAD is split: its Estudiantes module and the Agrupaciones lists
(grupos, actividades, visorías, accesos, catálogos) use `voae-procad` when `VITE_API_PROCAD_URL` is set, while
Estadísticas, Reportes/ReportePersonalizado and Galería are still mock-only (there is no PROCAD route in
`voae-reporteria` and no gallery tables in the schema). Estudiantes (`pages/estudiantes/`) is fully mocked. The
mocks live in `src/data/` (one `mock*.ts` file per domain, plus `currentUser.ts`); `currentUser.ts`'s
`obtenerUsuarioDeSesion()` simulates a session and is the function to replace when real auth exists. The
Voluntariado mocks (`mock*Voluntariado.ts`, `voluntariadoSelectors.ts`) are no longer imported by any page — they
only reference each other — so don't build on them.

**Backend URLs (`.env.local`, git-ignored; `.env.example` shows the shape, no trailing slash).** Each variable is the
base of one function, e.g. `https://<id>.execute-api.us-east-1.amazonaws.com/v1/voluntariado`:
`VITE_API_GIRAS_URL`, `VITE_API_VOLUNTARIADO`, `VITE_API_REPORTERIA`, `VITE_API_PROCAD_URL`, and `voae-catalogo`
twice under two names because two clients read it (`VITE_API_CATALOGO` for Voluntariado, `VITE_API_CATALOGO_URL`
for PROCAD). `VITE_PROCAD_ID_PERSONA` is the `Catalogo.tblPersonas` id that signs PROCAD decisions until there
is a session (it must hold the `ADMINISTRADOR_PROCAD` role). Without `VITE_API_PROCAD_URL` PROCAD falls back to its
mocks; without `VITE_API_REPORTERIA` the dashboards fall back to slower provisional paths (see below). The AWS
account caps Lambda at 10 concurrent executions until a quota increase lands; past that API Gateway answers 503
**without CORS headers**, so the browser reports a network error. Every client retries a GET once for that reason
— keep that retry when touching them, and don't fire more parallel requests per screen than needed.

**Three HTTP clients, one per backend family** (they grew separately; don't mix them):
- `api/cliente.ts` — Giras and reporteria (`apiGiras`, `apiReporteria`, which is `null` when its URL is unset).
  Described in detail below.
- `api/clienteVoluntariado.ts` — `crearCliente(variable, url)` builds the clients for `voae-voluntariado`
  (`api/voluntariado.ts`, `voluntariadoApi`) and `voae-catalogo` (`api/catalogo.ts`, `catalogoApi`: campus,
  períodos, student by account number). It sends the `X-Voae-Usuario` header, which these APIs' CORS allows (the
  Giras API does not). Errors are its own `ErrorApi` with `baseDespertando` for 503; screens show them with its
  `mensajeDeError`. Loading hook: `utils/useApi.ts` (`{ datos, cargando, error, recargar }`; unlike
  `useConsulta` it hides data from previous dependencies while the new ones load). `components/voluntariado/
  EstadoCarga.tsx` renders the loading/error/retry state.
- `api/clienteProcad.ts` — `voae-procad` plus a read-only `voae-catalogo` client; endpoint functions in
  `api/procad.ts`, response types in `types/procad.ts`, and `api/adaptadoresProcad.ts` converts responses into the
  existing PROCAD UI types in `types/index.ts` so the screens didn't change. Data the DB doesn't store is left
  empty, never invented.

**The Giras API layer (`src/api/`).** `cliente.ts` is a small `fetch` wrapper (`apiGiras.get/post/put/delete`):
base URL from `VITE_API_GIRAS_URL` (`.env.local`, git-ignored; `.env.example` shows the shape, no trailing
slash), errors surface as `ErrorApi` (`estado` = HTTP status, 0 if unreachable; message is the API's Spanish
`error` text), a single automatic retry on 503 (the Azure serverless DB pauses and takes a while to wake), and an
`?usuarioRegistro=` query parameter that only fills the DB's audit columns (deliberately not the
`X-Voae-Usuario` header: a custom header forces a CORS preflight, and the console-created API Gateway only allows
`Content-Type`). `giras.ts` has one typed function per endpoint;
`useConsulta.ts` is the loading hook (`{ datos, cargando, error, recargar }`; it does NOT clear `datos` when its
dependencies change, so mount a child with a `key` when a stale value would be misleading). Request/response
types are in `src/types/giras.ts` and use the **database's column names** (`destinoGira`,
`fechaSalidaPropuesta`, `idJefeMision`…), not the old mock names; states travel as the code seeded in
`Catalogo.tblEstados` (`"Pendiente"`, `"Correccion"`, `"Inscripcion abierta"`), never uppercased. Display
formatting (`«II Periodo 2026»`, dates, money) is in `utils/girasFormato.ts`; the state chip is
`components/giras/EstadoGiraBadge.tsx` (the older `EstadoBadge` serves the other modules and is keyed by a closed
uppercase union — don't use it for Giras).

Things the API shapes that pages must respect: in a solicitud **detail** `costos` is the list of cost lines (the
total is the sum) while in the list it is the number; a list/detail `categorias` is text in one and objects in the
other; `GET /catalogos` returns every tabla tipo (active only) by slug for form dropdowns, while
`GET /catalogos/{slug}?todos=true` is the uncached maintenance view. Selectable lists (carreras, facultades,
finalidades, transporte, financiamiento, alcance, tipos de sangre, the `maxDocentesPorGira` parameter, jefes de
aprobación, docentes) all come from the API — nothing is hardcoded in the forms. **Campus options in Giras are
the campuses of users that exist** (`GET /usuarios`), because no campus endpoint of `voae-giras` exists; the real
list is `voae-catalogo`'s `/campus`, which Voluntariado and PROCAD already use but Giras doesn't yet.

**Who am I in Giras (no session yet).** `UserContext` keeps, per Giras role, *which real DB user is being
impersonated* (`identidades`, persisted in `localStorage` under `voae.giras.identidades`), chosen in
`pages/giras/ModoDeVista.tsx` ("Actuar como"). Read it with `useIdentidadGira()` (the user for the active role;
its `idUsuarioUnidad` is what the API calls `idJefeMision` / `idJefeAprobacion` / `idViajero`) and
`useEstudianteActual()` (`{ nombreCompleto, numeroCuenta }` or `null`). Every Giras screen that needs an identity
renders `components/giras/SinIdentidad.tsx` until one is chosen. The actor in Giras is a
`Giras.tblUsuarioUnidad` row (a person in a role within a unit), **not** a `Catalogo.tblPersonas` id. When real
auth exists, `identidades`, `elegirIdentidadGira`, `ModoDeVista`, `cambiarRolGira`, `AccesoGiras` and `rolesGira`
in `navigation.ts` are deleted together. `useUsuarioActual()` (the mock "Erin Matute" for the Topbar) is unrelated
and still used by PROCAD.

**PROCAD** keeps its mutable state in `src/context/ProcadContext.tsx` (`useProcad()`), wrapped around the app in
`main.tsx`. It holds the admin's records plus a derived `pendientes` count and the actions that resolve cases;
every action also prepends a row to the audit log and raises a confirmation toast. State is shared because the
decisions cross modules — resolving a case changes the badge the sidebar draws on another entry. With
`procadConectado` (i.e. `VITE_API_PROCAD_URL` set) the context starts empty instead of from the mocks, loads from
`api/procad.ts`, and every action calls the API and then **re-reads** the affected lists, because the DB triggers
may change more than the screen asked for (approving a condicionado, expelling a member…). Actions refuse to run
without `VITE_PROCAD_ID_PERSONA`. Because the provider wraps every route, it loads on every page, Giras and
Voluntariado included — keep that load small.

PROCAD has two roles (`rolProcad` on `UsuarioActual`): `administrador` manages, `vicerrector` only
reads statistics. Role filtering is scoped to PROCAD only: entries in `navigationItems` declare an
optional `roles` array (no array = everyone sees it), `Sidebar` filters children by the active role,
and `src/router/SoloAdministrador.tsx` guards the routes so a direct URL can't bypass the menu.
`src/pages/procad/ModoDeVista.tsx` switches the role — it is demo tooling for the no-backend stage
and gets deleted, along with `cambiarRolProcad`, once the session supplies the real role.

**Giras roles and pages.** Five roles (`RolGira` in `types`: vicerrectoria, jefe-mision, jefe-aprobacion,
estudiante, administrador) live in `UsuarioActual.rolGira`, read through `useRolGira()`. What each role sees is
declared once, as `rolesGira` on the Giras children in `navigation.ts`; the Sidebar filter, the role cards' page
badges, and `router/AccesoGiras.tsx` (a layout route wrapping all of `/giras` that redirects URLs the role can't
open) all derive from it via `router/rolesGira.ts`. The order of the Giras children in `navigation.ts` is also the
"first page of the role" the switcher redirects to. "Modo de vista" has no `rolesGira` on purpose so it is never
hidden. Default role is `jefe-mision`. `RUTAS_VEDADAS` in `router/rolesGira.ts` covers "role sees the page but
not some of its sub-routes": the estudiante has Mis giras but not the roster `/giras/mis-giras/:id/inscripciones`
(the detail route `…/inscripciones/:inscripcionId` must stay open — it is where "Ver detalles" on their own
inscription goes, and that page treats someone else's inscription as not found).

What each role does, all against the API:
- **jefe-mision** creates solicitudes (`NuevaSolicitud.tsx`, six steps split across `nuevaSolicitud/`; one
  controlled state object, `formulario.ts` converts to/from the API body) and registers *excepcional*
  inscripciones on behalf of a student (the DB trigger requires the inscriber and a motive from the first save,
  even for a draft). They dictaminate inscripciones (`DetalleInscripcion.tsx`) and fix a solicitud returned to
  `Correccion` via the same edit route (`solicitudes/borradores/:id/editar`).
- **jefe-aprobacion** dictaminates solicitudes (`DetalleSolicitud.tsx`): Aprobada / Correccion / Denegada.
  Approving creates the gira server-side.
- **estudiante** sees only their own inscripciones and giras (filtered by `numeroCuenta` on the server) and
  registers their own (`NuevaInscripcion.tsx`, `nuevaInscripcion/`).
- **administrador** has Configuraciones (`giras/Configuracion.tsx`): "Configuraciones" is a generic CRUD over the
  tablas tipo (`configuracion/TablasTipo.tsx` + `ModalRegistro.tsx`; which tables exist and which columns/toggles
  each has is UI metadata in `configuracion/catalogosGira.ts` — only tables with a state column can be
  deactivated, none has a `codigo`) and "Parámetros del Sistema" edits `Giras.tblParametros` values.
- Status changes are **dictámenes**, not a status dropdown: `components/giras/BloqueDictamen.tsx` registers one
  (decision + justification, required to deny/return) and the API moves the state. Only `Pendiente` can be
  dictaminated; only `Borrador`/`Correccion` can be edited; only a `Borrador` can be deleted.
- A gira is never created from the UI: it appears when a solicitud is approved. There is no gira edit/cancel
  endpoint yet.

`giras/Estadisticas.tsx` gets its rows from `api/estadisticasGiras.ts`: one call to `voae-reporteria`
(`/giras/registros`) when `VITE_API_REPORTERIA` is set, otherwise the old fallback of every sent solicitud plus its
detail (N+1 requests). Either way a solicitud counts once, under its first facultad/finalidad.

Its five PROCAD admin modules (`Estudiantes`, `Agrupaciones`, `Galeria`, `Configuracion`, `Reportes`) all
render through `src/pages/procad/LayoutModulo.tsx` and keep their sub-screens in
`pages/procad/modulos/`. `Galeria` is the photo archive (albums are either tied to an `Actividad`
or standalone) and lives in `ProcadContext` alongside the case-management state even though it
isn't a "pendiente" workflow. The statistics dashboard is shared by both roles; its per-section
derivations live in `pages/procad/secciones/datos.ts` and the PDF report is built from those same
functions in `secciones/pdf.ts`, so the export can never disagree with the screen.

**Voluntariado spans two separate audiences under one sidebar entry, and only one of them lives in
the sidebar's route tree.** VOAE staff screens (`pages/voluntariado/admin/`: `TableroNacional`,
`Estadisticas`, group/activity approval, informes, `Diplomas`, `Catalogos`) render inside
`MainLayout` like every other subsystem and are the routes listed in `navigationItems`. Students —
a different audience entirely — get a separate mobile-width "Portal Estudiante"
(`pages/voluntariado/estudiante/`) mounted at `/voluntariado/portal-estudiante` *outside*
`MainLayout`, through `layouts/MobileShell.tsx` (fixed-width column, bottom `TabBarMovil` instead of
Sidebar/Topbar) — it's reached by a link from the admin Tablero, not the sidebar, so it deliberately
has no `navigationItems` entries of its own. Its "current user" is a real `Catalogo.tblPersonas` row chosen by
hand: `MobileShell` wraps the portal in `context/SesionVoluntariadoContext.tsx` (`idPersona`, the person's
groups and hours, `grupoCoordinado`, `recargarPersona` after joining a group), and
`components/voluntariado/SelectorEstudiantePrueba.tsx` picks the person (remembered in `localStorage` under
`voluntariado.idPersonaPrueba`). When real auth exists, the selector is deleted and `idPersona` comes from the
session; the screens only consume the context. Pages switch between a regular-member view and a coordinator view
(`PanelCoordinador` and its sub-pages) based on `grupoCoordinado`, not PROCAD-style role guarding. On the admin
side, `TableroNacional` has a "Rol de prueba" toggle (Administrador / Enlace VOAE) that limits the enlace to one
campus — also demo tooling.

Voluntariado details worth knowing: `Tablero` and `Estadisticas` read `voae-reporteria` (`voluntariadoApi.tablero`
/ `.estadisticas`), falling back to provisional routes of `voae-voluntariado` that return the same shape; states
travel uppercase (`EN_CAPTURA`, `PENDIENTE`…) and render with `components/voluntariado/BadgeEstadoVoluntariado.tsx`;
dates arrive as ISO strings (format with `fechaCorta()` in `utils/voluntariado.ts`). Files (group documents and
logos, activity photos, expense receipts) go **straight from the browser to S3**: `api/archivosVoluntariado.ts`
asks the API to sign an upload (`POST /archivos/subidas`, which returns a presigned POST: `url` + form `campos`),
posts the file as a form to S3, and then registers only the object key; the Lambda never receives the binary.
Diplomas take each member's participation and the threshold from the API (`/diplomas/participacion`); don't
recompute attendance in the client.

**Types.** UI types for the mocked modules live centrally in `src/types/index.ts` (`Solicitud`,
`EstadoSolicitud`, `UsuarioActual`, …). API contracts: Giras in `src/types/giras.ts`, PROCAD in
`src/types/procad.ts`, Voluntariado and Catálogo next to their clients (`api/voluntariado.ts`, `api/catalogo.ts`),
all using the database's column names.

**Layout shell:** `MainLayout.tsx` renders `Sidebar` + `Topbar` around an `<Outlet />`, and owns the
sidebar collapsed/expanded state. Route pages only render their own content area, not chrome. The
Portal Estudiante (see Voluntariado above) is the one route tree that opts out of `MainLayout` and
uses `MobileShell.tsx` instead.

**Confirmation dialogs (PROCAD):** actions that change state open
`components/procad/DialogoConfirmacion.tsx`, which follows the modal convention below — it takes a
`Dialogo | null` and returns `null` when closed. A page keeps one `useState<Dialogo | null>` and
passes `abrirDialogo` down to its modules, rather than each table owning its own modal.

**Status badges (other modules):** `EstadoSolicitud` values (`PENDIENTE`, `APROBADA`, `RECHAZADA`,
`EN REVISIÓN`, `ESPERA INF. SOCIAL`) have a fixed color mapping in `src/components/EstadoBadge.tsx` —
reuse it there; Giras uses `EstadoGiraBadge` instead (see above).

**Detail modal pattern:** list pages keep a `useState<T | null>` for the selected row and pass it
straight into a modal component (`DetalleGiraModal`, `DetalleInscripcionModal`,
`DetalleSolicitudGiraModal`) as a `{ item: T | null; onClose: () => void }` prop pair. The modal itself
returns `null` when `item` is `null`, and renders a fixed backdrop (`onClick={onClose}`) around a panel
that stops propagation, so clicking outside closes it. Follow this shape rather than adding local
`isOpen` booleans. Some list/detail pages also have a full dedicated route (e.g.
`/giras/mis-giras/:id/resumen`) for a deeper view than the modal offers — those routes aren't in
`navigationItems` since they're reached by clicking a row, not the sidebar.

**Report export is centralized in `src/utils/`**: `exportarPdf.ts` builds the institutional PDF
layout (navy/orange header, `jspdf-autotable` tables, paginated footer) shared by Giras, PROCAD and
Voluntariado reports, `exportarGraficasPdf.ts` handles exporting a single chart/section, and
`exportarExcel.ts` covers the Excel counterpart — new report/export features should extend these
rather than building PDF/Excel generation per-page. (`ResumenGira.tsx` still calls `jspdf` directly;
that's the exception, not the pattern to copy.)

## Conventions

- Code, identifiers, comments, and UI copy are in Spanish (this matches the domain — UNAH is a
  Honduran university). Keep new code consistent with this.
- Styling is Tailwind CSS v4 (via `@tailwindcss/vite`, configured through `@theme` in
  `src/index.css`, no `tailwind.config.js`). Institutional brand colors are exposed as Tailwind
  tokens: `unah-navy`, `unah-navy-dark`, `unah-navy-light`, `unah-orange`, `unah-orange-dark`.
- Icons come from `react-icons/hi2` (the only react-icons set in use).
- Charts use `recharts`; animation uses `motion`. PDF export should go through `src/utils/` (see
  above).
- Path aliases: none configured — imports use relative paths (`../../components/...`).
- Don't name two files that differ only by case (`TablasTipo.tsx` vs `tablasTipo.ts`): the Windows file
  system treats them as one and `tsc` fails.
