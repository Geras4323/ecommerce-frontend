import Image from "next/image";
import { ThemeSwitcher } from "./themeSwitcher";
import Logo from "../../public/logoNB.png";
import Link from "next/link";

export const Header = () => {
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
    </header>
  );
};
