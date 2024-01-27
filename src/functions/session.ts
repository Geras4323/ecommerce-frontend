import { type ServerError } from "@/types/types";
import {
  type DehydratedState,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import axios from "axios";
import { type GetServerSideProps } from "next";
import { z } from "zod";

export type Session = z.infer<typeof sessionSchema>;
export const sessionSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  username: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string(),
  role: z.enum(["admin", "customer"]),
  orders: z.any().nullable(),
});

export async function getSession(sessionCookie: string) {
  const url = "http://localhost:1323/api/v1/auth/session";
  const res = await axios.get(url, {
    withCredentials: true,
    headers: { Cookie: `ec_session=${sessionCookie}` },
  });
  return sessionSchema.parse(res.data);
}

type X = (desiredRole: "admin" | "noAdmin") => GetServerSideProps<{
  session: Session;
  dehydratedState: DehydratedState;
}>;

export const withAuth: X = (desiredRole) => async (c) => {
  const queryClient = new QueryClient();
  const sessionCookie = c.req.cookies.ec_session;

  const redirectToLanding = {
    redirect: {
      permanent: false,
      destination: "/",
    },
  };

  if (!sessionCookie) return redirectToLanding;

  const session = await queryClient
    .fetchQuery<Session, ServerError, Session>({
      queryKey: ["session"],
      queryFn: () => getSession(sessionCookie),
    })
    .catch(() => undefined);

  if (!session) return redirectToLanding;

  if (desiredRole === "admin" && session.role !== "admin")
    return redirectToLanding;

  return {
    props: {
      session,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export const leaveIfLoggedIn: GetServerSideProps = async (c) => {
  const queryClient = new QueryClient();
  const sessionCookie = c.req.cookies.ec_session;

  const redirect = (destination: string) => ({
    redirect: {
      permanent: false,
      destination: destination,
    },
  });

  if (!sessionCookie) return { props: {} };

  const session = await queryClient
    .fetchQuery<Session, ServerError, Session>({
      queryKey: ["session"],
      queryFn: () => getSession(sessionCookie),
    })
    .catch(() => undefined);

  if (!session) return { props: {} };

  return session.role === "admin" ? redirect("/") : redirect("showroom");
};
