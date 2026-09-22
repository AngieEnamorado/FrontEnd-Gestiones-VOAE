import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import SinIdentidad from "../../components/giras/SinIdentidad";
import { eliminarSolicitud, listarSolicitudes } from "../../api/giras";
import { mensajeDeError } from "../../api/cliente";
import { useConsulta } from "../../api/useConsulta";
import { useIdentidadGira } from "../../context/UserContext";
import { etiquetaPeriodo, fechaCorta } from "../../utils/girasFormato";

function CeldaOpcional({ valor, vacio }: { valor?: string | null; vacio: string }) {
  if (!valor) return <span className="text-slate-400 italic">{vacio}</span>;
  return <>{valor}</>;
}

export default function Borradores() {
  const navigate = useNavigate();
  const identidad = useIdentidadGira();
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const idUsuario = identidad?.idUsuarioUnidad;
  const { datos, cargando, error, recargar } = useConsulta(
    () =>
      idUsuario === undefined
        ? Promise.resolve([])
        : listarSolicitudes({ estado: "Borrador", jefeMision: idUsuario }),
    [idUsuario],
  );
  const borradores = datos ?? [];

  async function eliminar(idSolicitud: number) {
    if (!window.confirm(`¿Eliminar el borrador SOL-${idSolicitud}? No se puede deshacer.`)) return;
    setErrorAccion(null);
    try {
      await eliminarSolicitud(idSolicitud);
      recargar();
    } catch (causa) {
      setErrorAccion(mensajeDeError(causa));
    }
  }

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

        {!identidad ? (
          <div className="mt-6">
            <SinIdentidad rol="Jefe de misión" />
          </div>
        ) : (
          <>
            {errorAccion && (
              <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                {errorAccion}
              </p>
            )}

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
                  {borradores.map((fila) => (
                    <tr key={fila.idSolicitud} className="bg-white transition-colors duration-150 hover:bg-slate-100">
                      <td className="px-4 py-4">
                        <span className="inline-block rounded-md bg-pink-100 px-2 py-1 font-mono text-xs font-semibold text-rose-800">
                          SOL-{fila.idSolicitud}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700">
                        <CeldaOpcional valor={fila.destinoGira} vacio="Pendiente de llenar" />
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <CeldaOpcional valor={fila.categorias} vacio="Pendiente de llenar" />
                      </td>
                      <td className="px-4 py-4 text-slate-600">{fila.nombreCampus}</td>
                      <td className="px-4 py-4 text-slate-600">{etiquetaPeriodo(fila.anioPeriodo, fila.numeroPac)}</td>
                      <td className="px-4 py-4 text-slate-500">{fechaCorta(fila.fechaSalidaPropuesta)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            title="Continuar editando"
                            aria-label={`Continuar editando SOL-${fila.idSolicitud}`}
                            onClick={() => navigate(`/giras/solicitudes/borradores/${fila.idSolicitud}/editar`)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          >
                            <HiOutlinePencilSquare className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="Eliminar borrador"
                            aria-label={`Eliminar SOL-${fila.idSolicitud}`}
                            onClick={() => eliminar(fila.idSolicitud)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                          >
                            <HiOutlineTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {cargando && borradores.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                        Cargando borradores…
                      </td>
                    </tr>
                  )}

                  {error && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm font-medium text-rose-600">
                        {error}
                      </td>
                    </tr>
                  )}

                  {!cargando && !error && borradores.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                        No hay borradores guardados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
