interface TarjetaEstadisticaProps {
  /**
   * Número de la métrica en la especificación del programa. No es decoración:
   * es con ese número con el que Vicerrectoría y VOAE se refieren a cada cifra
   * en los documentos de requerimientos.
   */
  numero: string;
  titulo: string;
  nota?: string;
  /** Ocupa el ancho completo de la rejilla en vez de media columna. */
  ancha?: boolean;
  etiqueta?: React.ReactNode;
  children: React.ReactNode;
}

export default function TarjetaEstadistica({
  numero,
  titulo,
  nota,
  ancha = false,
  etiqueta,
  children,
}: TarjetaEstadisticaProps) {
  return (
    <section
      className={`flex flex-col rounded-2xl bg-white p-5 shadow-sm sm:p-6 ${ancha ? "lg:col-span-2" : ""}`}
    >
      <div className="min-w-0">
        <h3 className="text-base font-bold text-slate-800">
          <span className="mr-2 text-unah-orange">{numero}.</span>
          {titulo}
          {etiqueta}
        </h3>
        {nota && <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{nota}</p>}
      </div>

      <div className="mt-5 flex-1">{children}</div>
    </section>
  );
}
