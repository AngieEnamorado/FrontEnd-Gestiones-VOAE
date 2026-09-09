# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

React + TypeScript + Vite frontend for "Becas VOAE" (UNAH), a management system covering three
subsystems reachable from the sidebar: Estudiantes (student scholarships), Giras (field trips), and
several still-unbuilt sections (Procad, Voluntariado, Pagos, Mantenimientos, Seguridad).

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

**Data layer is mocked in `src/data/`** (`mockSolicitudes.ts`, `mockGirasSolicitudes.ts`,
`mockMisGiras.ts`, `mockInscripciones.ts`, `currentUser.ts`). There is no backend/API integration
yet — pages import mock arrays directly and filter/derive state client-side with
`useMemo`/`useState`. `currentUser.ts`'s `obtenerUsuarioDeSesion()` simulates a session/auth call;
when a real backend exists this is the function to replace with a real fetch, not the components
that consume it.

**Giras data is split across two mock files by relationship to the current user:**
`mockMisGiras.ts` (`misGiras`) holds giras where the user is docente/jefe de misión, while
`mockGirasSolicitudes.ts` (`solicitudesGiras`) holds giras the user requested. Detail routes that
look up a gira by id (`ResumenGira.tsx`, `InscripcionesGira.tsx`) don't know which list it came
from, so they search `[...misGiras, ...solicitudesGiras]` combined. `mockInscripciones.ts` is
shaped differently — a `Record<string, Inscripcion[]>` keyed by gira id — rather than a flat array.

**Current user access:** components never hardcode user info — they call `useUsuarioActual()` from
`src/context/UserContext.tsx`, which wraps `obtenerUsuarioDeSesion()`. `UserProvider` wraps the app
in `main.tsx`.

**Types live centrally in `src/types/index.ts`** (`Solicitud`, `SolicitudGira`, `EstadoSolicitud`,
`UsuarioActual`, etc.) and are shared across pages/components/mock data rather than redefined
per-file.

**Layout shell:** `MainLayout.tsx` renders `Sidebar` + `Topbar` around an `<Outlet />`, and owns the
sidebar collapsed/expanded state. Route pages only render their own content area, not chrome.

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

## Conventions

- Code, identifiers, comments, and UI copy are in Spanish (this matches the domain — UNAH is a
  Honduran university). Keep new code consistent with this.
- Styling is Tailwind CSS v4 (via `@tailwindcss/vite`, configured through `@theme` in
  `src/index.css`, no `tailwind.config.js`). Institutional brand colors are exposed as Tailwind
  tokens: `unah-navy`, `unah-navy-dark`, `unah-navy-light`, `unah-orange`, `unah-orange-dark`.
- Icons come from `react-icons/hi2` (Heroicons outline set).
- Path aliases: none configured — imports use relative paths (`../../components/...`).
