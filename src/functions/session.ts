import { type ServerError } from "@/types/types";
import { vars } from "@/utils/vars";
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
  email: z.string(),
  name: z.string(),
  phone: z.string().nullable(),
  role: z.enum(["admin", "customer"]),
  verified: z.boolean(),
});

export async function getSession(sessionCookie?: string) {
  const url = `${vars.serverUrl}/api/v1/auth/session`;
  const options: Record<string, any> = { withCredentials: true };
  if (sessionCookie) {
    options["headers"] = { Cookie: `ec_session=${sessionCookie}` };
  }
  const res = await axios.get(url, options);
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
    .fetchQuery<Session, ServerError>({
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

export const leaveIfVerified: GetServerSideProps = async (c) => {
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

  return session.verified ? redirect("/") : { props: {} };
};
