import {
  HiOutlineAcademicCap,
  HiOutlineCalendarDays,
  HiOutlineCheckBadge,
  HiOutlineClipboardDocumentCheck,
  HiOutlineTrophy,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import KpiProcad, { type TonoKpi } from "../../../components/procad/KpiProcad";
import type { SeriesEncabezado } from "./datos";

// A · Cifras de encabezado. Las seis cifras que abren el panel. Viven aquí, y
// no sueltas en la página, porque el reporte personalizado dibuja las mismas
// tarjetas: una sola definición, dos sitios donde salen iguales.

interface DefinicionKpi {
  numero: string;
  clave: keyof SeriesEncabezado;
  etiqueta: string;
  icono: IconType;
  tono: TonoKpi;
  sufijo?: string;
  sufijoDelta?: string;
  decimales?: number;
  requisito?: string;
}

/** El orden es el de la rejilla, no el de los números de la especificación. */
const KPIS: DefinicionKpi[] = [
  {
    numero: "1",
    clave: "asistidas",
    etiqueta: "Promedio de actividades asistidas por estudiante",
    icono: HiOutlineCalendarDays,
    tono: "azul",
    decimales: 1,
    requisito: "RF-24",
  },
  {
    numero: "4",
    clave: "estudiantes",
    etiqueta: "Estudiantes en agrupaciones",
    icono: HiOutlineUserGroup,
    tono: "destacada",
  },
  {
    numero: "2",
    clave: "preferencial",
    etiqueta: "En matrícula preferencial",
    icono: HiOutlineAcademicCap,
    tono: "ambar",
    sufijo: "%",
    sufijoDelta: " pp",
    requisito: "RF-24",
  },
  {
    numero: "3",
    clave: "elegibilidad",
    etiqueta: "Elegibilidad",
    icono: HiOutlineCheckBadge,
    tono: "esmeralda",
    sufijo: "%",
    sufijoDelta: " pp",
  },
  {
    numero: "5",
    clave: "agrupaciones",
    etiqueta: "Agrupaciones activas",
    icono: HiOutlineTrophy,
    tono: "violeta",
  },
  {
    numero: "6",
    clave: "actividades",
    etiqueta: "Actividades validadas",
    icono: HiOutlineClipboardDocumentCheck,
    tono: "cielo",
  },
];

export default function SeccionA({
  kpis,
  indicePeriodo,
  soloNumeros,
}: {
  kpis: SeriesEncabezado;
  indicePeriodo: number;
  /** Si se pasa, solo se dibujan estas cifras: es lo que usa el reporte. */
  soloNumeros?: string[];
}) {
  const visibles = soloNumeros ? KPIS.filter((k) => soloNumeros.includes(k.numero)) : KPIS;
  if (visibles.length === 0) return null;

  return (
    <div className="entra-escalonado grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {visibles.map((kpi) => (
        <KpiProcad
          key={kpi.numero}
          numero={kpi.numero}
          etiqueta={kpi.etiqueta}
          icono={kpi.icono}
          tono={kpi.tono}
          valor={kpis[kpi.clave][indicePeriodo]}
          decimales={kpi.decimales}
          sufijo={kpi.sufijo}
          sufijoDelta={kpi.sufijoDelta}
          serie={kpis[kpi.clave]}
          indiceActivo={indicePeriodo}
          requisito={kpi.requisito}
        />
      ))}
    </div>
  );
}
