import { ThemeSwitcher } from "./themeSwitcher";
import Link from "next/link";
import { useSession } from "@/hooks/session";
import {
  ChevronDown,
  type LucideIcon,
  ShoppingCartIcon,
  User2,
  Package,
  WalletCards,
  LogOut,
  Home,
  UserRoundCog,
  Palmtree,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./shadcn/popover";
import { useEffect, useState } from "react";
import { cn } from "@/utils/lib";
import { useShoppingCart } from "@/hooks/cart";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { Arizonia } from "next/font/google";
import { LoadableButton } from "./forms";
import { useQuery } from "@tanstack/react-query";
import { getState } from "@/functions/states";
import { type ServerError } from "@/types/types";

const arizonia = Arizonia({ weight: ["400"], subsets: ["latin"] });

type Section = {
  title: string;
  description: string;
  Svg: LucideIcon;
  url: string;
  disabled: boolean;
};

const urlsShowLogin = [
  "/",
  "/login",
  "/signup",
  "/sign",
  "/sign/verifyEmail/[token]",
  "/sign/resetPassword/[token]",
];

const sections = [
  {
    title: "Inicio",
    description: "Pantalla principal",
    Svg: Home,
    url: "/",
    disabled: false,
  },
  {
    title: "Showroom",
    description: "Los productos disponibles",
    Svg: Package,
    url: "/showroom",
    disabled: false,
  },
  // {
  //   title: "Mi cuenta",
  //   description: "Ver información de mi cuenta",
  //   Svg: User2,
  //   url: "/account",
  //   disabled: false,
  // },
] as const satisfies readonly Section[];

export const Header = () => {
  const { session, logoutMutation } = useSession();
  const cart = useShoppingCart();

  const router = useRouter();
  const { theme } = useTheme();

  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [isNavBordered, setIsNavBordered] = useState(false);

  const vacationStateQuery = useQuery<
    Awaited<ReturnType<typeof getState>>,
    ServerError
  >({
    queryKey: ["vacation", "header"],
    queryFn: () => getState("vacation"),
    retry: false,
    staleTime: 1000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    function onScroll() {
      setIsNavBordered(window.scrollY > 1);
    }

    document.addEventListener("scroll", onScroll);
    return () => document.removeEventListener("scroll", onScroll);
  }, [isNavBordered]);

  return (
    <header
      className={cn(
        theme === "light"
          ? "border-b-secondary/20 bg-base-300/70"
          : isNavBordered
          ? "border-b-secondary/20 bg-base-100"
          : "border-b-transparent bg-base-100",
        "fixed top-0 z-20 flex h-16 w-full items-center justify-between border border-secondary/20 px-6 py-2 backdrop-blur transition-all duration-500"
      )}
    >
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className={cn(
            arizonia.className,
            router.pathname === "/sign" ? "block" : "hidden sm:block",
            "select-none text-3xl text-primary"
          )}
        >
          Mis Ideas Pintadas
        </Link>

        {vacationStateQuery.data?.active && (
          <div
            className={cn(
              theme === "dark" ? "text-warning" : "text-primary",
              "flex items-center gap-2 text-sm font-semibold tracking-wide xs:text-base"
            )}
          >
            <Palmtree className="mb-0.5 size-5 min-w-5" />
            VACACIONES
          </div>
        )}
      </div>

      <div className="flex items-center">
        <ThemeSwitcher />

        {session.isPending ? (
          <div className="h-8 w-44 animate-pulse rounded-lg bg-secondary/30 sm:ml-4" />
        ) : session.isError ? (
          <div>
            {!urlsShowLogin.some((i) => i === router.pathname) && (
              <Link
                href="/sign"
                className="btn btn-primary btn-sm ml-4 whitespace-nowrap"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        ) : (
          <Popover
            open={isSessionOpen}
            onOpenChange={() => setIsSessionOpen((prev) => !prev)}
          >
            <PopoverTrigger className="btn btn-ghost btn-sm relative flex cursor-pointer items-center gap-2 pl-3 pr-2 text-primary sm:ml-4">
              <span className="text-lg font-medium">{session.data.name}</span>
              <ChevronDown
                className={cn(
                  isSessionOpen && "rotate-180",
                  "size-5 transition-all"
                )}
              />
              {!cart.cartItems.isPending &&
                cart.cartItems.data?.length !== 0 && (
                  <div className="absolute right-0.5 top-0.5 size-2 rounded-full bg-error" />
                )}
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={15}>
              <article
                className={cn(
                  theme === "dark" ? "bg-base-300" : "bg-base-100",
                  "grid h-fit w-80 grid-cols-1 gap-6 overflow-hidden rounded-b-lg border border-secondary/20 p-4 shadow-xl"
                )}
              >
                {sections.map((section) => {
                  if (!section.disabled)
                    return (
                      <Link
                        key={section.title}
                        href={section.url}
                        className="flex h-fit cursor-pointer items-start gap-3 text-base text-primary/80 transition-all hover:text-primary/90"
                      >
                        <div className="relative mt-0.5">
                          <section.Svg className="size-6" />
                          {/* {section.title === "Mi carrito" &&
                            cart.cartItems.data?.length !== 0 && (
                              <div className="absolute -right-2 -top-1 size-2 rounded-full bg-error" />
                            )} */}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-lg">{section.title}</span>
                          <span className="text-sm text-secondary">
                            {section.description}
                          </span>
                        </div>
                      </Link>
                    );
                })}

                <div className="flex h-fit cursor-pointer items-start gap-3 text-base text-primary/80 transition-all hover:text-primary/90">
                  <div className="relative mt-0.5">
                    <User2 className="size-6" />
                  </div>
                  <div className="flex w-full flex-col gap-1">
                    <span className="text-lg">Mi cuenta</span>
                    <div className="flex h-9 items-center gap-2">
                      <Link
                        href="/account"
                        className="flex h-full w-full items-center justify-center rounded-lg bg-secondary/15 hover:bg-secondary/30"
                      >
                        <UserRoundCog className="size-5 min-w-5" />
                      </Link>
                      <Link
                        href="/account/cart"
                        className="relative flex h-full w-full items-center justify-center rounded-lg bg-secondary/15 hover:bg-secondary/30"
                      >
                        <ShoppingCartIcon className="size-5 min-w-5" />
                        {cart.cartItems.data?.length !== 0 && (
                          <div className="absolute right-5 top-1 size-2 rounded-full bg-error" />
                        )}
                      </Link>
                      <Link
                        href="/account/orders"
                        className="flex h-full w-full items-center justify-center rounded-lg bg-secondary/15 hover:bg-secondary/30"
                      >
                        <WalletCards className="size-5 min-w-5" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <LoadableButton
                    onClick={() => logoutMutation.mutate()}
                    isPending={logoutMutation.isPending}
                    className="btn btn-ghost btn-sm flex w-44 gap-3 self-end"
                  >
                    <LogOut className="size-5" />
                    <span>Cerrar sesión</span>
                  </LoadableButton>
                </div>
              </article>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  );
};
