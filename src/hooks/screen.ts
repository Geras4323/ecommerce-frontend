import { useEffect, useState } from "react";

type SMQ = "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

function getMediaQuery(size: number): SMQ {
  switch (true) {
    case size <= 480: {
      return "xxs";
    }
    case size <= 560: {
      return "xs";
    }
    case size <= 640: {
      return "sm";
    }
    case size <= 768: {
      return "md";
    }
    case size <= 1024: {
      return "lg";
    }
    case size <= 1280: {
      return "xl";
    }
    case size > 1280: {
      return "2xl";
    }
    default:
      return "xxs";
  }
}

export function useMediaQueries() {
  const [mq, setMq] = useState<SMQ>();

  const mqChange = () => {
    setMq(getMediaQuery(document.body.clientWidth));
  };

  useEffect(() => {
    setMq(getMediaQuery(document.body.clientWidth));
    window.addEventListener("resize", mqChange);

    return () => {
      window.removeEventListener("resize", mqChange);
    };
  }, []);

  return mq;
}
