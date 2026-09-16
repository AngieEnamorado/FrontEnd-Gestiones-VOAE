import { useState } from "react";
import DialogoConfirmacion, { type Dialogo } from "../../components/procad/DialogoConfirmacion";
import LayoutModulo from "./LayoutModulo";
import AdministrarFotos from "./modulos/AdministrarFotos";
import Albumes from "./modulos/Albumes";
import { useProcad } from "../../context/ProcadContext";

type Pestana = "albumes" | "administrar";

/**
 * La galería de PROCAD: el archivo de fotos del programa.
 *
 * Tiene módulo propio y no una pestaña dentro de Agrupaciones porque no hace lo
 * mismo que el resto del panel. Allá se resuelven casos; aquí se guarda y se
 * enseña el archivo gráfico del programa, que es lo que termina en la memoria
 * anual y en lo que la universidad publica.
 *
 * Sus dos pestañas son sus dos trabajos: mirar el muro, o subir y quitar.
 * Y guarda dos clases de álbum: los de una actividad, que toman de ella el
 * título y el día, y los sueltos, para lo que nunca pasó por Actividades.
 */
export default function GaleriaProcad() {
  const { albumes, actividades } = useProcad();
  const [activa, setActiva] = useState<Pestana>("albumes");
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);

  const sinFotos = actividades.filter(
    (a) => !albumes.some((album) => album.origen === "actividad" && album.actividadId === a.id),
  ).length;

  // La galería no acumula "pendientes" como los módulos de decisión —nadie
  // espera una firma—, pero sí tiene un hueco que se nota: las actividades que
  // ya pasaron y siguen sin una sola foto.
  const listaPendientes: string[] = [];
  if (sinFotos > 0) {
    listaPendientes.push(
      `${sinFotos} actividad(es) sin ninguna foto; sus tarjetas salen sin portada.`,
    );
  }

  return (
    <>
      <LayoutModulo
        titulo="Galería"
        descripcion="El archivo gráfico del programa: las fotos de cada actividad —la primera hace de portada en su tarjeta— y las de todo lo demás que se fotografía, en álbumes sueltos."
        nombre="galeria"
        activa={activa}
        onCambiar={setActiva}
        pendientes={listaPendientes}
        mensajeSinPendientes="Todas las actividades tienen al menos una foto."
        pestanas={[
          { id: "albumes", label: "Álbumes" },
          { id: "administrar", label: "Administrar fotos" },
        ]}
      >
        {activa === "albumes" && <Albumes />}
        {activa === "administrar" && <AdministrarFotos abrirDialogo={setDialogo} />}
      </LayoutModulo>

      <DialogoConfirmacion dialogo={dialogo} onCerrar={() => setDialogo(null)} />
    </>
  );
}
