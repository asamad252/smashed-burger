"use client";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* =========================================================
   ANIMATED SVG LOADER
========================================================= */

let cachedPathLength = 0;
let stylesInjected = false;

const LOADER_KEYFRAMES = `
  @keyframes drawStroke {
    0% {
      stroke-dashoffset: var(--path-length);
      animation-timing-function: ease-in-out;
    }

    50% {
      stroke-dashoffset: 0;
      animation-timing-function: ease-in-out;
    }

    100% {
      stroke-dashoffset: calc(var(--path-length) * -1);
    }
  }
`;

interface LoaderProps
  extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number | string;
}

export const Loader =
  React.forwardRef<
    SVGSVGElement,
    LoaderProps
  >(
    (
      {
        className,
        size = 64,
        strokeWidth = 2,
        ...props
      },
      ref
    ) => {
      const pathRef =
        useRef<SVGPathElement>(
          null
        );

      const [
        pathLength,
        setPathLength,
      ] = useState<number>(
        cachedPathLength
      );

      useEffect(() => {
        if (
          typeof window !==
            "undefined" &&
          !stylesInjected
        ) {
          stylesInjected = true;

          const style =
            document.createElement(
              "style"
            );

          style.innerHTML =
            LOADER_KEYFRAMES;

          document.head.appendChild(
            style
          );
        }

        if (
          !cachedPathLength &&
          pathRef.current
        ) {
          cachedPathLength =
            pathRef.current.getTotalLength();

          setPathLength(
            cachedPathLength
          );
        }
      }, []);

      const isReady =
        pathLength > 0;

      return (
        <svg
          ref={ref}
          role="status"
          aria-label="Loading..."
          viewBox="0 0 19 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          className={cn(
            "text-current",
            className
          )}
          {...props}
        >
          <path
            ref={pathRef}
            d="M4.43431 2.42415C-0.789139 6.90104 1.21472 15.2022 8.434 15.9242C15.5762 16.6384 18.8649 9.23035 15.9332 4.5183C14.1316 1.62255 8.43695 0.0528911 7.51841 3.33733C6.48107 7.04659 15.2699 15.0195 17.4343 16.9241"
            stroke="currentColor"
            strokeWidth={
              strokeWidth
            }
            strokeLinecap="round"
            style={
              isReady
                ? ({
                    strokeDasharray:
                      pathLength,

                    "--path-length":
                      pathLength,
                  } as React.CSSProperties)
                : undefined
            }
            className={cn(
              "transition-opacity duration-300",

              isReady
                ? "opacity-100 animate-[drawStroke_2.5s_infinite]"
                : "opacity-0"
            )}
          />
        </svg>
      );
    }
  );

Loader.displayName = "Loader";

/* =========================================================
   SMASHED LOADING TEXT
========================================================= */

interface LoadingBreadcrumbProps {
  text?: string;
  className?: string;

  /*
    dark:
    use on maroon backgrounds

    light:
    use on cream backgrounds
  */
  variant?: "dark" | "light";

  showArrow?: boolean;
}

export function LoadingBreadcrumb({
  text = "Cooking",
  className,
  variant = "dark",
  showArrow = false,
}: LoadingBreadcrumbProps) {
  const dark =
    variant === "dark";

  return (
    <>
      <style>
        {`
          @keyframes smashedTextShimmer {
            0% {
              background-position: -100% center;
            }

            100% {
              background-position: 100% center;
            }
          }

          .smashed-shimmer-dark {
            background-image: linear-gradient(
              90deg,
              rgba(241,229,161,0.45) 0%,
              rgba(241,229,161,0.65) 35%,
              #EF6905 50%,
              rgba(241,229,161,0.65) 65%,
              rgba(241,229,161,0.45) 100%
            );
          }

          .smashed-shimmer-light {
            background-image: linear-gradient(
              90deg,
              rgba(139,38,38,0.45) 0%,
              rgba(139,38,38,0.7) 35%,
              #EF6905 50%,
              rgba(139,38,38,0.7) 65%,
              rgba(139,38,38,0.45) 100%
            );
          }
        `}
      </style>

      <div
        className={cn(
          `
            flex
            items-center
            justify-center
            gap-3
            text-sm
            font-black
            uppercase
            tracking-[0.16em]
          `,
          className
        )}
      >
        <Loader
          size={24}
          strokeWidth={2.4}
          className={
            dark
              ? "text-[#EF6905]"
              : "text-[#8B2626]"
          }
        />

        <span
          className={cn(
            `
              bg-clip-text
              text-transparent
            `,

            dark
              ? "smashed-shimmer-dark"
              : "smashed-shimmer-light"
          )}
          style={{
            backgroundSize:
              "200% auto",

            animation:
              "smashedTextShimmer 2s ease-in-out infinite",
          }}
        >
          {text}
        </span>

        {showArrow && (
          <ChevronRight
            size={16}
            className={
              dark
                ? "text-[#F1E5A1]/40"
                : "text-[#8B2626]/40"
            }
          />
        )}
      </div>
    </>
  );
}