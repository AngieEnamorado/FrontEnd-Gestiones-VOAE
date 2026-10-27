import { useMemo, useState } from "react";
import { HiOutlineCheck, HiOutlineNoSymbol, HiOutlinePlus } from "react-icons/hi2";
import { listarCatalogos, listarExpulsiones, listarIntegrantes, marcarEquipo, solicitarExpulsion } from "../../../api/procad";
import { useConsulta } from "../../../api/useConsulta";
import AvatarIniciales from "../../../components/procad/AvatarIniciales";
import BarraTabla, { BotonLimpiar, BuscadorTabla } from "../../../components/procad/BarraTabla";
import BotonAccion from "../../../components/procad/BotonAccion";
import BotonDecision, { SinDato } from "../../../components/procad/BotonDecision";
import { columnasDe, descargarTabla, filasDe, type CampoTabla } from "../../../components/procad/camposTabla";
import type { Dialogo } from "../../../components/procad/DialogoConfirmacion";
import PildoraEstado from "../../../components/procad/PildoraEstado";
import TablaDatos from "../../../components/procad/TablaDatos";
import { useVistaTabla } from "../../../components/procad/vistaTabla";
import type { IntegranteApi } from "../../../types/procad";
import type { Ejecutar } from "./ejecutar";

interface Fila extends IntegranteApi {
  nombre: string;
  /** Tiene una expulsión pedida que el administrador aún no resuelve. */
  expulsionPendiente: boolean;
}

interface Acciones {
  alternarEquipo: (f: Fila) => void;
  pedirExpulsion: (f: Fila) => void;
}

const CAMPOS: CampoTabla<Fila, Acciones>[] = [
  {
    label: "Estudiante",
    texto: (f) => f.nombre,
    celda: (f) => (
      <span className="flex items-center gap-2.5 whitespace-nowrap">
        <AvatarIniciales nombre={f.nombre} />
        <span className="font-medium text-slate-700">{f.nombre}</span>
      </span>
    ),
  },
  {
    label: "Cuenta",
    texto: (f) => f.numeroCuenta ?? "",
    celda: (f) => <span className="font-mono text-xs">{f.numeroCuenta ?? "—"}</span>,
  },
  {
    label: "Correo",
    texto: (f) => f.correoPersona ?? "",
    celda: (f) => f.correoPersona ?? <SinDato />,
  },
  {
    label: "Teléfono",
    texto: (f) => f.telefonoPersona ?? "",
    celda: (f) => <span className="whitespace-nowrap tabular-nums">{f.telefonoPersona ?? <SinDato />}</span>,
  },
  {
    label: "Selecciones",
    ocultaAlInicio: true,
    texto: (f) => f.selecciones.map((s) => s.nombreGrupo).join(", "),
    celda: (f) => (f.selecciones.length ? f.selecciones.map((s) => s.nombreGrupo).join(", ") : <SinDato />),
  },
  {
    label: "Equipo",
    texto: (f) => (f.esEquipo ? "Sí" : "No"),
    celda: (f, a) => (
      <BotonAccion
        tono={f.esEquipo ? "aprobar" : "neutro"}
        onClick={() => a.alternarEquipo(f)}
        title={f.esEquipo ? "Quitar del equipo que compite" : "Agregar al equipo que compite"}
      >
        {f.esEquipo ? <HiOutlineCheck className="h-3.5 w-3.5" /> : <HiOutlinePlus className="h-3.5 w-3.5" />}
        {f.esEquipo ? "En el equipo" : "Agregar"}
      </BotonAccion>
    ),
  },
  {
    label: "Expulsión",
    centrada: true,
    texto: (f) => (f.expulsionPendiente ? "Solicitada" : ""),
    celda: (f, a) =>
      f.expulsionPendiente ? (
        <PildoraEstado tono="pendiente">Solicitada</PildoraEstado>
      ) : (
        <BotonDecision tono="rechazar" etiqueta={`Pedir la expulsión de ${f.nombre}`} onClick={() => a.pedirExpulsion(f)}>
          <HiOutlineNoSymbol className="h-4 w-4" />
        </BotonDecision>
      ),
  },
];

const COLUMNAS = columnasDe(CAMPOS);

/**
 * Quienes ya son parte del grupo en el período activo. El director arma aquí
 * el equipo que compite —solo de él salen los convocados a una selección— y
 * pide la expulsión de quien lo amerite, que el administrador decide.
 */
