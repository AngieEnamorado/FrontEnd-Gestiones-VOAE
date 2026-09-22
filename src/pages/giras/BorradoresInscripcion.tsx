import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import SinIdentidad from "../../components/giras/SinIdentidad";
import { eliminarInscripcion, listarInscripciones } from "../../api/giras";
import { mensajeDeError } from "../../api/cliente";
import { useConsulta } from "../../api/useConsulta";
import { useEstudianteActual, useIdentidadGira, useRolGira } from "../../context/UserContext";
import { fechaCorta } from "../../utils/girasFormato";

export default function BorradoresInscripcion() {
  const navigate = useNavigate();
  const { rol } = useRolGira();
  const estudiante = useEstudianteActual();
  const identidad = useIdentidadGira();
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  // El estudiante ve los borradores que armó él; el jefe de misión, los de las
  // inscripciones excepcionales que está haciendo en nombre de alguien.
  const numeroCuenta = estudiante?.numeroCuenta;
  const idUsuario = identidad?.idUsuarioUnidad;
  const sinIdentidad = rol === "estudiante" ? !estudiante : !identidad;

  const { datos, cargando, error, recargar } = useConsulta(async () => {
    if (rol === "estudiante") {
      return numeroCuenta ? listarInscripciones({ estado: "Borrador", numeroCuenta }) : [];
    }
    if (idUsuario === undefined) return [];
    const borradores = await listarInscripciones({ estado: "Borrador" });
    return borradores.filter((b) => b.idInscribidorExcepcional === idUsuario);
  }, [rol, numeroCuenta, idUsuario]);
  const borradores = datos ?? [];

  async function eliminar(idInscripcion: number) {
    if (!window.confirm(`¿Eliminar el borrador INS-${idInscripcion}? No se puede deshacer.`)) return;
    setErrorAccion(null);
    try {
      await eliminarInscripcion(idInscripcion);
      recargar();
    } catch (causa) {
      setErrorAccion(mensajeDeError(causa));
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => navigate("/giras/inscripciones")}
        className="mb-4 flex items-center gap-2 rounded-lg bg-unah-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
      >
        <HiOutlineArrowLeft className="h-4 w-4" />
        Regresar
      </button>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {/* Encabezado */}
        <div>
          <p className="text-xs font-bold tracking-wider text-unah-orange">GIRAS</p>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Borradores de Inscripción</h1>
        </div>

        {sinIdentidad ? (
          <div className="mt-6">
            <SinIdentidad rol={rol === "estudiante" ? "Estudiante" : "Jefe de misión"} />
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
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Estudiante</th>
                    <th className="px-4 py-3">Gira / Destino</th>
                    <th className="px-4 py-3">Guardado</th>
                    <th className="px-4 py-3 text-center">Opciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {borradores.map((fila) => (
                    <tr key={fila.idInscripcion} className="bg-white transition-colors duration-150 hover:bg-slate-100">
                      <td className="px-4 py-4">
                        <span className="inline-block rounded-md bg-pink-100 px-2 py-1 font-mono text-xs font-semibold text-rose-800">
                          INS-{fila.idInscripcion}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700">{fila.nombreViajero}</td>
                      <td className="px-4 py-4 text-slate-600">{fila.destinoGira ?? "—"}</td>
                      <td className="px-4 py-4 text-slate-500">{fechaCorta(fila.fechaRegistro)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            title="Continuar editando"
                            aria-label={`Continuar editando INS-${fila.idInscripcion}`}
                            onClick={() => navigate(`/giras/inscripciones/borradores/${fila.idInscripcion}/editar`)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          >
                            <HiOutlinePencilSquare className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="Eliminar borrador"
                            aria-label={`Eliminar INS-${fila.idInscripcion}`}
                            onClick={() => eliminar(fila.idInscripcion)}
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
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                        Cargando borradores…
                      </td>
                    </tr>
                  )}

                  {error && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm font-medium text-rose-600">
                        {error}
                      </td>
                    </tr>
                  )}

                  {!cargando && !error && borradores.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
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
