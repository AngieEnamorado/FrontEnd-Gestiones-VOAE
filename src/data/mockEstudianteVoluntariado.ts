import type { EstudianteVoluntariado } from "../types";

// Estudiante "de sesión" del Portal Estudiante. Es coordinador de
// "manos-que-ayudan" y miembro regular de "ecounah" — así el toggle de rol
// de prueba (ver ToggleRolPrueba) tiene sentido con datos reales del mock.
export const estudianteActual: EstudianteVoluntariado = {
  numeroCuenta: "20191000001",
  nombreCompleto: "Ana Sofía Martínez",
  carrera: "Pedagogía",
  correo: "ana.martinez@unah.hn",
  iniciales: "AM",
  gruposIds: ["manos-que-ayudan", "ecounah"],
  horasAcumuladas: 37.5,
};
