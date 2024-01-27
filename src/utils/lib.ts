export const cn = (...classes: (string | boolean)[]) =>
  classes.filter(Boolean).join(" ");
