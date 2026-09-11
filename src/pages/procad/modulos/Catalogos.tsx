import { useState } from "react";
import ChipsFiltro from "../../../components/procad/ChipsFiltro";
import PildoraEstado from "../../../components/procad/PildoraEstado";
import TablaDatos from "../../../components/procad/TablaDatos";
import { ETIQUETA_TIPO } from "../../../components/procad/paleta";
import { useProcad } from "../../../context/ProcadContext";
import {
  DISCIPLINAS_CATALOGO,
  MOTIVOS_EXPULSION,
  TIPOS_ACTIVIDAD_CATALOGO,
} from "../../../data/mockProcadAdmin";
import { CENTROS, agrupacionesProcad } from "../../../data/mockProcadEstadisticas";
import { suma } from "../../../utils/procadMetricas";

type Hoja = "campus" | "grupos" | "disciplinas" | "tipos" | "motivos" | "empleados";

function Nota({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-xs leading-relaxed text-slate-500">{children}</p>;
}

/**
 * Los datos de referencia del programa: lo que existe antes de que alguien se
 * inscriba. Cada hoja es un catálogo distinto, así que se cambian con chips y
 * no con pestañas: no son secciones del módulo, son vistas del mismo catálogo.
 */
export default function Catalogos() {
  const { empleados } = useProcad();
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
              filas={CENTROS.map((c) => {
                const filas = agrupacionesProcad.filter((a) => a.centro === c);
                return [c, filas.length, suma(filas, "estudiantes")];
              })}
            />
            <Nota>
              Los 8 campus corresponden a los centros regionales reales confirmados de la UNAH.
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
              filas={agrupacionesProcad.map((a) => [
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
            filas={DISCIPLINAS_CATALOGO.map((d) => [
              d.charAt(0).toUpperCase() + d.slice(1),
              agrupacionesProcad.filter((a) => (a.disciplinas ?? []).includes(d)).length,
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
                filas={TIPOS_ACTIVIDAD_CATALOGO.deportivo.map((t) => [t])}
              />
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-slate-700">Artístico</h4>
              <TablaDatos
                anchoMinimo="240px"
                columnas={[{ label: "Tipo de actividad" }]}
                filas={TIPOS_ACTIVIDAD_CATALOGO.artistico.map((t) => [t])}
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
              filas={MOTIVOS_EXPULSION.map((m) => [m])}
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
