import { useState, type ReactNode } from "react";
import { campus as campusIniciales, redesTematicas as redesIniciales, trimestres as trimestresIniciales, cargosJuntaDirectiva } from "../../../data/mockCatalogosVoluntariado";
import { claseChipColor } from "../../../components/voluntariado/colores";

interface FilaEditable {
  id: string;
  valor: string;
}

function TarjetaCatalogo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-slate-700">{titulo}</h2>
      <div className="mt-3 flex flex-col divide-y divide-slate-100">{children}</div>
    </div>
  );
}

function FilaCatalogo({
  fila,
  fondo = "bg-slate-50",
  onGuardar,
}: {
  fila: FilaEditable;
  fondo?: string;
  onGuardar: (valor: string) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(fila.valor);

  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 ${fondo}`}>
      {editando ? (
        <input
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onBlur={() => {
            onGuardar(valor);
            setEditando(false);
          }}
          className="min-w-0 flex-1 rounded-md border border-unah-orange px-2 py-1 text-sm outline-none"
        />
      ) : (
        <span className="text-sm font-medium text-slate-700">{valor}</span>
      )}
      <button type="button" onClick={() => setEditando(true)} className="shrink-0 text-xs font-semibold text-unah-orange">
        Editar
      </button>
    </div>
  );
}

export default function Catalogos() {
  const [campus, setCampus] = useState<FilaEditable[]>(campusIniciales.map((c) => ({ id: c.id, valor: c.nombre })));
  const [redes, setRedes] = useState<FilaEditable[]>(redesIniciales.map((r) => ({ id: r.id, valor: r.nombre })));
  const [trimestres, setTrimestres] = useState<FilaEditable[]>(
    trimestresIniciales.map((t) => ({ id: t.id, valor: `${t.nombre} — vence ${t.fechaLimite}` })),
  );

  function actualizar(setter: typeof setCampus, id: string, valor: string) {
    setter((prev) => prev.map((f) => (f.id === id ? { ...f, valor } : f)));
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-base font-bold text-slate-800">Catálogos del sistema</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <TarjetaCatalogo titulo="Campus">
          {campus.map((fila) => (
            <FilaCatalogo key={fila.id} fila={fila} onGuardar={(v) => actualizar(setCampus, fila.id, v)} />
          ))}
        </TarjetaCatalogo>

        <TarjetaCatalogo titulo="Redes temáticas">
          {redes.map((fila) => {
            const red = redesIniciales.find((r) => r.id === fila.id);
            return (
              <FilaCatalogo
                key={fila.id}
                fila={fila}
                fondo={red ? claseChipColor[red.color].split(" ")[0] : "bg-blue-50"}
                onGuardar={(v) => actualizar(setRedes, fila.id, v)}
              />
            );
          })}
        </TarjetaCatalogo>

        <TarjetaCatalogo titulo="Trimestres y fechas límite">
          {trimestres.map((fila) => (
            <FilaCatalogo key={fila.id} fila={fila} onGuardar={(v) => actualizar(setTrimestres, fila.id, v)} />
          ))}
        </TarjetaCatalogo>

        <TarjetaCatalogo titulo="Cargos de junta directiva">
          {cargosJuntaDirectiva.map((cargo) => (
            <div key={cargo} className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm font-medium text-slate-700">{cargo}</span>
              <span className="text-xs text-slate-400">Requiere número de cuenta activo</span>
            </div>
          ))}
        </TarjetaCatalogo>
      </div>
    </div>
  );
}
