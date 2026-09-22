import { useId, type ReactNode } from "react";
import type { RegistroCatalogoApi } from "../../../types/giras";
import { claseInput, claseLabel, type FichaForm } from "./formulario";

export function SeccionFormulario({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-800">
        <span className="mr-2 text-unah-orange">{numero}.</span>
        {titulo}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function CampoTexto({
  etiqueta,
  valor,
  onCambio,
  tipo = "text",
  placeholder,
  maxLength,
  deshabilitado,
}: {
  etiqueta: string;
  valor: string;
  onCambio: (valor: string) => void;
  tipo?: "text" | "email" | "tel" | "date";
  placeholder?: string;
  maxLength?: number;
  deshabilitado?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={claseLabel}>
        {etiqueta}
      </label>
      <input
        id={id}
        type={tipo}
        value={valor}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={deshabilitado}
        onChange={(e) => onCambio(e.target.value)}
        className={claseInput}
      />
    </div>
  );
}

export function DatoResumen({ etiqueta, valor }: { etiqueta: string; valor?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{etiqueta}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-700">{valor || "No especificado"}</dd>
    </div>
  );
}

/** Los campos de una ficha de salud; sirven igual para el estudiante y para su acompañante. */
export function CamposFichaSalud({
  ficha,
  tiposDeSangre,
  onCambio,
}: {
  ficha: FichaForm;
  tiposDeSangre: RegistroCatalogoApi[];
  onCambio: (campo: keyof FichaForm, valor: string) => void;
}) {
  const idSangre = useId();
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor={idSangre} className={claseLabel}>
            Tipo de sangre
          </label>
          <select
            id={idSangre}
            value={ficha.idTipoSangre}
            onChange={(e) => onCambio("idTipoSangre", e.target.value)}
            className={claseInput}
          >
            <option value="">Sin indicar</option>
            {tiposDeSangre.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
        <CampoTexto
          etiqueta="Alergias"
          maxLength={500}
          valor={ficha.alergias}
          onCambio={(v) => onCambio("alergias", v)}
        />
        <CampoTexto
          etiqueta="Condiciones médicas"
          maxLength={500}
          valor={ficha.condicionesMedicas}
          onCambio={(v) => onCambio("condicionesMedicas", v)}
        />
        <CampoTexto
          etiqueta="Discapacidad / apoyos"
          maxLength={500}
          valor={ficha.discapacidad}
          onCambio={(v) => onCambio("discapacidad", v)}
        />
        <CampoTexto
          etiqueta="Medicamentos"
          maxLength={300}
          valor={ficha.medicamentos}
          onCambio={(v) => onCambio("medicamentos", v)}
        />
      </div>

      <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Contacto de emergencia</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <CampoTexto
            etiqueta="Nombre"
            maxLength={120}
            valor={ficha.contactoNombre}
            onCambio={(v) => onCambio("contactoNombre", v)}
          />
          <CampoTexto
            etiqueta="Parentesco"
            maxLength={50}
            valor={ficha.contactoParentesco}
            onCambio={(v) => onCambio("contactoParentesco", v)}
          />
          <CampoTexto
            etiqueta="Teléfono"
            tipo="tel"
            maxLength={30}
            valor={ficha.contactoTelefono}
            onCambio={(v) => onCambio("contactoTelefono", v)}
          />
        </div>
      </div>
    </>
  );
}
