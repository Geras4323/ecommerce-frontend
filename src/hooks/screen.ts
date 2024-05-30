import { useEffect, useState } from "react";

export type SMQ = "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export const mqs = {
  xxs: 480,
  xs: 560,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
};

// function getMediaQuery(size: number): SMQ {
//   switch (true) {
//     case size <= 480: {
//       return "xxs";
//     }
//     case size <= 560: {
//       return "xs";
//     }
//     case size <= 640: {
//       return "sm";
//     }
//     case size <= 768: {
//       return "md";
//     }
//     case size <= 1024: {
//       return "lg";
//     }
//     case size <= 1280: {
//       return "xl";
//     }
//     case size > 1280: {
//       return "2xl";
//     }
//     default:
//       return "xxs";
//   }
// }

export function useMediaQueries(): number {
  const [mq, setMq] = useState<number>();

  const mqChange = () => {
    setMq(document.body.clientWidth);
  };

  useEffect(() => {
    setMq(document.body.clientWidth);
    window.addEventListener("resize", mqChange);

    return () => {
      window.removeEventListener("resize", mqChange);
    };
  }, []);

  return mq ?? 0;
}

// export function useMediaQueries() {
//   const [mq, setMq] = useState<SMQ>();

//   const mqChange = () => {
//     setMq(getMediaQuery(document.body.clientWidth));
//   };

//   useEffect(() => {
//     setMq(getMediaQuery(document.body.clientWidth));
//     window.addEventListener("resize", mqChange);

//     return () => {
//       window.removeEventListener("resize", mqChange);
//     };
//   }, []);

//   return mq;
// }
