import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { DIAS_CORTOS, enLargo, hoyIso, partes, semanasDelMes } from "../../utils/fechas";
import type { VisoriaProcad } from "../../types";

/**
 * El mes de visorías, en cuadrícula.
 *
 * Una lista de fechas dice cuándo es cada una; un calendario dice algo que la
 * lista esconde: que el 19 hay dos en el mismo campus y que la semana
 * siguiente está vacía. Por eso la agenda se dibuja y no se tabula.
 *
 * En pantalla angosta la cuadrícula se cambia por la agenda del mes: siete
 * columnas en 400px dan celdas de 50px, donde no cabe ni la hora.
 */

/** El aspecto de una visoría según su estado, igual en la rejilla y en la agenda. */
const CHIP: Record<VisoriaProcad["estado"], string> = {
  PROGRAMADA: "border-transparent bg-unah-navy/8 text-unah-navy hover:bg-unah-navy/14",
  // Punteado: un borrador todavía no existe para nadie más que el
  // administrador, y el borde lo dice sin gastar una palabra.
  BORRADOR: "border-dashed border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100",
};

export default function CalendarioVisorias({
  anio,
  mes,
  visorias,
  onAbrir,
}: {
  anio: number;
  mes: number;
  /** Las del período entero, ya filtradas; aquí se reparten por día. */
  visorias: VisoriaProcad[];
  onAbrir: (visoria: VisoriaProcad) => void;
}) {
  const semanas = semanasDelMes(anio, mes);
  const hoy = hoyIso();

  const porDia = new Map<string, VisoriaProcad[]>();
  for (const v of visorias) {
    const dia = porDia.get(v.fecha) ?? [];
    dia.push(v);
    porDia.set(v.fecha, dia);
  }
  for (const lista of porDia.values()) lista.sort((a, b) => horaEnMinutos(a.hora) - horaEnMinutos(b.hora));

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 sm:p-5">
      {/* Cuadrícula del mes */}
      <div className="hidden md:block">
        <div className="grid grid-cols-7 gap-1.5">
          {DIAS_CORTOS.map((dia) => (
            <div
              key={dia}
              className="pb-1 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500"
            >
              {dia}
            </div>
          ))}

          {semanas.flat().map((fecha) => {
            const delMes = partes(fecha).mes === mes;
            const delDia = porDia.get(fecha) ?? [];
            const choca = campusRepetido(delDia);

            return (
              <div
                key={fecha}
                className={`flex min-h-[104px] flex-col gap-1 rounded-xl border p-1.5 ${
                  delMes ? "border-slate-200 bg-white" : "border-transparent bg-slate-50/60"
                }`}
              >
                <div className="flex items-center justify-between px-0.5">
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold tabular-nums ${
                      fecha === hoy
                        ? "bg-unah-navy text-white"
                        : delMes
                          ? "text-slate-600"
                          : "text-slate-400"
                    }`}
                  >
                    {partes(fecha).dia}
                  </span>
                  {choca && (
                    <HiOutlineExclamationTriangle
                      className="h-3.5 w-3.5 text-amber-600"
                      title="Dos visorías el mismo día en el mismo campus"
                      aria-label="Dos visorías el mismo día en el mismo campus"
                    />
                  )}
                </div>

                {delDia.map((v) => (
                  <Chip key={v.id} visoria={v} onAbrir={onAbrir} enDosLineas />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Agenda, para cuando no caben siete columnas */}
      <div className="md:hidden">
        {[...porDia.keys()]
          .filter((fecha) => partes(fecha).mes === mes)
          .sort()
          .map((fecha) => {
            const delDia = porDia.get(fecha) ?? [];
            return (
              <div key={fecha} className="border-b border-slate-100 py-3 last:border-b-0 last:pb-0 first:pt-0">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                  {enLargo(fecha)}
                  {campusRepetido(delDia) && (
                    <HiOutlineExclamationTriangle
                      className="h-3.5 w-3.5 text-amber-600"
                      aria-label="Dos visorías el mismo día en el mismo campus"
                    />
                  )}
                </p>
                <div className="flex flex-col gap-1">
                  {delDia.map((v) => (
                    <Chip key={v.id} visoria={v} onAbrir={onAbrir} />
                  ))}
                </div>
              </div>
            );
          })}

        {[...porDia.keys()].every((fecha) => partes(fecha).mes !== mes) && (
          <p className="py-8 text-center text-sm italic text-slate-500">
            Este mes no tiene visorías.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Una visoría dentro de un día.
 *
 * En la cuadrícula va en dos líneas —la hora arriba, el grupo debajo— porque
 * una casilla mide unos 118px: en una sola línea, la hora se comía la mitad y
 * del nombre quedaba «Banda ...», que no identifica nada. En la agenda hay
 * ancho de sobra y va en una.
 */
function Chip({
  visoria,
  onAbrir,
  enDosLineas = false,
}: {
  visoria: VisoriaProcad;
  onAbrir: (v: VisoriaProcad) => void;
  enDosLineas?: boolean;
}) {
  const hora = visoria.hora.replace(":00", "");
  return (
    <button
      type="button"
      onClick={() => onAbrir(visoria)}
      title={`${visoria.hora} · ${visoria.grupo} · ${visoria.centro}`}
      aria-label={`Ver la visoría de ${visoria.grupo}, ${enLargo(visoria.fecha)} a las ${visoria.hora}`}
      className={`w-full rounded-md border px-1.5 py-1 text-left text-[11px] font-semibold leading-tight transition-colors duration-150 ${CHIP[visoria.estado]}`}
    >
      {enDosLineas ? (
        <>
          <span className="block tabular-nums opacity-70">{hora}</span>
          <span className="block truncate">{visoria.grupo}</span>
        </>
      ) : (
        <span className="block truncate">
          <span className="tabular-nums opacity-70">{hora}</span> {visoria.grupo}
        </span>
      )}
    </button>
  );
}

/** «3:00 PM» → minutos desde medianoche, para ordenar el día por hora. */
function horaEnMinutos(hora: string): number {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(hora.trim());
  if (!m) return 0;
  const tarde = m[3].toUpperCase() === "PM";
  const h = Number(m[1]) % 12;
  return (tarde ? h + 12 : h) * 60 + Number(m[2]);
}

/**
 * Si dos visorías del mismo día caen en el mismo campus.
 *
 * Es el único cruce que estorba de verdad: dos pruebas a la vez en campus
 * distintos no se pisan —son otra cancha y otro personal—, pero dos en el
 * mismo sitio se reparten el gimnasio, los evaluadores y los aspirantes que
 * se apuntaron a las dos.
 */
function campusRepetido(delDia: VisoriaProcad[]): boolean {
  const vistos = new Set<string>();
  for (const v of delDia) {
    if (vistos.has(v.centro)) return true;
    vistos.add(v.centro);
  }
  return false;
}
