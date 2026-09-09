import type { Inscripcion } from "../types";

// Inscripciones de estudiantes por gira, indexadas por el ID de la gira (misGiras).
export const inscripcionesPorGira: Record<string, Inscripcion[]> = {
  "GR-2026-021": [
    {
      id: "INS-2026-041",
      nombreEstudiante: "MARIAJOSE BERGANZA DOMINGUEZ",
      estado: "APROBADA",
      fecha: "2026-08-20",
      periodo: "II Periodo 2026",
      numeroCuenta: "20191005678",
      carreraFacultad: "Arqueología — Facultad de Ciencias Sociales",
      correoInstitucional: "mariajose.berganza@unah.hn",
      telefonoContacto: "+504 9988-1122",
      esExcepcional: false,
      tieneAcompanante: false,
      fichaSaludEstudiante: {
        tipoSangre: "O+",
        alergias: "Ninguna",
        condicionesMedicas: "Ninguna",
        discapacidad: "Ninguna",
        medicamentos: "Ninguno",
        contactoEmergencia: {
          nombre: "Rosa Domínguez",
          parentesco: "Madre",
          telefono: "+504 9955-3344",
        },
      },
      documentos: [
        { tipo: "Carné de estudiante", nombre: "carne_berganza.pdf", enlace: "https://drive.google.com/file/d/1a2b3c" },
        { tipo: "Comprobante de aporte", nombre: "comprobante_pago.pdf", enlace: "https://drive.google.com/file/d/4d5e6f" },
      ],
      observaciones: "Ninguna dieta especial. Se incorpora en Ciudad Universitaria.",
    },
    {
      id: "INS-2026-042",
      nombreEstudiante: "CALEB MIGUEL RODRIGUEZ LAGOS",
      estado: "PENDIENTE",
      fecha: "2026-08-21",
      periodo: "II Periodo 2026",
      numeroCuenta: "20201007890",
      carreraFacultad: "Historia — Facultad de Ciencias Sociales",
      correoInstitucional: "caleb.rodriguez@unah.hn",
      telefonoContacto: "+504 9911-2233",
      esExcepcional: true,
      inscritoPor: "Erin Matute — Jefa de misión",
      motivoExcepcion:
        "El estudiante estaba fuera del país durante el período de inscripción y solicitó por correo que se le inscribiera.",
      tieneAcompanante: true,
      acompanante: {
        nombreCompleto: "Sandra Patricia Lagos",
        fechaNacimiento: "1975-04-12",
        correo: "sandra.lagos@gmail.com",
        telefono: "+504 9877-6655",
      },
      fichaSaludEstudiante: {
        tipoSangre: "A+",
        alergias: "Penicilina",
        condicionesMedicas: "Ninguna",
        discapacidad: "Ninguna",
        medicamentos: "Ninguno",
        contactoEmergencia: {
          nombre: "Marlon Rodríguez",
          parentesco: "Padre",
          telefono: "+504 9922-4455",
        },
      },
      fichaSaludAcompanante: {
        tipoSangre: "O−",
        alergias: "Ninguna",
        condicionesMedicas: "Hipertensión controlada",
        discapacidad: "Ninguna",
        medicamentos: "Losartán 50mg",
        contactoEmergencia: {
          nombre: "Caleb Miguel Rodríguez Lagos",
          parentesco: "Hijo",
          telefono: "+504 9911-2233",
        },
      },
      documentos: [
        { tipo: "Autorización del encargado", nombre: "autorizacion_firmada.pdf", enlace: "https://drive.google.com/file/d/7g8h9i" },
        { tipo: "Copia de identidad", nombre: "identidad_acompanante.pdf", enlace: "https://drive.google.com/file/d/2j3k4l" },
      ],
      observaciones: "Viaja con equipo de campo adicional para el registro fotográfico.",
    },
    {
      id: "INS-2026-043",
      nombreEstudiante: "FRANCISCO JAVIER MEJIA SOSA",
      estado: "RECHAZADA",
      fecha: "2026-08-22",
      periodo: "II Periodo 2026",
    },
  ],
  "GR-2026-022": [
    {
      id: "INS-2026-051",
      nombreEstudiante: "DANIELA ALEJANDRA PAZ MATAMOROS",
      estado: "APROBADA",
      fecha: "2026-09-10",
      periodo: "II Periodo 2026",
    },
    {
      id: "INS-2026-052",
      nombreEstudiante: "JOSUE ANTONIO CASTELLANOS RIVERA",
      estado: "PENDIENTE",
      fecha: "2026-09-11",
      periodo: "II Periodo 2026",
    },
  ],
  "GR-2026-023": [
    {
      id: "INS-2026-061",
      nombreEstudiante: "GABRIELA MARIA DUBON PORTILLO",
      estado: "PENDIENTE",
      fecha: "2026-04-02",
      periodo: "I Periodo 2026",
    },
    {
      id: "INS-2026-062",
      nombreEstudiante: "OSCAR EDUARDO MEZA VELASQUEZ",
      estado: "APROBADA",
      fecha: "2026-04-03",
      periodo: "I Periodo 2026",
    },
  ],
  "GR-2026-024": [
    {
      id: "INS-2026-071",
      nombreEstudiante: "KATHERINE NICOLE ALVARADO CRUZ",
      estado: "RECHAZADA",
      fecha: "2026-03-15",
      periodo: "I Periodo 2026",
    },
  ],
  "GR-2026-025": [
    {
      id: "INS-2026-081",
      nombreEstudiante: "LUIS FERNANDO ORELLANA TORRES",
      estado: "APROBADA",
      fecha: "2026-10-25",
      periodo: "II Periodo 2026",
    },
    {
      id: "INS-2026-082",
      nombreEstudiante: "ANDREA SOFIA MARTINEZ FLORES",
      estado: "PENDIENTE",
      fecha: "2026-10-26",
      periodo: "II Periodo 2026",
    },
  ],
};
