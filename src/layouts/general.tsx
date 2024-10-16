import { Header } from "@/components/header";
import type { WithChildren } from "@/types/types";
import Head from "next/head";

export const GeneralLayout = ({
  children,
  title,
  description,
}: WithChildren & { title: string; description: string }) => {
  return (
    <>
      <Head>
        <title>{`Mis Ideas Pintadas | ${title}`}</title>
        <meta name="description" content={description} />
      </Head>
      <Header />
      <div className="flex min-h-screen w-full bg-base-100">{children}</div>
    </>
  );
};
