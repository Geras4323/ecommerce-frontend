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
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./shadcn/popover";
import { useEffect, useState } from "react";
import { cn } from "@/utils/lib";
import { useShoppingCart } from "@/hooks/cart";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { Arizonia } from "next/font/google";

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
];

const sections = [
  {
    title: "Mis datos",
    description: "Ver información de mi cuenta",
    Svg: User2,
    url: "/account",
    disabled: true,
  },
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
  {
    title: "Mi carrito",
    description: "Confirma tus pedidos",
    Svg: ShoppingCartIcon,
    url: "/cart",
    disabled: false,
  },
  {
    title: "Mis pedidos",
    description: "Todos los pedidos que hiciste",
    Svg: WalletCards,
    url: "/orders",
    disabled: false,
  },
] as const satisfies readonly Section[];

export const Header = () => {
  const { session, logoutMutation } = useSession();
  const cart = useShoppingCart();

  const router = useRouter();
  const { theme } = useTheme();

  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [isNavBordered, setIsNavBordered] = useState(false);

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
        isNavBordered || theme === "light"
          ? "border-b-secondary/20"
          : "border-b-transparent",
        theme === "dark" ? "bg-base-100/70" : "bg-base-300/70",
        "fixed z-50 flex h-16 w-full items-center justify-between border border-secondary/20 px-6 py-2 backdrop-blur transition-all duration-500"
      )}
    >
      <Link
        href="/"
        className={cn(
          arizonia.className,
          router.pathname === "/sign"
            ? "block"
            : "invisible w-0 sm:visible sm:w-fit",
          "select-none text-3xl text-primary"
        )}
      >
        Mis Ideas Pintadas
      </Link>

      <div className="flex items-center">
        <ThemeSwitcher />

        {session.isPending ? (
          <div className="ml-4 h-8 w-44 animate-pulse rounded-lg bg-secondary/30" />
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
            <PopoverTrigger className="btn btn-ghost btn-sm relative ml-4 flex cursor-pointer items-center gap-2 pl-3 pr-2 text-primary">
              <span className="text-lg font-medium">
                {session.data.name} {session.data.surname}
              </span>
              <ChevronDown
                className={cn(
                  isSessionOpen && "rotate-180",
                  "size-5 transition-all"
                )}
              />
              {!cart.cartItems.isPending &&
                cart.cartItems.data?.length !== 0 && (
                  <div className="absolute right-0 top-0 size-2 rounded-full bg-error" />
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
                          {section.title === "Mi carrito" &&
                            cart.cartItems.data?.length !== 0 && (
                              <div className="absolute -right-2 -top-1 size-2 rounded-full bg-error" />
                            )}
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

                <div className="flex justify-end">
                  <button
                    onClick={() => logoutMutation.mutate()}
                    className="btn btn-ghost btn-sm flex w-44 gap-3 self-end"
                  >
                    <LogOut className="size-5" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </article>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  );
};
