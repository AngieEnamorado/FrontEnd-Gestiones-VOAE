import SinDatos from "./SinDatos";

export interface ColumnaTabla {
  label: string;
  /** Alinea a la derecha y usa cifras tabulares: así los números se comparan en columna. */
  numerica?: boolean;
}

interface TablaDatosProps {
  columnas: ColumnaTabla[];
  filas: React.ReactNode[][];
  anchoMinimo?: string;
}

/**
 * Tabla con el encabezado navy de la plataforma. Además de ser una forma de
 * mostrar datos por sí sola, es el respaldo accesible de los gráficos: todo
 * valor que un color insinúa está escrito en alguna tabla.
 */
export default function TablaDatos({ columnas, filas, anchoMinimo = "560px" }: TablaDatosProps) {
  if (filas.length === 0) return <SinDatos />;

  return (
    <div className="table-scrollbar overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full text-left text-sm" style={{ minWidth: anchoMinimo }}>
        <thead>
          <tr className="bg-unah-navy text-[11px] font-semibold uppercase tracking-wide text-white">
            {columnas.map((c) => (
              <th
                key={c.label}
                scope="col"
                className={`whitespace-nowrap px-4 py-2.5 ${c.numerica ? "text-right" : ""}`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filas.map((fila, i) => (
            <tr key={i} className="bg-white transition-colors duration-150 hover:bg-slate-50">
              {fila.map((celda, j) => (
                <td
                  key={j}
                  className={`px-4 py-3 text-slate-600 ${
                    columnas[j]?.numerica ? "text-right" : ""
                  }`}
                  style={columnas[j]?.numerica ? { fontVariantNumeric: "tabular-nums" } : undefined}
                >
                  {celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
