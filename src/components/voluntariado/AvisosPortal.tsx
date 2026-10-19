import { useState } from "react";
import { HiOutlineBellAlert, HiXMark } from "react-icons/hi2";
import { catalogoApi } from "../../api/catalogo";
import { useApi } from "../../utils/useApi";
import { fechaCorta } from "../../utils/voluntariado";

// Avisos sin leer de Voluntariado (dictámenes de la VOAE, solicitudes de unión,
// diplomas). La Lambda los escribe en Catalogo.tblNotificaciones; si la carga
// falla no se muestra nada: el resto del Inicio no depende de esto.
export default function AvisosPortal({ idPersona }: { idPersona: number }) {
  const carga = useApi(() => catalogoApi.notificacionesNoLeidas(idPersona), [idPersona]);
  const [leidas, setLeidas] = useState<Set<number>>(new Set());

  const avisos = (carga.datos ?? []).filter(
    (n) => n.sistemaOrigen === "VOLUNTARIADO" && !leidas.has(n.idNotificacion),
  );
  if (avisos.length === 0) return null;

  function marcarLeida(idNotificacion: number) {
    setLeidas((previas) => new Set(previas).add(idNotificacion));
    // Si falla, el aviso vuelve a salir la próxima vez que se abra el Inicio.
    catalogoApi.marcarNotificacionLeida(idNotificacion).catch(() => undefined);
  }

  return (
    <section className="mt-4 px-4" aria-label="Avisos">
      <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
        <HiOutlineBellAlert className="h-4 w-4 text-unah-orange" />
        Avisos
        <span className="rounded-full bg-unah-orange px-1.5 text-[10px] font-bold text-white">{avisos.length}</span>
      </h2>
      <div className="mt-3 flex flex-col gap-2.5">
        {avisos.map((n) => (
          <div key={n.idNotificacion} className="flex items-start gap-2.5 rounded-2xl border border-blue-100 bg-blue-50 p-3.5 text-left">
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-bold text-unah-navy">{n.asuntoCorreo}</p>
              <p className="mt-0.5 text-[12px] leading-snug text-slate-600">{n.cuerpoCorreo}</p>
              <p className="mt-1 text-[10px] font-semibold text-slate-400">{fechaCorta(n.fechaRegistro)}</p>
            </div>
            <button
              type="button"
              onClick={() => marcarLeida(n.idNotificacion)}
              aria-label="Marcar como leído"
              title="Marcar como leído"
              className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-blue-100 hover:text-slate-600"
            >
              <HiXMark className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
