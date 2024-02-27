import Image from "next/image";
import { ThemeSwitcher } from "./themeSwitcher";
import Logo from "../../public/logoNB.png";
import Link from "next/link";
import { useSession } from "@/hooks/session";
import {
  ChevronDown,
  type LucideIcon,
  ShoppingCartIcon,
  User2,
  Package,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./shadcn/popover";
import { useState } from "react";
import { cn } from "@/utils/lib";

type Section = {
  title: string;
  Svg: LucideIcon;
  url: string;
};
const sections: Section[] = [
  {
    title: "Mis datos",
    Svg: User2,
    url: "/account",
  },
  {
    title: "Showroom",
    Svg: Package,
    url: "/showroom",
  },
  {
    title: "Mi carrito",
    Svg: ShoppingCartIcon,
    url: "/cart",
  },
];

export const Header = () => {
  const session = useSession();

  const [isSessionOpen, setIsSessionOpen] = useState(false);

  return (
    <header className="fixed z-50 flex h-16 w-full items-center justify-between border-b border-b-secondary/20 bg-base-300/70 px-6 py-2 backdrop-blur">
      <Link href="/">
        <Image
          width={700}
          height={300}
          src={Logo}
          alt="logo"
          className="-ml-6 w-80"
        />
      </Link>
      <ThemeSwitcher />

      {session ? (
        <Popover
          open={isSessionOpen}
          onOpenChange={() => setIsSessionOpen((prev) => !prev)}
        >
          <PopoverTrigger className="flex cursor-pointer items-center gap-2 px-2 text-primary">
            <span className="text-lg">
              {session.data?.first_name} {session.data?.first_name}
            </span>
            <ChevronDown
              className={cn(
                isSessionOpen && "rotate-180",
                "size-5 transition-all"
              )}
            />
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={17} className="">
            <article className="flex h-fit w-48 flex-col overflow-hidden rounded-b-xl border border-secondary/20 bg-base-100">
              {sections.map((section) => (
                <Link
                  key={section.title}
                  href={section.url}
                  className="flex h-14 cursor-pointer items-center justify-between gap-3 p-4 text-base text-primary/70 transition-all hover:bg-secondary/20 hover:text-primary"
                >
                  <section.Svg className="size-5" />
                  <span>{section.title}</span>
                </Link>
              ))}
            </article>
          </PopoverContent>
        </Popover>
      ) : (
        <Link href="/login" className="btn btn-primary btn-sm">
          Iniciar sesión
        </Link>
      )}
    </header>
  );
};
