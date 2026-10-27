import { useMemo, useState } from "react";
import { HiOutlineArrowUturnLeft, HiOutlineCheck, HiOutlineSparkles, HiOutlineXMark } from "react-icons/hi2";
import { listarCondicionadosDeGrupo, proponerCondicionado, resolverSolicitud } from "../../../api/procad";
import { useConsulta } from "../../../api/useConsulta";
import AvatarIniciales from "../../../components/procad/AvatarIniciales";
import BarraTabla, { BotonLimpiar, BuscadorTabla } from "../../../components/procad/BarraTabla";
import BotonDecision, { SinAccion, SinDato } from "../../../components/procad/BotonDecision";
import ChipsFiltro from "../../../components/procad/ChipsFiltro";
import { columnasDe, descargarTabla, filasDe, type CampoTabla } from "../../../components/procad/camposTabla";
import type { Dialogo } from "../../../components/procad/DialogoConfirmacion";
import PildoraEstado from "../../../components/procad/PildoraEstado";
import TablaDatos from "../../../components/procad/TablaDatos";
import { useVistaTabla } from "../../../components/procad/vistaTabla";
import type { CodigoEstadoSolicitud, DecisionSolicitud, SolicitudApi } from "../../../types/procad";
import type { Ejecutar } from "./ejecutar";

/** Una solicitud con lo que la lista no trae: si su condicionado ya se propuso. */
interface Fila extends SolicitudApi {
  nombre: string;
  condicionadoPropuesto: boolean;
}

interface Acciones {
  decidir: (f: Fila, decision: DecisionSolicitud) => void;
  proponer: (f: Fila) => void;
}

const TONO_ESTADO: Record<CodigoEstadoSolicitud, Parameters<typeof PildoraEstado>[0]["tono"]> = {
  PENDIENTE: "pendiente",
  APROBADO: "activo",
  OBSERVADO: "info",
  NO_CUMPLE_REQUISITO: "negativo",
  EXPULSADO: "negativo",
};

/** Lo que impide aprobar ya, o null si se puede. */
function bloqueoParaAprobar(f: Fila): string | null {
  if (f.codigoEstado !== "PENDIENTE") return "Ya resuelta";
  if (f.cumpleIndiceMinimo || f.esCondicionado) return null;
  return f.condicionadoPropuesto
    ? "Espera la firma del administrador como condicionado"
    : "No alcanza el índice mínimo: propóngalo como condicionado";
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
    label: "Carrera",
    ocultaAlInicio: true,
    texto: (f) => f.carreraEstudiante ?? "",
    celda: (f) => <span className="whitespace-nowrap">{f.carreraEstudiante ?? <SinDato />}</span>,
  },
  {
    label: "Índice",
    numerica: true,
    texto: (f) => (f.indiceGlobal === null ? "" : String(f.indiceGlobal)),
    celda: (f) =>
      f.indiceGlobal === null ? (
        <SinDato />
      ) : (
        <span className={f.cumpleIndiceMinimo ? "text-slate-700" : "font-semibold text-rose-600"}>
          {f.indiceGlobal}
        </span>
      ),
  },
  {
    label: "Estado",
    texto: (f) => f.nombreEstado,
    celda: (f) => <PildoraEstado tono={TONO_ESTADO[f.codigoEstado]}>{f.nombreEstado}</PildoraEstado>,
  },
  {
    label: "Condicionado",
    centrada: true,
    texto: (f) =>
      f.esCondicionado ? "Autorizado" : f.condicionadoPropuesto ? "Propuesto" : f.cumpleIndiceMinimo ? "" : "Sin proponer",
    celda: (f, a) => {
      if (f.esCondicionado) return <PildoraEstado tono="activo">Autorizado</PildoraEstado>;
      if (f.condicionadoPropuesto) return <PildoraEstado tono="pendiente">Propuesto</PildoraEstado>;
      if (f.cumpleIndiceMinimo) return <SinAccion razon="Cumple el índice mínimo" />;
      if (f.codigoEstado !== "PENDIENTE") return <SinAccion />;
      return (
        <BotonDecision tono="primario" etiqueta={`Proponer a ${f.nombre} como condicionado`} onClick={() => a.proponer(f)}>
          <HiOutlineSparkles className="h-4 w-4" />
        </BotonDecision>
      );
    },
  },
  {
    label: "Aprobar",
    centrada: true,
    exportable: false,
    texto: () => "",
    celda: (f, a) => {
      const bloqueo = bloqueoParaAprobar(f);
      return bloqueo ? (
        <SinAccion razon={bloqueo} />
      ) : (
        <BotonDecision tono="aprobar" etiqueta={`Aprobar a ${f.nombre}`} onClick={() => a.decidir(f, "APROBADO")}>
          <HiOutlineCheck className="h-4 w-4" />
        </BotonDecision>
      );
    },
  },
  {
    label: "Observar",
    centrada: true,
    exportable: false,
    texto: () => "",
    celda: (f, a) =>
      f.codigoEstado !== "PENDIENTE" ? (
        <SinAccion />
      ) : (
        <BotonDecision tono="observar" etiqueta={`Observar la solicitud de ${f.nombre}`} onClick={() => a.decidir(f, "OBSERVADO")}>
          <HiOutlineArrowUturnLeft className="h-4 w-4" />
        </BotonDecision>
      ),
  },
  {
    label: "No cumple",
    centrada: true,
    exportable: false,
    texto: () => "",
    celda: (f, a) =>
      f.codigoEstado !== "PENDIENTE" ? (
        <SinAccion />
      ) : (
        <BotonDecision
          tono="rechazar"
          etiqueta={`Marcar que ${f.nombre} no cumple el requisito`}
          onClick={() => a.decidir(f, "NO_CUMPLE_REQUISITO")}
        >
          <HiOutlineXMark className="h-4 w-4" />
        </BotonDecision>
      ),
  },
];

