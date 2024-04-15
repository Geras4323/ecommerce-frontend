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
  Svg: LucideIcon;
  url: string;
  disabled: boolean;
};
const sections = [
  {
    title: "Mis datos",
    Svg: User2,
    url: "/account",
    disabled: true,
  },
  {
    title: "Showroom",
    Svg: Package,
    url: "/showroom",
    disabled: false,
  },
  {
    title: "Mi carrito",
    Svg: ShoppingCartIcon,
    url: "/cart",
    disabled: false,
  },
  {
    title: "Mis pedidos",
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
    <header className="fixed z-50 flex h-16 w-full items-center justify-between border-b border-b-secondary/20 bg-base-300/70 px-6 py-2 backdrop-blur">
      <Link
        href="/"
        className={cn(tangerine.className, "select-none text-4xl text-primary")}
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
              router.pathname !== "/sign" && (
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
            <PopoverContent align="end" sideOffset={16}>
              <article
                className={cn(
                  theme === "dark" ? "bg-base-300" : "bg-base-100",
                  "flex h-fit w-48 flex-col overflow-hidden rounded-b-lg border border-secondary/20 shadow-xl"
                )}
              >
                {sections.map((section) => {
                  if (!section.disabled)
                    return (
                      <Link
                        key={section.title}
                        href={section.url}
                        className="flex h-14 cursor-pointer items-center justify-between gap-3 p-4 text-base text-primary/70 transition-all hover:bg-secondary/20 hover:text-primary"
                      >
                        <div className="relative">
                          <section.Svg className="size-5" />
                          {section.title === "Mi carrito" &&
                            cart.cartItems.data?.length !== 0 && (
                              <div className="absolute -right-2 -top-1 size-2 rounded-full bg-error" />
                            )}
                        </div>
                        <span>{section.title}</span>
                      </Link>
                    );
                })}

                <hr className="border-b-0 border-t border-t-secondary/20" />

                <button
                  onClick={() => logoutMutation.mutate()}
                  className="flex h-14 cursor-pointer items-center justify-between gap-3 p-4 text-base text-primary/70 transition-all hover:bg-secondary/20 hover:text-primary"
                >
                  <LogOut className="size-5" />
                  <span>Cerrar sesión</span>
                </button>
              </article>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  );
};
