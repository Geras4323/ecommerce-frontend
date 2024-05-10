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
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./shadcn/popover";
import { useState } from "react";
import { cn } from "@/utils/lib";
import { useShoppingCart } from "@/hooks/cart";
import { useRouter } from "next/router";
import { Tangerine } from "next/font/google";
import { useTheme } from "next-themes";

const tangerine = Tangerine({ weight: ["700"], subsets: ["latin"] });

type Section = {
  title: string;
  description: string;
  Svg: LucideIcon;
  url: string;
  disabled: boolean;
};
const sections = [
  {
    title: "Mis datos",
    description: "Ver información de mi cuenta",
    Svg: User2,
    url: "/account",
    disabled: true,
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

  return (
    <header className="fixed z-50 flex h-16 w-full items-center justify-end border-b border-b-secondary/20 bg-base-300/70 px-6 py-2 backdrop-blur sm:justify-between">
      <Link
        href="/"
        className={cn(
          tangerine.className,
          "hidden select-none text-4xl text-primary sm:block"
        )}
      >
        Mis Ideas Pintadas
      </Link>

      <div className="flex items-center gap-4">
        <ThemeSwitcher />

        {session.isPending ? (
          <div className="h-8 w-44 animate-pulse rounded-lg bg-secondary/30" />
        ) : session.isError ? (
          <div>
            {router.pathname !== "/" &&
              router.pathname !== "/login" &&
              router.pathname !== "/signup" &&
              router.pathname !== "/sign" &&
              router.pathname !== "/sign/verifyEmail/[token]" && (
                <Link href="/sign" className="btn btn-primary btn-sm">
                  Iniciar sesión
                </Link>
              )}
          </div>
        ) : (
          <Popover
            open={isSessionOpen}
            onOpenChange={() => setIsSessionOpen((prev) => !prev)}
          >
            <PopoverTrigger className="btn btn-ghost btn-sm relative flex cursor-pointer items-center gap-2 pl-3 pr-2 text-primary">
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
            <PopoverContent align="end" sideOffset={17}>
              <article
                className={cn(
                  theme === "dark" ? "bg-base-300" : "bg-base-100",
                  "grid h-fit w-80 grid-cols-1 gap-6 overflow-hidden rounded-b-lg border border-t-0 border-secondary/20 p-4 shadow-xl"
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