const COLUMNAS = columnasDe(CAMPOS);

type Corte = "pendientes" | "resueltas" | "todas";

const TEXTO_DECISION: Record<DecisionSolicitud, { titulo: string; confirmar: string; hecho: string }> = {
  APROBADO: { titulo: "¿Aprobar a", confirmar: "Sí, aprobar", hecho: "Aprobó a" },
  OBSERVADO: { titulo: "¿Observar la solicitud de", confirmar: "Sí, observar", hecho: "Observó la solicitud de" },
  NO_CUMPLE_REQUISITO: { titulo: "¿Marcar que no cumple el requisito", confirmar: "Sí, no cumple", hecho: "Marcó sin requisito a" },
};

/**
 * Las solicitudes de ingreso a su grupo en el período activo. El director es
 * quien conoce al estudiante: aprueba, observa (devuelve con lo que hay que
 * corregir) o marca que no cumple, y propone como condicionado a quien tiene
 * el talento pero no el índice. Esa propuesta la firma después el administrador.
 */
export default function SolicitudesGrupo({
  idGrupo,
  idPeriodo,
  consulta,
  ejecutar,
  abrirDialogo,
}: {
  idGrupo: number;
  idPeriodo: number;
  consulta: { datos: SolicitudApi[] | null; cargando: boolean; error: string | null };
  ejecutar: Ejecutar;
  abrirDialogo: (d: Dialogo) => void;
}) {
  const condicionados = useConsulta(() => listarCondicionadosDeGrupo(idGrupo, idPeriodo), [idGrupo, idPeriodo]);
  const [corte, setCorte] = useState<Corte>("pendientes");
  const [texto, setTexto] = useState("");
  const vista = useVistaTabla("mi-grupo:solicitudes", COLUMNAS);

  const filas = useMemo<Fila[]>(() => {
    const propuestos = new Set(
      (condicionados.datos ?? []).filter((c) => c.idPersonaProponeCondicionado !== null).map((c) => c.idSolicitud),
    );
    return (consulta.datos ?? []).map((s) => ({
      ...s,
      nombre: [s.nombrePersona, s.apellidosPersona].filter(Boolean).join(" ") || `Cuenta ${s.numeroCuenta ?? s.idPersona}`,
      condicionadoPropuesto: propuestos.has(s.idSolicitud),
    }));
  }, [consulta.datos, condicionados.datos]);

  const conteo = {
    pendientes: filas.filter((f) => f.codigoEstado === "PENDIENTE").length,
    resueltas: filas.filter((f) => f.codigoEstado !== "PENDIENTE").length,
    todas: filas.length,
  };

  const filtradas = useMemo(() => {
    const busqueda = texto.trim().toLowerCase();
    return filas
      .filter((f) => corte === "todas" || (corte === "pendientes") === (f.codigoEstado === "PENDIENTE"))
      .filter((f) => !busqueda || f.nombre.toLowerCase().includes(busqueda) || (f.numeroCuenta ?? "").includes(busqueda));
  }, [filas, corte, texto]);

  function decidir(f: Fila, decision: DecisionSolicitud) {
    const t = TEXTO_DECISION[decision];
    abrirDialogo({
      titulo: decision === "NO_CUMPLE_REQUISITO" ? `${t.titulo} de ${f.nombre}?` : `${t.titulo} ${f.nombre}?`,
      descripcion:
        decision === "APROBADO"
          ? `Entra a ${f.nombreGrupo} como integrante en este período.`
          : decision === "OBSERVADO"
            ? "La solicitud vuelve al estudiante. Diga qué tiene que corregir: es lo único que va a leer."
            : "La solicitud se cierra sin ingreso. Explique cuál requisito no cumple.",
      confirmar: t.confirmar,
      tono: decision === "APROBADO" ? "aprobar" : decision === "OBSERVADO" ? "primario" : "rechazar",
      campos:
        decision === "APROBADO"
          ? undefined
          : [
              {
                id: "observacion",
                label: decision === "OBSERVADO" ? "Qué debe corregir" : "Requisito que no cumple",
                multilinea: true,
                marcador:
                  decision === "OBSERVADO" ? "Ej. Falta la constancia de matrícula." : "Ej. No se presentó a la visoría.",
              },
            ],
      nota: "La decisión queda registrada a su nombre en el historial de la solicitud.",
      onConfirmar: (valores) =>
        ejecutar(
          (idPersona) =>
            resolverSolicitud(f.idSolicitud, { decision, idPersona, observacion: valores.observacion?.trim() || undefined }),
          `${t.hecho} ${f.nombre}.`,
        ),
    });
  }

  function proponer(f: Fila) {
    abrirDialogo({
      titulo: `¿Proponer a ${f.nombre} como condicionado?`,
      descripcion: `Su índice global (${f.indiceGlobal ?? "sin dato"}) no alcanza el mínimo. Como condicionado puede entrar por su talento, si el administrador lo autoriza.`,
      confirmar: "Sí, proponer",
      tono: "primario",
      nota: "Usted es la primera firma. La solicitud sigue pendiente hasta que el administrador ponga la segunda; después podrá aprobarla.",
      onConfirmar: () =>
        ejecutar(
          (idPersona) => proponerCondicionado(f.idSolicitud, idPersona),
          `Propuso a ${f.nombre} como condicionado.`,
          condicionados.recargar,
        ),
    });
  }

  if (consulta.error) {
    return <p className="rounded-2xl bg-rose-50 px-5 py-4 text-sm text-rose-700">{consulta.error}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <ChipsFiltro<Corte>
        etiqueta="Filtrar solicitudes por estado"
        activa={corte}
        onCambiar={setCorte}
        opciones={[
          { id: "pendientes", label: "Pendientes", conteo: conteo.pendientes },
          { id: "resueltas", label: "Resueltas", conteo: conteo.resueltas },
          { id: "todas", label: "Todas", conteo: conteo.todas },
        ]}
      />

      <BarraTabla
        conteo={consulta.cargando && !consulta.datos ? "Cargando…" : `${filtradas.length} de ${filas.length}`}
        vista={vista}
        hayFilas={filtradas.length > 0}
        onDescargar={() => descargarTabla("solicitudes-grupo-procad", CAMPOS, vista, filtradas, "Solicitudes")}
      >
        <BuscadorTabla valor={texto} onCambiar={setTexto} marcador="Nombre o cuenta" etiqueta="Buscar por nombre o cuenta" />
        {texto.trim() !== "" && <BotonLimpiar onClick={() => setTexto("")} />}
      </BarraTabla>

      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <TablaDatos vista={vista} anchoMinimo="940px" columnas={COLUMNAS} filas={filasDe(CAMPOS, filtradas, { decidir, proponer })} />
        {!consulta.cargando && filas.length === 0 && (
          <p className="mt-4 text-xs text-slate-500">
            Nadie ha pedido entrar a este grupo en el período activo. Las solicitudes aparecen aquí en cuanto el
            estudiante las envía.
          </p>
        )}
      </div>
    </div>
  );
}
