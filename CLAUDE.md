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

There is no test runner configured in this repo.

## Architecture

**Routing is driven by two parallel files that must be kept in sync:**
- `src/router/navigation.ts` — declares every sidebar entry (`navigationItems`), including items
  that don't have a real page yet. `Sidebar.tsx` renders purely from this list.
- `src/App.tsx` — declares the actual `<Route>` tree. Every `navigationItems` entry needs a
  matching route; entries without a built page point to `PaginaEnConstruccion` (a placeholder
  page take a `seccion`/`titulo` prop) rather than being left unrouted.

When adding a new sidebar item, add it in both places, and either build a real page or wire it to
`PaginaEnConstruccion`.

**Data layer is mocked in `src/data/`** (one `mock*.ts` file per domain, plus `currentUser.ts`).
There is no backend/API integration yet — pages import mock arrays directly and filter/derive state
client-side with `useMemo`/`useState`. `currentUser.ts`'s `obtenerUsuarioDeSesion()` simulates a
session/auth call; when a real backend exists this is the function to replace with a real fetch,
not the components that consume it. Derivations that several Voluntariado screens need in common
(who coordinates which group, hours accumulated, attendance %, gender breakdown) are centralized as
plain functions in `src/data/voluntariadoSelectors.ts` rather than recomputed per-page — follow that
pattern for new cross-screen derivations instead of duplicating filter logic in components.

**Giras data is split across two mock files by relationship to the current user:**
`mockMisGiras.ts` (`misGiras`) holds giras where the user is docente/jefe de misión, while
`mockGirasSolicitudes.ts` (`solicitudesGiras`) holds giras the user requested. Detail routes that
look up a gira by id (`ResumenGira.tsx`, `InscripcionesGira.tsx`) don't know which list it came
from, so they search `[...misGiras, ...solicitudesGiras]` combined. `mockInscripciones.ts` is
shaped differently — a `Record<string, Inscripcion[]>` keyed by gira id — rather than a flat array.
Unsent requests are a third, separate list (`mockBorradoresGiras.ts` / `BorradorGira`, fields
mostly optional since a draft can be saved half-filled) surfaced at `/giras/solicitudes/borradores`
and edited by reusing `NuevaSolicitud.tsx` with a `:borradorId` param.

**Current user access:** components never hardcode user info — they call `useUsuarioActual()` from
`src/context/UserContext.tsx`, which wraps `obtenerUsuarioDeSesion()`. `UserProvider` wraps the app
in `main.tsx`. The same context exposes `useRolProcad()` (see PROCAD below).

**PROCAD** is the one subsystem whose data is written, not just read, so its mutable state lives in
`src/context/ProcadContext.tsx` (`useProcad()`), wrapped around the app in `main.tsx`. It holds the
admin's records plus a derived `pendientes` count and the actions that resolve cases; every action
also prepends a row to the audit log and raises a confirmation toast. State is shared because the
decisions cross modules — resolving a case changes the badge the sidebar draws on another entry.

PROCAD has two roles (`rolProcad` on `UsuarioActual`): `administrador` manages, `vicerrector` only
reads statistics. Role filtering is scoped to PROCAD only: entries in `navigationItems` declare an
optional `roles` array (no array = everyone sees it), `Sidebar` filters children by the active role,
and `src/router/SoloAdministrador.tsx` guards the routes so a direct URL can't bypass the menu.
`src/pages/procad/ModoDeVista.tsx` switches the role — it is demo tooling for the no-backend stage
and gets deleted, along with `cambiarRolProcad`, once the session supplies the real role.

Its five admin modules (`Estudiantes`, `Agrupaciones`, `Galeria`, `Configuracion`, `Reportes`) all
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
has no `navigationItems` entries of its own. Its "current user" is a separate mock
(`data/mockEstudianteVoluntariado.ts`'s `estudianteActual`), not `useUsuarioActual()`, and pages
inside it switch between a regular-member view and a coordinator view (`PanelCoordinador` and its
sub-pages) based on that mock rather than PROCAD-style role guarding.

**Types live centrally in `src/types/index.ts`** (`Solicitud`, `SolicitudGira`, `EstadoSolicitud`,
`UsuarioActual`, etc.) and are shared across pages/components/mock data rather than redefined
per-file.

**Layout shell:** `MainLayout.tsx` renders `Sidebar` + `Topbar` around an `<Outlet />`, and owns the
sidebar collapsed/expanded state. Route pages only render their own content area, not chrome. The
Portal Estudiante (see Voluntariado above) is the one route tree that opts out of `MainLayout` and
uses `MobileShell.tsx` instead.

**Confirmation dialogs (PROCAD):** actions that change state open
`components/procad/DialogoConfirmacion.tsx`, which follows the modal convention below — it takes a
`Dialogo | null` and returns `null` when closed. A page keeps one `useState<Dialogo | null>` and
passes `abrirDialogo` down to its modules, rather than each table owning its own modal.

**Status badges:** `EstadoSolicitud` values (`PENDIENTE`, `APROBADA`, `RECHAZADA`, `EN REVISIÓN`,
`ESPERA INF. SOCIAL`) have a fixed color mapping in `src/components/EstadoBadge.tsx` — reuse this
component instead of re-implementing status styling.

**Detail modal pattern:** list pages (`MisGiras.tsx`, `InscripcionesGira.tsx`, `giras/Solicitudes.tsx`)
keep a `useState<T | null>` for the selected row and pass it straight into a modal component
(`DetalleGiraModal`, `DetalleInscripcionModal`, `DetalleSolicitudGiraModal`) as a `{ item: T | null;
onClose: () => void }` prop pair. The modal itself returns `null` when `item` is `null`, and renders
a fixed backdrop (`onClick={onClose}`) around a panel that stops propagation, so clicking outside
closes it. Follow this shape rather than adding local `isOpen` booleans. Some list/detail pages also
have a full dedicated route (e.g. `/giras/mis-giras/:id/resumen`) for a deeper view than the modal
offers — those routes aren't in `navigationItems` since they're reached by clicking a row, not the
sidebar.

**Report export is centralized in `src/utils/`**: `exportarPdf.ts` builds the institutional PDF
layout (navy/orange header, `jspdf-autotable` tables, paginated footer) shared by Giras, PROCAD and
Voluntariado reports, `exportarGraficasPdf.ts` handles exporting a single chart/section, and
`exportarExcel.ts` covers the Excel counterpart — new report/export features should extend these
rather than building PDF/Excel generation per-page.

## Conventions

- Code, identifiers, comments, and UI copy are in Spanish (this matches the domain — UNAH is a
  Honduran university). Keep new code consistent with this.
- Styling is Tailwind CSS v4 (via `@tailwindcss/vite`, configured through `@theme` in
  `src/index.css`, no `tailwind.config.js`). Institutional brand colors are exposed as Tailwind
  tokens: `unah-navy`, `unah-navy-dark`, `unah-navy-light`, `unah-orange`, `unah-orange-dark`.
- Icons come from `react-icons/hi2` (Heroicons outline set).
- Path aliases: none configured — imports use relative paths (`../../components/...`).
