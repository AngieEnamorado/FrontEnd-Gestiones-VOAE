import { useState, type ReactNode } from "react";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { claseChipColor } from "../../../components/voluntariado/colores";
import { voluntariadoApi, type TrimestreApi } from "../../../api/voluntariado";
import { catalogoApi } from "../../../api/catalogo";
import { mensajeDeError } from "../../../api/clienteVoluntariado";
import { useApi } from "../../../utils/useApi";
import { colorDeRed, fechaCorta, nombreTrimestre } from "../../../utils/voluntariado";

function TarjetaCatalogo({ titulo, nota, children }: { titulo: string; nota?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-slate-700">{titulo}</h2>
      {nota && <p className="mt-0.5 text-xs text-slate-400">{nota}</p>}
      <div className="mt-3 flex flex-col divide-y divide-slate-100">{children}</div>
    </div>
  );
}

function FilaEditable({
  valor,
  fondo = "bg-slate-50",
  onGuardar,
}: {
  valor: string;
  fondo?: string;
  onGuardar: (valor: string) => Promise<void>;
}) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(valor);

  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 ${fondo}`}>
      {editando ? (
        <input
          autoFocus
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onBlur={async () => {
            setEditando(false);
            if (texto.trim() && texto !== valor) await onGuardar(texto.trim());
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

function FilaTrimestre({ trimestre, onGuardar }: { trimestre: TrimestreApi; onGuardar: (limite: string) => Promise<void> }) {
  const [limite, setLimite] = useState(fechaCorta(trimestre.fechaLimiteInforme));
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
      <span className="text-sm font-medium text-slate-700">{nombreTrimestre(trimestre)}</span>
      <label className="flex items-center gap-2 text-xs text-slate-400">
        vence
        <input
          type="date"
          value={limite}
          onChange={(e) => setLimite(e.target.value)}
          onBlur={() => limite && limite !== fechaCorta(trimestre.fechaLimiteInforme) && onGuardar(limite)}
          className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600"
        />
      </label>
    </div>
  );
}

export default function Catalogos() {
  const carga = useApi(() => Promise.all([voluntariadoApi.catalogos(), catalogoApi.campus()]), []);
  const [nuevaRed, setNuevaRed] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [catalogos, campus] = carga.datos ?? [undefined, []];

  async function ejecutar(accion: () => Promise<unknown>) {
    setError(null);
    try {
      await accion();
      carga.recargar();
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }

  // El siguiente trimestre después del último registrado, con fechas de
  // calendario por defecto; la fecha límite se ajusta después en la fila.
  function agregarTrimestre() {
    const ultimo = catalogos?.trimestres[0];
    const anio = ultimo ? (ultimo.numeroTrimestre === 4 ? ultimo.anioTrimestre + 1 : ultimo.anioTrimestre) : new Date().getFullYear();
    const numero = ultimo ? (ultimo.numeroTrimestre % 4) + 1 : 1;
    const mesInicio = (numero - 1) * 3 + 1;
    const pad = (n: number) => String(n).padStart(2, "0");
    const finMes = new Date(anio, mesInicio + 2, 0).getDate();
    const limite = numero === 4 ? `${anio + 1}-01-15` : `${anio}-${pad(mesInicio + 3)}-15`;
    return ejecutar(() =>
      voluntariadoApi.crearTrimestre({
        anioTrimestre: anio,
        numeroTrimestre: numero,
        fechaInicioTrimestre: `${anio}-${pad(mesInicio)}-01`,
        fechaFinTrimestre: `${anio}-${pad(mesInicio + 2)}-${finMes}`,
        fechaLimiteInforme: limite,
      }),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-base font-bold text-slate-800">Catálogos del sistema</h1>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>}

      <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={carga.datos !== undefined}>
        <div className="grid gap-4 lg:grid-cols-2">
          <TarjetaCatalogo titulo="Campus" nota="Compartido por todos los sistemas; se administra desde Catálogo, no desde Voluntariado.">
            {campus.map((c) => (
              <div key={c.idCampus} className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm font-medium text-slate-700">{c.nombreCampus}</span>
                <span className="text-xs text-slate-400">{c.codigoCortoCampus}</span>
              </div>
            ))}
          </TarjetaCatalogo>

          <TarjetaCatalogo titulo="Redes temáticas">
            {catalogos?.redes.map((red) => (
              <FilaEditable
                key={red.idRedTematica}
                valor={red.nombreRedTematica}
                fondo={claseChipColor[colorDeRed(red.idRedTematica)].split(" ")[0]}
                onGuardar={(nombre) => ejecutar(() => voluntariadoApi.actualizarRed(red.idRedTematica, nombre))}
              />
            ))}
            <form
              className="flex gap-2 pt-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!nuevaRed.trim()) return;
                void ejecutar(() => voluntariadoApi.crearRed(nuevaRed.trim())).then(() => setNuevaRed(""));
              }}
            >
              <input
                value={nuevaRed}
                onChange={(e) => setNuevaRed(e.target.value)}
                placeholder="Nueva red temática"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-unah-orange"
              />
              <button type="submit" className="shrink-0 rounded-lg bg-unah-navy px-3 py-2 text-xs font-semibold text-white">
                Agregar
              </button>
            </form>
          </TarjetaCatalogo>

          <TarjetaCatalogo titulo="Trimestres y fechas límite">
            {catalogos?.trimestres.map((t) => (
              <FilaTrimestre
                key={t.idTrimestre}
                trimestre={t}
                onGuardar={(limite) => ejecutar(() => voluntariadoApi.actualizarTrimestre(t.idTrimestre, { fechaLimiteInforme: limite }))}
              />
            ))}
            <div className="pt-3">
              <button type="button" onClick={agregarTrimestre} className="text-xs font-semibold text-unah-orange">
                + Agregar el siguiente trimestre
              </button>
            </div>
          </TarjetaCatalogo>

          <TarjetaCatalogo titulo="Cargos de junta directiva">
            {catalogos?.cargos.map((cargo) => (
              <div key={cargo.idCargo} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="text-sm font-medium text-slate-700">{cargo.nombreCargo}</span>
                <span className="text-right text-xs text-slate-400">{cargo.descripcionCargo}</span>
              </div>
            ))}
          </TarjetaCatalogo>
        </div>
      </EstadoCarga>
    </div>
  );
}
