import { type AxiosRequestConfig } from "axios";

export const cn = (...classes: (string | boolean)[]) =>
  classes.filter(Boolean).join(" ");

export const checkMimetype = (type: string, validTypes: string[]) => {
  return validTypes.includes(type);
};

export const axiosOpts = (o: AxiosRequestConfig) => o;

export const withCbk = <S, E>(options: {
  queryFn: () => Promise<S>;
  onSuccess?: (d: S) => void;
  onError?: (e: E) => void;
  // onSettled?: () => void;
}) => {
  return async () => {
    try {
      const data = await options.queryFn();
      options.onSuccess?.(data);
      // options.onSettled?.();
      return data;
    } catch (e) {
      options.onError?.(e as E);
      // options.onSettled?.();
      throw e;
    }
  };
};