export default function IntegrantesGrupo({
  idGrupo,
  idPeriodo,
  ejecutar,
  abrirDialogo,
}: {
  idGrupo: number;
  idPeriodo: number;
  ejecutar: Ejecutar;
  abrirDialogo: (d: Dialogo) => void;
}) {
  const integrantes = useConsulta(() => listarIntegrantes(idGrupo, idPeriodo), [idGrupo, idPeriodo]);
  const expulsiones = useConsulta(() => listarExpulsiones("PENDIENTE", idGrupo), [idGrupo]);
  const catalogos = useConsulta(listarCatalogos, []);
  const [texto, setTexto] = useState("");
  const vista = useVistaTabla("mi-grupo:integrantes", COLUMNAS);

  const filas = useMemo<Fila[]>(() => {
    const conExpulsion = new Set((expulsiones.datos ?? []).map((e) => e.idSolicitud));
    return (integrantes.datos?.integrantes ?? []).map((i) => ({
      ...i,
      nombre: [i.nombrePersona, i.apellidosPersona].filter(Boolean).join(" ") || `Cuenta ${i.numeroCuenta ?? i.idPersona}`,
      expulsionPendiente: conExpulsion.has(i.idSolicitud),
    }));
  }, [integrantes.datos, expulsiones.datos]);

  const filtradas = useMemo(() => {
    const busqueda = texto.trim().toLowerCase();
    if (!busqueda) return filas;
    return filas.filter((f) => f.nombre.toLowerCase().includes(busqueda) || (f.numeroCuenta ?? "").includes(busqueda));
  }, [filas, texto]);

  const enEquipo = filas.filter((f) => f.esEquipo).length;

  function recargarTodo() {
    integrantes.recargar();
    expulsiones.recargar();
  }

  function alternarEquipo(f: Fila) {
    ejecutar(
      () => marcarEquipo(f.idSolicitud, !f.esEquipo),
      f.esEquipo ? `Quitó a ${f.nombre} del equipo.` : `Agregó a ${f.nombre} al equipo.`,
      recargarTodo,
    );
  }

  function pedirExpulsion(f: Fila) {
    const motivos = catalogos.datos?.motivosExpulsion ?? [];
    abrirDialogo({
      titulo: `¿Pedir la expulsión de ${f.nombre}?`,
      descripcion:
        "La decide el administrador. Mientras tanto sigue siendo integrante; si la aprueba, sale del grupo en este período.",
      confirmar: "Sí, pedir expulsión",
      tono: "rechazar",
      campos: [
        {
          id: "motivo",
          label: "Motivo",
          opciones: motivos.map((m) => ({ valor: String(m.id), etiqueta: m.nombreMotivoExpulsion })),
        },
        {
          id: "detalle",
          label: "Detalle",
          multilinea: true,
          opcional: true,
          marcador: "Qué pasó y cuándo. Obligatorio si el motivo es «Otro».",
        },
      ],
      nota: "La solicitud queda a su nombre. El administrador la ve en Estudiantes → Expulsiones.",
      onConfirmar: (valores) =>
        ejecutar(
          (idPersona) =>
            solicitarExpulsion({
              idSolicitud: f.idSolicitud,
              idPersonaSolicita: idPersona,
              idMotivoExpulsion: Number(valores.motivo),
              detalleMotivo: valores.detalle?.trim() || undefined,
            }),
          `Pidió la expulsión de ${f.nombre}.`,
          recargarTodo,
        ),
    });
  }

  if (integrantes.error) {
    return <p className="rounded-2xl bg-rose-50 px-5 py-4 text-sm text-rose-700">{integrantes.error}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <BarraTabla
        conteo={
          integrantes.cargando && !integrantes.datos
            ? "Cargando…"
            : `${filas.length} ${filas.length === 1 ? "integrante" : "integrantes"} · ${enEquipo} en el equipo`
        }
        vista={vista}
        hayFilas={filtradas.length > 0}
        onDescargar={() => descargarTabla("integrantes-grupo-procad", CAMPOS, vista, filtradas, "Integrantes")}
      >
        <BuscadorTabla valor={texto} onCambiar={setTexto} marcador="Nombre o cuenta" etiqueta="Buscar por nombre o cuenta" />
        {texto.trim() !== "" && <BotonLimpiar onClick={() => setTexto("")} />}
      </BarraTabla>

      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <TablaDatos vista={vista} anchoMinimo="960px" columnas={COLUMNAS} filas={filasDe(CAMPOS, filtradas, { alternarEquipo, pedirExpulsion })} />
        {!integrantes.cargando && filas.length === 0 && (
          <p className="mt-4 text-xs text-slate-500">
            Todavía no hay integrantes este período. Entran al aprobar su solicitud en la pestaña Solicitudes.
          </p>
        )}
      </div>
    </div>
  );
}
