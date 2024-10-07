export type Day = keyof typeof days;
export const days = {
  Sunday: "domingo",
  Monday: "lunes",
  Tuesday: "martes",
  Wednesday: "miércoles",
  Thursday: "jueves",
  Friday: "viernes",
  Saturday: "sábado",
} as const;

export type Month = keyof typeof months;
export const months = {
  January: "Enero",
  February: "Febrero",
  March: "Marzo",
  April: "Abril",
  May: "Mayo",
  June: "Junio",
  July: "Julio",
  August: "Agosto",
  September: "Septiembre",
  October: "Octubre",
  November: "Noviembre",
  December: "Diciembre",
} as const;

export function removeScroll() {
  document.body.classList.add("h-100vh");
  document.body.classList.add("overflow-hidden");
  document.body.classList.add("xs:pr-4");
}

export function restoreScroll() {
  document.body.classList.remove("h-100vh");
  document.body.classList.remove("overflow-hidden");
  document.body.classList.remove("xs:pr-4");
}
