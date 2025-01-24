import { Header } from "@/components/header";
import type { WithChildren } from "@/types/types";
import Head from "next/head";
import { WhatsApp } from "public/special_svgs/whatsapp";

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
      <div className="relative flex h-svh w-full bg-base-100">
        {children}

        <a
          href="https://wa.me/5491133568258"
          target="_blank"
          className="fixed bottom-4 right-4 flex size-14 items-center justify-center rounded-full bg-gradient-to-b from-[#56d062] to-[#22b23a]"
        >
          <WhatsApp className="size-9" fill="white" />
        </a>
      </div>
    </>
  );
};
