import type { AlcanceViaje, EstadoSolicitud, FinalidadGira, RegistroGiraAnalitica } from "../types";

// Dataset ficticio "plano" para alimentar el dashboard de Estadísticas de Giras.
// Se genera una sola vez con un PRNG con semilla fija para que los gráficos
// muestren siempre los mismos números entre recargas (no es Math.random puro).
function crearGeneradorAleatorio(semilla: number) {
  let estado = semilla;
  return function siguiente() {
    estado |= 0;
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const azar = crearGeneradorAleatorio(20260909);

function elegir<T>(lista: T[]): T {
  return lista[Math.floor(azar() * lista.length)];
}

function elegirPonderado<T>(opciones: [T, number][]): T {
  const total = opciones.reduce((acc, [, peso]) => acc + peso, 0);
  let umbral = azar() * total;
  for (const [valor, peso] of opciones) {
    umbral -= peso;
    if (umbral <= 0) return valor;
  }
  return opciones[opciones.length - 1][0];
}

function entero(min: number, max: number) {
  return Math.floor(azar() * (max - min + 1)) + min;
}

export const CAMPUS = ["CIUDAD UNIVERSITARIA", "CURLA", "CURLP", "CURC", "CURSA"];

const FACULTAD_CARRERAS: Record<string, string[]> = {
  "Ciencias Espaciales": ["Biología", "Física"],
  "Ciencias Económicas, Administrativas y Contables": ["Administración de Empresas", "Contaduría Pública"],
  "Ciencias Sociales": ["Trabajo Social", "Historia", "Antropología"],
  "Ciencias Médicas": ["Medicina", "Enfermería"],
  Ingeniería: ["Ingeniería Civil", "Ingeniería Industrial", "Ingeniería Agronómica", "Arquitectura"],
  "Humanidades y Artes": ["Letras", "Arqueología"],
};
const FACULTADES = Object.keys(FACULTAD_CARRERAS);

const DESTINOS = [
  "Copán Ruinas, Copán",
  "Roatán, Islas de la Bahía",
  "Comayagua",
  "La Esperanza, Intibucá",
  "Marcala, La Paz",
  "Tela, Atlántida",
  "Gracias, Lempira",
  "Trujillo, Colón",
  "Santa Rosa de Copán",
  "Valle de Ángeles, Francisco Morazán",
];

const FINALIDADES: [FinalidadGira, number][] = [
  ["Académica", 55],
  ["Social", 15],
  ["Cultural", 15],
  ["Deportiva", 8],
  ["Recreativa", 7],
];

const ALCANCES: [AlcanceViaje, number][] = [
  ["Local", 20],
  ["Nacional", 70],
  ["Internacional", 10],
];

const ESTADOS: [EstadoSolicitud, number][] = [
  ["APROBADA", 80],
  ["PENDIENTE", 8],
  ["RECHAZADA", 6],
  ["EN REVISIÓN", 4],
  ["ESPERA INF. SOCIAL", 2],
];

// "I Periodo" cae entre enero y mayo; "II Periodo" entre julio y noviembre.
const MESES_POR_PERIODO: Record<string, number[]> = {
  "I Periodo": [0, 1, 2, 3, 4],
  "II Periodo": [6, 7, 8, 9, 10],
};

const TOTAL_REGISTROS = 142;

export const registrosGiras: RegistroGiraAnalitica[] = Array.from(
  { length: TOTAL_REGISTROS },
  (_, indice) => {
    const año = elegir([2025, 2026]);
    const periodo = elegir(["I Periodo", "II Periodo"]);
    const mes = elegir(MESES_POR_PERIODO[periodo]);
    const dia = entero(1, 27);
    const facultad = elegir(FACULTADES);
    const carrera = elegir(FACULTAD_CARRERAS[facultad]);

    return {
      id: `GA-${año}-${String(indice + 1).padStart(3, "0")}`,
      fecha: `${año}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`,
      año,
      periodo,
      campus: elegir(CAMPUS),
      facultad,
      carrera,
      destino: elegir(DESTINOS),
      finalidad: elegirPonderado(FINALIDADES),
      alcance: elegirPonderado(ALCANCES),
      estado: elegirPonderado(ESTADOS),
      estudiantes: entero(12, 45),
      costo: entero(1200, 6800),
    };
  },
);
