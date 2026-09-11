/**
 * Cuando la respuesta de una tarjeta es un solo número, el número es el
 * gráfico: una barra sola o un pastel de dos porciones dirían menos.
 */
export default function CifraDestacada({
  valor,
  nota,
  children,
}: {
  valor: string;
  nota: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="text-[32px] font-extrabold leading-none text-unah-navy"
        style={{ fontVariantNumeric: "proportional-nums" }}
      >
        {valor}
      </p>
      <p className="mt-2.5 text-xs leading-relaxed text-slate-500">{nota}</p>
      {children && <div className="mt-3.5">{children}</div>}
    </div>
  );
}
