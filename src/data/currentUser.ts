import type { PerfilEstudiante, UsuarioActual } from "../types";

// Esto simula la respuesta de un servicio de autenticación / sesión.
// El UserContext "jala" al usuario desde aquí en vez de tenerlo
// escrito a mano dentro del componente del sidebar o del topbar.
// Cuando exista un backend real, esta función se reemplaza por una
// llamada a la API de sesión (fetch, react-query, etc.).
export function obtenerUsuarioDeSesion(): UsuarioActual {
  return {
    nombreCompleto: "Erin Matute",
    nombreUsuario: "erin.matute",
    correo: "erin.matute@unah.hn",
    rol: "Administrador VOAE",
    iniciales: "ER",
    rolProcad: "administrador",
    // Jefe de misión es el rol para el que están armados los datos de prueba de
    // Giras (`misGiras`), así que es el que deja todas esas pantallas a mano.
    rolGira: "jefe-mision",
  };
}

// Con el modo de vista "Estudiante", la persona que usa el sistema es un
// estudiante, no el usuario Erin Matute de arriba. Mientras no haya sesión real
// esa persona se simula aquí; cuando exista, esta función se reemplaza por lo
// que devuelva el servicio de sesión y el resto no cambia.
export function obtenerEstudianteDeSesion(): PerfilEstudiante {
  return {
    nombreCompleto: "Mariajose Berganza Domínguez",
    numeroCuenta: "20191005678",
  };
}
