import { useState } from "react";
import ChipsFiltro from "../../../components/procad/ChipsFiltro";
import PildoraEstado from "../../../components/procad/PildoraEstado";
import TablaDatos from "../../../components/procad/TablaDatos";
import { ETIQUETA_TIPO } from "../../../components/procad/paleta";
import { useProcad } from "../../../context/ProcadContext";
import { procadConectado } from "../../../api/clienteProcad";
import { listarCampus, listarCatalogos } from "../../../api/procad";
import { aReferencias, type ReferenciasProcad } from "../../../api/adaptadoresProcad";
import { useConsulta } from "../../../api/useConsulta";
import {
  DISCIPLINAS_CATALOGO,
  MOTIVOS_EXPULSION,
  TIPOS_ACTIVIDAD_CATALOGO,
} from "../../../data/mockProcadAdmin";
import { CENTROS } from "../../../data/mockProcadEstadisticas";
import { suma } from "../../../utils/procadMetricas";

type Hoja = "campus" | "grupos" | "disciplinas" | "tipos" | "motivos" | "empleados";

/** Los catálogos de la demostración, con la misma forma que los que llegan de la API. */
const REFERENCIAS_DEMO: ReferenciasProcad = {
  centros: CENTROS,
  disciplinas: DISCIPLINAS_CATALOGO,
  tipos: TIPOS_ACTIVIDAD_CATALOGO,
  motivos: MOTIVOS_EXPULSION,
};

const SIN_REFERENCIAS: ReferenciasProcad = {
  centros: [],
  disciplinas: [],
  tipos: { deportivo: [], artistico: [] },
  motivos: [],
};

/**
 * Conectado, los catálogos salen de voae-procad y los centros de voae-catalogo;
 * sin conexión, de la demostración.
 */
function useReferencias() {
  const consulta = useConsulta(async () => {
    if (!procadConectado) return REFERENCIAS_DEMO;
    const [catalogos, campus] = await Promise.all([listarCatalogos(), listarCampus()]);
    return aReferencias(catalogos, campus);
  }, []);
  return { referencias: consulta.datos ?? SIN_REFERENCIAS, error: consulta.error };
}

/** La base guarda los nombres en minúscula («danza»); la demostración ya viene en minúscula también. */
const conMayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

