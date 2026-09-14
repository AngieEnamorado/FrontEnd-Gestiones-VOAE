import { useMemo, useState } from "react";
import BarraTabla, {
  BotonLimpiar,
  BuscadorTabla,
  CLASE_FILTRO,
} from "../../../components/procad/BarraTabla";
import { SinDato } from "../../../components/procad/BotonDecision";
import {
  columnasDe,
  descargarTabla,
  filasDe,
  type CampoTabla,
} from "../../../components/procad/camposTabla";
import ChipsFiltro from "../../../components/procad/ChipsFiltro";
import PildoraEstado from "../../../components/procad/PildoraEstado";
import TablaDatos from "../../../components/procad/TablaDatos";
import { useVistaTabla } from "../../../components/procad/vistaTabla";
import { COLOR_TIPO, ETIQUETA_TIPO } from "../../../components/procad/paleta";
import { CENTROS, agrupacionesProcad } from "../../../data/mockProcadEstadisticas";
import type { AgrupacionProcad, TipoAgrupacion } from "../../../types";

type FiltroTipo = TipoAgrupacion | "todos";

/** Qué hace la agrupación: el deporte si es deportiva, las disciplinas si es artística. */
function queHace(a: AgrupacionProcad): string {
  return a.tipo === "deportivo" ? (a.deporte ?? "") : (a.disciplinas ?? []).join(", ");
}

const CAMPOS: CampoTabla<AgrupacionProcad>[] = [
  {
    label: "Agrupación",
    texto: (a) => a.nombre,
    // El punto de color repite la clasificación que ya dice la columna de al
    // lado. Es a propósito: al recorrer la lista de arriba abajo, el ojo separa
    // deportivas de artísticas sin tener que leer la palabra cada vez.
    celda: (a) => (
      <span className="flex items-center gap-2.5 whitespace-nowrap">
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: COLOR_TIPO[a.tipo] }}
        />
        <span className="font-medium text-slate-700">{a.nombre}</span>
      </span>
    ),
  },
  {
    label: "Clasificación",
    texto: (a) => ETIQUETA_TIPO[a.tipo],
    celda: (a) => ETIQUETA_TIPO[a.tipo],
  },
  {
    label: "Centro",
    texto: (a) => a.centro,
    celda: (a) => <span className="whitespace-nowrap">{a.centro}</span>,
  },
  {
    label: "Disciplina / Deporte",
    texto: queHace,
    celda: (a) => {
      const texto = queHace(a);
      return texto ? (
        <span className="block max-w-[240px] whitespace-normal">{texto}</span>
      ) : (
        <SinDato />
      );
    },
  },
  {
    label: "Estudiantes",
    numerica: true,
    texto: (a) => String(a.estudiantes),
    celda: (a) => a.estudiantes,
  },
  {
    label: "% elegibilidad",
    numerica: true,
    texto: (a) => `${a.elegibilidad}%`,
    celda: (a) => `${a.elegibilidad}%`,
  },
  {
    label: "% cumplimiento",
    numerica: true,
    texto: (a) => `${a.cumplimiento}%`,
    celda: (a) => `${a.cumplimiento}%`,
  },
  {
    label: "Selección",
    centrada: true,
    texto: (a) => (a.esSeleccion ? "Sí" : "No"),
    celda: (a) =>
      a.esSeleccion ? (
        <PildoraEstado tono="activo">Sí</PildoraEstado>
      ) : (
        <SinDato />
      ),
  },
  // De aquí para abajo, el detalle que casi nunca se mira y que alguna vez hace
  // falta. Apagadas de inicio: la vista de todos los días no debe llegar a
  // veinte columnas para que exista la que se necesita una vez al mes.
  {
    label: "Actividades",
    numerica: true,
    ocultaAlInicio: true,
    texto: (a) => String(a.actividades),
    celda: (a) => a.actividades,
  },
  {
    label: "Validadas",
    numerica: true,
    ocultaAlInicio: true,
    texto: (a) => String(a.validadas),
    celda: (a) => a.validadas,
  },
  {
    label: "Inscritos",
    numerica: true,
    ocultaAlInicio: true,
    texto: (a) => String(a.inscritos),
    celda: (a) => a.inscritos,
  },
  {
    label: "Asistencias",
    numerica: true,
    ocultaAlInicio: true,
    texto: (a) => String(a.asistencias),
    celda: (a) => a.asistencias,
  },
  {
    label: "Aspirantes",
    numerica: true,
    ocultaAlInicio: true,
    texto: (a) => String(a.aspirantes),
    celda: (a) => a.aspirantes,
  },
  {
    label: "Citados",
    numerica: true,
    ocultaAlInicio: true,
    texto: (a) => String(a.citados),
    celda: (a) => a.citados,
  },
  {
    label: "Matrícula preferencial",
    numerica: true,
    ocultaAlInicio: true,
    texto: (a) => String(a.preferencial),
    celda: (a) => a.preferencial,
  },
  {
    label: "PROSENE",
    numerica: true,
    ocultaAlInicio: true,
    texto: (a) => String(a.prosene),
    celda: (a) => a.prosene,
  },
  {
    label: "Condicionados",
    numerica: true,
    ocultaAlInicio: true,
    texto: (a) => String(a.condicionados),
    celda: (a) => a.condicionados,
  },
  {
    label: "Expulsiones",
    numerica: true,
    ocultaAlInicio: true,
    texto: (a) => String(a.expulsiones),
    celda: (a) => a.expulsiones,
  },
  {
    label: "Mujeres",
    numerica: true,
    ocultaAlInicio: true,
    texto: (a) => String(a.sexoF),
    celda: (a) => a.sexoF,
  },
  {
    // El colaborador externo nunca tiene acceso al panel: el administrador
    // actúa en su nombre. La columna está para saber a quién hay que llamar,
    // no para dar de alta a nadie.
    label: "Dirigida por externo",
    centrada: true,
    ocultaAlInicio: true,
    texto: (a) => (a.colaboradorExterno ? "Sí" : "No"),
    celda: (a) =>
      a.colaboradorExterno ? (
        <PildoraEstado tono="pendiente">Sí</PildoraEstado>
      ) : (
        <SinDato />
      ),
  },
];

