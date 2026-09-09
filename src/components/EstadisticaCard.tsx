import type { IconType } from "react-icons";

interface EstadisticaCardProps {
  icon: IconType;
  label: string;
  valor: number | string;
  colorFondo: string;
  colorIcono: string;
  colorTexto: string;
}

export default function EstadisticaCard({
  icon: Icon,
  label,
  valor,
  colorFondo,
  colorIcono,
  colorTexto,
}: EstadisticaCardProps) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl p-4 ${colorFondo}`}>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/70`}>
        <Icon className={`h-5 w-5 ${colorIcono}`} />
      </div>
      <div className="min-w-0">
        <p className={`truncate text-sm font-medium ${colorTexto}`}>{label}</p>
        <p className="text-2xl font-bold text-slate-800">
          {typeof valor === "number" ? valor.toLocaleString("es-HN") : valor}
        </p>
      </div>
    </div>
  );
}
