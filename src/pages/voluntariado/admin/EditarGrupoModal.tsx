import { useState, type ReactNode } from "react";
import { HiOutlineXMark } from "react-icons/hi2";
import LogoGrupo from "../../../components/voluntariado/LogoGrupo";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { claseChipColor } from "../../../components/voluntariado/colores";
import {
  voluntariadoApi,
  type CambiosGrupoApi,
  type GrupoDetalleApi,
  type GrupoResumenApi,
  type RedTematicaApi,
} from "../../../api/voluntariado";
import { mensajeDeError } from "../../../api/clienteVoluntariado";
import { subirArchivo, validarArchivo } from "../../../api/archivosVoluntariado";
import { useApi } from "../../../utils/useApi";
import { colorDeGrupo, colorDeRed, iniciales } from "../../../utils/voluntariado";

interface Props {
  item: GrupoResumenApi | null;
  redes: RedTematicaApi[];
  onClose: () => void;
  onGuardado: () => void;
}

// Edición de un grupo por la VOAE. El nombre no se cambia, y misión, visión y
// reseña se muestran pero no se editan: viven en la solicitud que dio origen al
// grupo, no en el grupo.
export default function EditarGrupoModal({ item, redes, onClose, onGuardado }: Props) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-800">Editar grupo</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar">
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>
        <Formulario key={item.idGrupo} idGrupo={item.idGrupo} redes={redes} onClose={onClose} onGuardado={onGuardado} />
      </div>
    </div>
  );
}

function Formulario({ idGrupo, redes, onClose, onGuardado }: { idGrupo: number } & Omit<Props, "item">) {
  const carga = useApi(() => voluntariadoApi.grupo(idGrupo), [idGrupo]);
  return (
    <div className="overflow-y-auto px-5 py-4">
      <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={carga.datos !== undefined}>
        {carga.datos && <Campos grupo={carga.datos} redes={redes} onClose={onClose} onGuardado={onGuardado} />}
      </EstadoCarga>
    </div>
  );
}

