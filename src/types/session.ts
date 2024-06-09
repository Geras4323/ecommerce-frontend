import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";

export type JWTUser = {
  id: number;
  name: string;
  role: string;
  securityUUID: string;
};

export type ServerPage<T extends GetServerSideProps> = NextPage<
  Omit<InferGetServerSidePropsType<T>, "dehydratedState">
>;
