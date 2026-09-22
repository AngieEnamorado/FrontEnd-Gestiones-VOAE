import type { UsuarioActual } from "../types";

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
    // Jefe de misión es el rol con el que arranca Giras; quién es esa persona en
    // la base de datos se elige en "Modo de vista" (ver UserContext).
    rolGira: "jefe-mision",
  };
}
