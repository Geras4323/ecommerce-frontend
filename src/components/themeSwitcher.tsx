import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  function switchTheme() {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <SunIcon className="size-5" />
      <input
        type="checkbox"
        className="toggle rounded-md transition-all duration-500"
        onClick={switchTheme}
        checked={theme === "dark"}
        readOnly
      />
      <MoonIcon className="size-5" />
    </div>
  );
}