const COLUMNAS = columnasDe(CAMPOS);

/** Todas las agrupaciones activas del período, en un solo lugar. */
export default function ListaAgrupaciones() {
  const [tipo, setTipo] = useState<FiltroTipo>("todos");
  const [centro, setCentro] = useState("todos");
  const [texto, setTexto] = useState("");
  const vista = useVistaTabla("agrupaciones:lista", COLUMNAS);

  const filtradas = useMemo(() => {
    const busqueda = texto.trim().toLowerCase();
    return agrupacionesProcad.filter((a) => {
      if (tipo !== "todos" && a.tipo !== tipo) return false;
      if (centro !== "todos" && a.centro !== centro) return false;
      if (
        busqueda &&
        !a.nombre.toLowerCase().includes(busqueda) &&
        !queHace(a).toLowerCase().includes(busqueda)
      ) {
        return false;
      }
      return true;
    });
  }, [tipo, centro, texto]);

  const hayFiltros = tipo !== "todos" || centro !== "todos" || texto.trim() !== "";

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
        Una agrupación artística puede cubrir más de una disciplina a la vez, por eso esa columna
        llega a listar varias.
      </p>

      <BarraTabla
        conteo={
          filtradas.length === agrupacionesProcad.length
            ? `${agrupacionesProcad.length} agrupaciones`
            : `${filtradas.length} de ${agrupacionesProcad.length}`
        }
        vista={vista}
        hayFilas={filtradas.length > 0}
        onDescargar={() => descargarTabla("agrupaciones-procad", CAMPOS, vista, filtradas)}
      >
        <ChipsFiltro
          etiqueta="Filtrar por clasificación"
          activa={tipo}
          onCambiar={setTipo}
          opciones={[
            { id: "todos", label: "Todas" },
            { id: "deportivo", label: "Deportivas" },
            { id: "artistico", label: "Artísticas" },
          ]}
        />

        <select
          value={centro}
          onChange={(e) => setCentro(e.target.value)}
          aria-label="Centro"
          className={`${CLASE_FILTRO} w-[190px]`}
        >
          <option value="todos">Todos los centros</option>
          {CENTROS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <BuscadorTabla
          valor={texto}
          onCambiar={setTexto}
          marcador="Agrupación o disciplina"
          etiqueta="Buscar por agrupación o disciplina"
          ancho="w-[230px]"
        />

        {hayFiltros && (
          <BotonLimpiar
            onClick={() => {
              setTipo("todos");
              setCentro("todos");
              setTexto("");
            }}
          />
        )}
      </BarraTabla>

      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <TablaDatos
          vista={vista}
          anchoMinimo="1180px"
          columnas={COLUMNAS}
          filas={filasDe(CAMPOS, filtradas, undefined)}
        />
      </div>
    </div>
  );
}
