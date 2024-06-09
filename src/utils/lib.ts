import { type AxiosRequestConfig } from "axios";

export const cn = (...classes: (string | boolean)[]) =>
  classes.filter(Boolean).join(" ");

export const checkMimetype = (type: string, validTypes: string[]) => {
  return validTypes.includes(type);
};

export const axiosOpts = (o: AxiosRequestConfig) => o;