function Campos({ grupo, redes, onClose, onGuardado }: { grupo: GrupoDetalleApi } & Omit<Props, "item">) {
  const redesIniciales = grupo.redesTematicas.map((r) => r.idRedTematica);
  const [descripcion, setDescripcion] = useState(grupo.descripcionGrupo ?? "");
  const [redesSociales, setRedesSociales] = useState(grupo.redesSociales ?? "");
  const [seleccion, setSeleccion] = useState<number[]>(redesIniciales);
  const [logo, setLogo] = useState<File | null>(null);
  const [quitarLogo, setQuitarLogo] = useState(false);
  const [vistaLogo, setVistaLogo] = useState<string | null>(grupo.urlLogo);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Las redes inactivas que el grupo ya tiene se siguen mostrando para poder quitarlas.
  const opcionesRedes = [
    ...redes,
    ...grupo.redesTematicas.filter((r) => !redes.some((x) => x.idRedTematica === r.idRedTematica)),
  ];

  function alternarRed(id: number) {
    setSeleccion((actual) => (actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]));
  }

  function elegirLogo(archivo: File | undefined) {
    if (!archivo) return;
    const invalido = validarArchivo(archivo) ?? (archivo.type.startsWith("image/") ? null : "El logo debe ser una imagen (PNG, JPG o WEBP).");
    if (invalido) {
      setError(invalido);
      return;
    }
    setError(null);
    setLogo(archivo);
    setQuitarLogo(false);
    setVistaLogo(URL.createObjectURL(archivo));
  }

  async function guardar() {
    setError(null);
    if (seleccion.length === 0) {
      setError("El grupo debe pertenecer al menos a una red temática.");
      return;
    }

    const cambios: CambiosGrupoApi = {};
    const descripcionLimpia = descripcion.trim() || null;
    const redesSocialesLimpias = redesSociales.trim() || null;
    if (descripcionLimpia !== (grupo.descripcionGrupo ?? null)) cambios.descripcionGrupo = descripcionLimpia;
    if (redesSocialesLimpias !== (grupo.redesSociales ?? null)) cambios.redesSociales = redesSocialesLimpias;
    const mismasRedes = seleccion.length === redesIniciales.length && seleccion.every((id) => redesIniciales.includes(id));
    if (!mismasRedes) cambios.redesTematicas = seleccion;
    if (quitarLogo && grupo.logoUrl) cambios.logoUrl = null;

    setGuardando(true);
    try {
      // El logo se sube primero; si después falla el guardado, reintentar sube
      // otra copia, que queda huérfana en el bucket pero no rompe nada.
      if (logo) cambios.logoUrl = await subirArchivo("GRUPO", grupo.idGrupo, logo);
      if (Object.keys(cambios).length === 0) {
        onClose();
        return;
      }
      await voluntariadoApi.editarGrupo(grupo.idGrupo, cambios);
      onGuardado();
      onClose();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex items-center gap-4">
        <LogoGrupo
          iniciales={iniciales(grupo.nombreGrupo)}
          color={colorDeGrupo(grupo.idGrupo)}
          tamano="lg"
          url={quitarLogo ? null : vistaLogo}
        />
        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-800">{grupo.nombreGrupo}</span>
          <span className="text-xs text-slate-400">El nombre del grupo no se puede cambiar.</span>
          <div className="flex gap-3 text-xs font-semibold">
            <label className="cursor-pointer text-unah-orange hover:underline">
              {vistaLogo && !quitarLogo ? "Cambiar logo" : "Subir logo"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  elegirLogo(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            {vistaLogo && !quitarLogo && (
              <button
                type="button"
                onClick={() => {
                  setQuitarLogo(true);
                  setLogo(null);
                }}
                className="text-slate-500 hover:underline"
              >
                Quitar logo
              </button>
            )}
          </div>
        </div>
      </div>

      <Campo etiqueta="Descripción">
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={4}
          maxLength={4000}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-unah-navy focus:outline-none"
        />
      </Campo>

      <Campo etiqueta="Redes temáticas" ayuda="Al menos una.">
        <div className="flex flex-wrap gap-1.5">
          {opcionesRedes.map((red) => {
            const activa = seleccion.includes(red.idRedTematica);
            return (
              <button
                key={red.idRedTematica}
                type="button"
                onClick={() => alternarRed(red.idRedTematica)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                  activa ? claseChipColor[colorDeRed(red.idRedTematica)] : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                }`}
              >
                {red.nombreRedTematica}
              </button>
            );
          })}
        </div>
      </Campo>

      <Campo etiqueta="Redes sociales" ayuda="Enlaces o usuarios, separados por coma.">
        <input
          value={redesSociales}
          onChange={(e) => setRedesSociales(e.target.value)}
          maxLength={300}
          placeholder="facebook.com/migrupo, @migrupo"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-unah-navy focus:outline-none"
        />
      </Campo>

      {(grupo.misionGrupo || grupo.visionGrupo || grupo.resenaHistorica) && (
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          <p className="mb-2 font-semibold text-slate-600">
            Misión, visión y reseña vienen de la solicitud de creación y no se editan aquí.
          </p>
          {grupo.misionGrupo && <p><span className="font-semibold">Misión:</span> {grupo.misionGrupo}</p>}
          {grupo.visionGrupo && <p className="mt-1"><span className="font-semibold">Visión:</span> {grupo.visionGrupo}</p>}
          {grupo.resenaHistorica && <p className="mt-1"><span className="font-semibold">Reseña:</span> {grupo.resenaHistorica}</p>}
        </div>
      )}

      {error && <p className="rounded-lg bg-red-50 p-3 font-semibold text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 font-semibold text-slate-500 hover:bg-slate-100">
          Cancelar
        </button>
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          className="rounded-lg bg-unah-navy px-4 py-2 font-semibold text-white hover:bg-unah-navy-dark disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

function Campo({ etiqueta, ayuda, children }: { etiqueta: string; ayuda?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {etiqueta} {ayuda && <span className="font-normal normal-case tracking-normal text-slate-400">· {ayuda}</span>}
      </span>
      {children}
    </div>
  );
}
