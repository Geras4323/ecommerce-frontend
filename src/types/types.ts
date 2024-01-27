import type { AxiosResponse, AxiosError } from "axios";
import type { ReactNode } from "react";
import { z } from "zod";

export type DatabaseEntry = z.infer<typeof databaseEntrySchema>;
export const databaseEntrySchema = z.object({
  id: z.number(),
  // createdAt: z.string(),
  // updatedAt: z.string(),
  // deletedAt: z.string().nullable(),
});

export type ServerSuccess<T = any> = AxiosResponse<T>;
export type ServerError<T = any> = AxiosError<T>;

export type WithChildren = {
  children: ReactNode;
};

export type WithClassName = {
  className?: string;
};
