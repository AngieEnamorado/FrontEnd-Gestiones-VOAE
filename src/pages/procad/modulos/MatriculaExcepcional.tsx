import { useMemo, useState } from "react";
import { HiOutlinePlus } from "react-icons/hi2";
import AvatarIniciales from "../../../components/procad/AvatarIniciales";
import BarraTabla, {
  BotonLimpiar,
  BuscadorTabla,
} from "../../../components/procad/BarraTabla";
import {
  columnasDe,
  descargarTabla,
  filasDe,
  type CampoTabla,
} from "../../../components/procad/camposTabla";
import TablaDatos from "../../../components/procad/TablaDatos";
import { useVistaTabla } from "../../../components/procad/vistaTabla";
import type { Dialogo } from "../../../components/procad/DialogoConfirmacion";
import { useProcad } from "../../../context/ProcadContext";
import type { MatriculaExcepcional as Matricula } from "../../../types";

const CAMPOS: CampoTabla<Matricula>[] = [
  {
    label: "Estudiante",
    texto: (m) => m.nombre,
    celda: (m) => (
      <span className="flex items-center gap-2.5 whitespace-nowrap">
        <AvatarIniciales nombre={m.nombre} />
        <span className="font-medium text-slate-700">{m.nombre}</span>
      </span>
    ),
  },
  {
    label: "Cuenta",
    texto: (m) => m.cuenta,
    celda: (m) => <span className="font-mono text-xs">{m.cuenta}</span>,
  },
  {
    label: "Motivo",
    texto: (m) => m.motivo,
    celda: (m) => (
      <span className="block max-w-[380px] whitespace-normal leading-relaxed">{m.motivo}</span>
    ),
  },
  { label: "Período", texto: (m) => m.periodo, celda: (m) => m.periodo },
];

const COLUMNAS = columnasDe(CAMPOS);

/**
 * Elegibilidad por participar en algo puntual de VOAE sin pertenecer a ninguna
 * agrupación. Basta una firma: no hay criterio deportivo ni artístico de un
 * encargado que contrastar primero, como sí ocurre con el condicionado.
 */
export default function MatriculaExcepcional({
  abrirDialogo,
}: {
  abrirDialogo: (d: Dialogo) => void;
}) {
  const { matriculas, otorgarMatricula } = useProcad();
  const [texto, setTexto] = useState("");
  const vista = useVistaTabla("estudiantes:matricula", COLUMNAS);

  const filtradas = useMemo(() => {
    const busqueda = texto.trim().toLowerCase();
    if (!busqueda) return matriculas;
    return matriculas.filter(
      (m) => m.nombre.toLowerCase().includes(busqueda) || m.cuenta.includes(busqueda),
    );
  }, [matriculas, texto]);

  function abrirFormulario() {
    abrirDialogo({
      titulo: "Otorgar matrícula excepcional",
      descripcion: "Sin pertenecer a ningún grupo — solo requiere su firma.",
      confirmar: "Otorgar",
      tono: "primario",
      campos: [
        { id: "nombre", label: "Nombre del estudiante" },
        { id: "cuenta", label: "Número de cuenta" },
        {
          id: "motivo",
          label: "Motivo",
          multilinea: true,
          marcador: "Ej. Apoyo en la organización de un evento institucional.",
        },
      ],
      onConfirmar: (valores) =>
        otorgarMatricula({
          nombre: valores.nombre.trim(),
          cuenta: valores.cuenta.trim(),
          motivo: valores.motivo.trim(),
        }),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
        Se otorga a quien apoya algo puntual de VOAE sin pertenecer a ninguna agrupación. No pasa
        por un encargado: la firma es suya y basta.
      </p>

      <BarraTabla
        conteo={
          filtradas.length === matriculas.length
            ? `${matriculas.length} ${matriculas.length === 1 ? "otorgada" : "otorgadas"}`
            : `${filtradas.length} de ${matriculas.length}`
        }
        vista={vista}
        hayFilas={filtradas.length > 0}
        onDescargar={() => descargarTabla("matriculas-excepcionales", CAMPOS, vista, filtradas)}
        accion={
          <button
            type="button"
            onClick={abrirFormulario}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-unah-navy px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-[background-color,transform] duration-150 ease-suave hover:bg-unah-navy-dark active:scale-[0.98]"
          >
            <HiOutlinePlus className="h-4 w-4" />
            Otorgar matrícula
          </button>
        }
      >
        <BuscadorTabla
          valor={texto}
          onCambiar={setTexto}
          marcador="Nombre o cuenta"
          etiqueta="Buscar por nombre o cuenta"
        />
        {texto.trim() !== "" && <BotonLimpiar onClick={() => setTexto("")} />}
      </BarraTabla>

      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <TablaDatos
          vista={vista}
          anchoMinimo="820px"
          columnas={COLUMNAS}
          filas={filasDe(CAMPOS, filtradas, undefined as never)}
        />
      </div>
    </div>
  );
}
