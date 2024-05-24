import Image from "next/image";
import React from "react";

type Speed = "slow" | "medium" | "fast";

export function VerticalImageMarquee({
  urls,
  speed,
}: {
  urls: string[];
  speed: Speed;
}) {
  return (
    <section className="h-full w-1/2 overflow-hidden">
      <ul
        className={`
        ${
          speed === "slow"
            ? "animate-marqueeSlow"
            : speed === "medium"
            ? "animate-marqueeMed"
            : "animate-marqueeFast"
        }
        mb-3 flex min-w-full flex-col justify-around gap-3`}
      >
        {urls.map((url, index) => (
          <li key={`${index} + 1`}>
            <MarqueeImage src={url} />
          </li>
        ))}
      </ul>

      <ul
        className={`
        ${
          speed === "slow"
            ? "animate-marqueeSlow"
            : speed === "medium"
            ? "animate-marqueeMed"
            : "animate-marqueeFast"
        }
        mb-3 flex min-w-full flex-col justify-around gap-3`}
      >
        {urls.map((url, index) => (
          <li key={`${index} + 2`}>
            <MarqueeImage src={url} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function MarqueeImage({ src }: { src: string }) {
  return (
    <img
      alt="marquee image"
      width={200}
      height={200}
      src={src}
      draggable={false}
      className="aspect-square w-full select-none rounded-xl border border-secondary/30 object-cover shadow-md lg:rounded-2xl"
    />
  );
}
