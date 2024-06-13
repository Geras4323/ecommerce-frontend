import type { AxiosResponse, AxiosError } from "axios";
import type { ReactNode } from "react";
import { z } from "zod";

export type DatabaseEntry = z.infer<typeof databaseEntrySchema>;
export const databaseEntrySchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  // updatedAt: z.string(),
  // deletedAt: z.string().nullable(),
});

interface DBError {
  comment: string;
  error: string;
}

export type ServerSuccess<T = any> = AxiosResponse<T>;
export type ServerError = AxiosError<DBError>;

export type WithChildren = {
  children?: ReactNode;
};

export type WithClassName = {
  className?: string;
};
