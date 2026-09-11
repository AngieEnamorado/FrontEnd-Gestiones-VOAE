import { useEnVista } from "../../utils/useEnVista";

/**
 * Rejilla cuyas tarjetas entran escalonadas cuando la rejilla asoma en
 * pantalla, no cuando se monta. Sin esto, las secciones largas gastaban la
 * entrada de sus últimas tarjetas mientras el usuario seguía leyendo arriba.
 */
export default function RejillaAnimada({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const [referencia, enVista] = useEnVista<HTMLDivElement>();

  return (
    // `opacity-0` y no `invisible`: con `visibility: hidden` las tarjetas
    // también desaparecen para los lectores de pantalla, y aquí solo se
    // quieren ocultar a la vista hasta que entren.
    <div ref={referencia} className={`${className} ${enVista ? "entra-escalonado" : "opacity-0"}`}>
      {children}
    </div>
  );
}
