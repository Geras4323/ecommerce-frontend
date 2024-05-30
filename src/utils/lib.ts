export const cn = (...classes: (string | boolean)[]) =>
  classes.filter(Boolean).join(" ");

export const checkMimetype = (type: string, validTypes: string[]) => {
  return validTypes.includes(type);
};