function Nota({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-xs leading-relaxed text-slate-500">{children}</p>;
}

/**
 * Los datos de referencia del programa: lo que existe antes de que alguien se
 * inscriba. Cada hoja es un catálogo distinto, así que se cambian con chips y
 * no con pestañas: no son secciones del módulo, son vistas del mismo catálogo.
 */
export default function Catalogos() {
  const { empleados, agrupaciones } = useProcad();
  const { referencias, error } = useReferencias();
  const [hoja, setHoja] = useState<Hoja>("campus");

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <ChipsFiltro
        etiqueta="Catálogo"
        activa={hoja}
        onCambiar={setHoja}
        opciones={[
          { id: "campus", label: "Campus y centros" },
          { id: "grupos", label: "Grupos" },
          { id: "disciplinas", label: "Disciplinas" },
          { id: "tipos", label: "Tipos de actividad" },
          { id: "motivos", label: "Motivos de expulsión" },
          { id: "empleados", label: "Empleados y vínculos" },
        ]}
      />

      {error && <p className="mt-4 text-xs text-red-600">No se pudieron cargar los catálogos: {error}</p>}

      <div className="mt-5">
        {hoja === "campus" && (
          <>
            <TablaDatos
              anchoMinimo="520px"
              columnas={[
                { label: "Centro regional" },
                { label: "Grupos", numerica: true },
                { label: "Estudiantes", numerica: true },
              ]}
              filas={referencias.centros.map((c) => {
                const filas = agrupaciones.filter((a) => a.centro === c);
                return [c, filas.length, suma(filas, "estudiantes")];
              })}
            />
            <Nota>
              {procadConectado
                ? `Los ${referencias.centros.length} centros activos del catálogo institucional de la UNAH.`
                : "Los 8 campus corresponden a los centros regionales reales confirmados de la UNAH."}
            </Nota>
          </>
        )}

        {hoja === "grupos" && (
          <>
            <TablaDatos
              anchoMinimo="1080px"
              columnas={[
                { label: "Grupo" },
                { label: "Clasificación" },
                { label: "Centro" },
                { label: "Disciplina / Deporte" },
                { label: "Selección" },
                { label: "Estudiantes", numerica: true },
              ]}
              filas={agrupaciones.map((a) => [
                <span key={`g-${a.nombre}`} className="font-medium text-slate-700">
                  {a.nombre}
                </span>,
                ETIQUETA_TIPO[a.tipo],
                a.centro,
                a.tipo === "deportivo"
                  ? (a.deporte ?? "—")
                  : (a.disciplinas ?? []).join(", ") || "—",
                a.esSeleccion ? (
                  <PildoraEstado key={`s-${a.nombre}`} tono="activo">
                    Sí
                  </PildoraEstado>
                ) : (
                  "—"
                ),
                a.estudiantes,
              ])}
            />
            <Nota>
              Un grupo artístico puede tener más de una disciplina a la vez — por ejemplo, una
              asociación que trabaja danza y teatro.
            </Nota>
          </>
        )}

        {hoja === "disciplinas" && (
          <TablaDatos
            anchoMinimo="420px"
            columnas={[{ label: "Disciplina" }, { label: "Grupos que la usan", numerica: true }]}
            filas={referencias.disciplinas.map((d) => [
              conMayuscula(d),
              agrupaciones.filter((a) => (a.disciplinas ?? []).includes(d)).length,
            ])}
          />
        )}

        {hoja === "tipos" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-bold text-slate-700">Deportivo</h4>
              <TablaDatos
                anchoMinimo="240px"
                columnas={[{ label: "Tipo de actividad" }]}
                filas={referencias.tipos.deportivo.map((t) => [t])}
              />
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-slate-700">Artístico</h4>
              <TablaDatos
                anchoMinimo="240px"
                columnas={[{ label: "Tipo de actividad" }]}
                filas={referencias.tipos.artistico.map((t) => [t])}
              />
            </div>
            <div className="lg:col-span-2">
              <Nota>
                Es un catálogo compartido: cada grupo habilita solo los tipos que le aplican, desde
                su propia configuración.
              </Nota>
            </div>
          </div>
        )}

        {hoja === "motivos" && (
          <>
            <TablaDatos
              anchoMinimo="320px"
              columnas={[{ label: "Motivo de expulsión" }]}
              filas={referencias.motivos.map((m) => [m])}
            />
            <Nota>Catálogo institucional permanente — sin bandera de activo o inactivo.</Nota>
          </>
        )}

        {hoja === "empleados" && (
          <>
            <TablaDatos
              anchoMinimo="900px"
              columnas={[
                { label: "Empleado" },
                { label: "Rol" },
                { label: "Centro" },
                { label: "Tipo de colaborador" },
                { label: "Agrupaciones vinculadas" },
              ]}
              filas={empleados.map((e) => [
                <span key={`e-${e.nombre}`} className="font-medium text-slate-700">
                  {e.nombre}
                </span>,
                e.rol,
                e.centro,
                <PildoraEstado
                  key={`t-${e.nombre}`}
                  tono={e.esColaboradorExterno ? "pendiente" : "activo"}
                >
                  {e.esColaboradorExterno ? "Externo" : "Interno"}
                </PildoraEstado>,
                e.grupos.join(" · "),
              ])}
            />
            <Nota>
              Un mismo empleado puede estar vinculado a varias agrupaciones, y una agrupación puede
              tener más de un responsable.
            </Nota>
          </>
        )}
      </div>
    </div>
  );
}
