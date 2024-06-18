import { GeneralLayout } from "@/layouts/general";
import { type WithChildren } from "@/types/types";
import { cn } from "@/utils/lib";
import { Cog, ShoppingCart, WalletCards } from "lucide-react";
import Link from "next/link";

type AccountSection = (typeof accountSections)[number]["name"];
const accountSections = [
  {
    name: "General",
    url: "/account",
    svg: Cog,
  },
  {
    name: "Carrito",
    url: "/account/cart",
    svg: ShoppingCart,
  },
  {
    name: "Pedidos",
    url: "/account/orders",
    svg: WalletCards,
  },
] as const;

export const AccountLayout = ({
  active,
  children,
}: { active: AccountSection } & WithChildren) => {
  return (
    <GeneralLayout title="Mi cuenta" description="Información de mi cuenta">
      <div className="flex h-screen w-screen flex-row items-start justify-center gap-4 px-4 pb-8 pt-32">
        {children}

        <div className="hidden h-full w-px bg-gradient-to-b from-secondary/30 via-transparent to-transparent md:block" />

        <div className="hidden h-fit w-64 flex-col gap-6 md:flex">
          <div className="flex h-14 w-full flex-col items-end">
            <span className="w-fit text-2xl font-semibold uppercase tracking-wide text-primary">
              Secciones
            </span>
            <p className="text-secondary">Tu cuenta</p>
          </div>

          <div className="flex h-fit w-64 min-w-64 flex-col gap-2">
            {accountSections.map((section) => (
              <Link
                key={section.name}
                href={section.url}
                className={cn(
                  active === section.name &&
                    "bg-secondary/20 font-bold text-primary",
                  "group flex h-10 w-full cursor-pointer items-center justify-end gap-4 rounded-md px-4 transition-colors hover:bg-secondary/30"
                )}
              >
                {section.name}
                <section.svg
                  className={cn(
                    section.name === "General" && "group-hover:animate-spin",
                    "size-5 min-w-5"
                  )}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </GeneralLayout>
  );
};
