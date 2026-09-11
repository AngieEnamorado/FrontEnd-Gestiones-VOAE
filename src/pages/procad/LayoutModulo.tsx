import CajaPendientes from "../../components/procad/CajaPendientes";
import PestanasModulo, { type OpcionPestana } from "../../components/procad/PestanasModulo";

interface LayoutModuloProps<T extends string> {
  titulo: string;
  descripcion: string;
  /** Acción principal del módulo, si tiene una. */
  accion?: React.ReactNode;
  pestanas: OpcionPestana<T>[];
  activa: T;
  onCambiar: (id: T) => void;
  nombre: string;
  /**
   * Lo que este módulo tiene sin resolver. Se omite en los módulos que por
   * naturaleza nunca acumulan pendientes: una caja de "todo al día" que jamás
   * cambia no informa, solo ocupa espacio.
   */
  pendientes?: string[];
  mensajeSinPendientes?: string;
  children: React.ReactNode;
}

/**
 * Estructura común de los módulos de administración: encabezado, pendientes
 * propios, pestañas y contenido. Tenerla en un solo lugar es lo que hace que
 * los cuatro módulos se sientan la misma pantalla y no cuatro páginas sueltas.
 */
export default function LayoutModulo<T extends string>({
  titulo,
  descripcion,
  accion,
  pestanas,
  activa,
  onCambiar,
  nombre,
  pendientes,
  mensajeSinPendientes,
  children,
}: LayoutModuloProps<T>) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-wider text-unah-orange">PROCAD</p>
          <h1 className="text-2xl font-bold break-words text-slate-800 sm:text-3xl">{titulo}</h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500">{descripcion}</p>
        </div>
        {accion}
      </div>

      {pendientes && (
        <CajaPendientes pendientes={pendientes} mensajeVacio={mensajeSinPendientes ?? ""} />
      )}

      <div>
        <PestanasModulo
          opciones={pestanas}
          activa={activa}
          onCambiar={onCambiar}
          etiqueta={`Secciones de ${titulo}`}
          nombre={nombre}
        />
        <div
          id={`panel-${nombre}`}
          role="tabpanel"
          aria-labelledby={`${nombre}-${activa}`}
          className="pt-5"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
