export const measurementUnits = [
  {
    value: "u",
    label: "Unidades",
  },
  {
    value: "g",
    label: "Gramos",
  },
  {
    value: "kg",
    label: "Kilos",
  },
  {
    value: "ml",
    label: "Mililitros",
  },
  {
    value: "l",
    label: "Litros",
  },
] as const;
export const measurementUnitsValues = measurementUnits.map(
  (unit) => unit.value
);
// const measurementUnitsLabels = measurementUnits.map((unit) => unit.label);
