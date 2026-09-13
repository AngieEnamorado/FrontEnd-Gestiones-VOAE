import TablaDatos, { type ColumnaTabla } from "../../components/procad/TablaDatos";
import { sinLetraDeApartado } from "../../utils/nombreDeReporte";
import type { BloqueReporte } from "./secciones/pdf";

/** Una columna se alinea a la derecha cuando todo lo que lleva son cifras. */
function esNumerica(filas: (string | number)[][], indice: number): boolean {
  const valores = filas.map((f) => f[indice]).filter((v) => v !== undefined && v !== "");
  if (valores.length === 0) return false;
  return valores.every(
    (v) => typeof v === "number" || /^-?[\d.,]+\s*(%|pp)?$/.test(String(v).trim()),
  );
}

/**
 * El reporte en modo tablas: las mismas cifras que dibujan las gráficas, pero
 * en la forma que se adjunta a un oficio.
 *
 * Es exactamente lo que va a salir en el PDF —mismos bloques, mismo orden,
 * mismas filas—, y esa es la razón de que exista esta vista: que lo que se
 * descarga se pueda ver antes en pantalla, sin sorpresas al abrir el archivo.
 */
export default function TablasDelReporte({ bloques }: { bloques: BloqueReporte[] }) {
  return (
    <div className="entra-escalonado flex flex-col gap-5">
      {bloques.map((bloque) => {
        const columnas: ColumnaTabla[] = bloque.columnas.map((label, i) => ({
          label,
          numerica: i > 0 && esNumerica(bloque.filas, i),
        }));

        return (
          <section key={bloque.id} className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-3.5 text-base font-bold text-slate-800">
              <span
                aria-hidden="true"
                className="mr-2.5 inline-block h-1.5 w-1.5 rounded-full bg-unah-orange align-middle"
              />
              {sinLetraDeApartado(bloque.titulo)}
            </h3>
            <TablaDatos anchoMinimo="520px" columnas={columnas} filas={bloque.filas} />
          </section>
        );
      })}
    </div>
  );
}
