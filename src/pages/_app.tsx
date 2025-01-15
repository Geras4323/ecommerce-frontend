import "@/styles/globals.css";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { useState } from "react";
import { Comfortaa } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { type ServerError } from "@/types/types";
import { useRouter } from "next/router";
import { ReloginModal } from "@/components/modals/auth";

const comfortaa = Comfortaa({ subsets: ["latin"] });

const hideReloginPages = ["/", "/showroom", "/sign"] as const;

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const [isReloginModalOpen, setIsReloginModalOpen] = useState(false);

  const openReloginModalIfError = (error: ServerError) => {
    if (
      error.response?.data.error === "http: named cookie not present" &&
      !hideReloginPages.includes(
        router.pathname as (typeof hideReloginPages)[number]
      )
    ) {
      setIsReloginModalOpen(true);
    }
  };

  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (err) => openReloginModalIfError(err as unknown as ServerError),
    }),
    mutationCache: new MutationCache({
      onError: (err) => openReloginModalIfError(err as unknown as ServerError),
    }),
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <div className={comfortaa.className}>
          <Component {...pageProps} />
          <ReloginModal
            isOpen={isReloginModalOpen}
            setIsOpen={setIsReloginModalOpen}
          />
          <Analytics />
        </div>
      </ThemeProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
