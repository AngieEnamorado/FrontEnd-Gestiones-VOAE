import type { IconType } from "react-icons";

export interface PasoFormulario {
  id: string;
  label: string;
  icon: IconType;
  /** No aplica en este momento: se ve apagado, no se puede abrir y no cuenta en el progreso. */
  deshabilitado?: boolean;
}

function AnilloProgreso({ porcentaje }: { porcentaje: number }) {
  const radio = 30;
  const circunferencia = 2 * Math.PI * radio;
  const offset = circunferencia - (porcentaje / 100) * circunferencia;

  return (
    <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center">
      <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90">
        <circle cx="38" cy="38" r={radio} stroke="#e2e8f0" strokeWidth="8" fill="none" />
        <circle
          cx="38"
          cy="38"
          r={radio}
          stroke="#f5820f"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-700">{porcentaje}%</span>
    </div>
  );
}

/**
 * La barra de pasos de un formulario largo: los pasos con su icono, la línea
 * que se va llenando y el anillo de progreso. Tiene el mismo aspecto que la de
 * "Nueva solicitud". Los pasos `deshabilitado` no cuentan para "Paso X de Y".
 */
export default function StepperFormulario({
  pasos,
  pasoActivo,
  onIr,
}: {
  pasos: PasoFormulario[];
  pasoActivo: number;
  onIr: (indice: number) => void;
}) {
  const aplicables = pasos.filter((paso) => !paso.deshabilitado);
  const posicion = aplicables.findIndex((paso) => paso.id === pasos[pasoActivo]?.id) + 1;
  const porcentaje = Math.round((posicion / aplicables.length) * 100);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-start overflow-x-auto">
          {pasos.map((paso, indice) => {
            const Icon = paso.icon;
            const activo = indice === pasoActivo;
            const completado = indice < pasoActivo;
            const esUltimo = indice === pasos.length - 1;
            return (
              <div key={paso.id} className={`flex items-start ${esUltimo ? "" : "flex-1"}`}>
                <button
                  type="button"
                  disabled={paso.deshabilitado}
                  aria-current={activo ? "step" : undefined}
                  title={paso.deshabilitado ? "No aplica" : undefined}
                  onClick={() => onIr(indice)}
                  className="flex w-[92px] shrink-0 flex-col items-center gap-2 text-center disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                      !paso.deshabilitado && (activo || completado)
                        ? "bg-unah-orange text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={`text-[11px] font-medium leading-tight ${
                      activo ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    {paso.label}
                    {paso.deshabilitado && <span className="block font-normal">No aplica</span>}
                  </span>
                </button>

                {!esUltimo && (
                  <div
                    className={`mt-5 h-px flex-1 ${completado ? "bg-unah-orange" : "bg-slate-200"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center self-center">
          <AnilloProgreso porcentaje={porcentaje} />
          <p className="mt-2 text-xs font-medium text-slate-400">
            Paso {posicion} de {aplicables.length}
          </p>
        </div>
      </div>
    </div>
  );
}
