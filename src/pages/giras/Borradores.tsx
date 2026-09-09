import { useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineEye } from "react-icons/hi2";
import { borradoresGiras } from "../../data/mockBorradoresGiras";

function CeldaOpcional({ valor, vacio }: { valor?: string; vacio: string }) {
  if (!valor) return <span className="text-slate-400 italic">{vacio}</span>;
  return <>{valor}</>;
}

export default function Borradores() {
  const navigate = useNavigate();

  return (
    <>
      <button
        type="button"
        onClick={() => navigate("/giras/solicitudes")}
        className="mb-4 flex items-center gap-2 rounded-lg bg-unah-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
      >
        <HiOutlineArrowLeft className="h-4 w-4" />
        Regresar
      </button>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {/* Encabezado */}
        <div>
          <p className="text-xs font-bold tracking-wider text-unah-orange">GIRAS</p>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Borradores de Solicitud</h1>
        </div>

        {/* Tabla */}
        <div className="table-scrollbar mt-6 overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Destino</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Centro</th>
                <th className="px-4 py-3">Período</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-center">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {borradoresGiras.map((fila) => (
                <tr key={fila.id} className="bg-white hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <span className="inline-block rounded-md bg-pink-100 px-2 py-1 font-mono text-xs font-semibold text-rose-800">
                      {fila.id}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-700">
                    <CeldaOpcional valor={fila.destino} vacio="Pendiente de llenar" />
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <CeldaOpcional valor={fila.categoria} vacio="Pendiente de llenar" />
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <CeldaOpcional valor={fila.centro} vacio="—" />
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <CeldaOpcional valor={fila.periodo} vacio="—" />
                  </td>
                  <td className="px-4 py-4 text-slate-500">
                    <CeldaOpcional valor={fila.fecha} vacio="—" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        title="Continuar editando"
                        onClick={() => navigate(`/giras/solicitudes/borradores/${fila.id}/editar`)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      >
                        <HiOutlineEye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {borradoresGiras.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                    No hay borradores guardados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
