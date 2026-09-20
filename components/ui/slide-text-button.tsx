"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";

interface SlideTextButtonProps {
  text?: string;

  hoverText?: string;

  href?: string;

  className?: string;

  variant?: "default" | "ghost";

  onClick?: () => void;

  disabled?: boolean;

  showCartIcon?: boolean;

  type?: "button" | "submit";
}

export default function SlideTextButton({
  text = "ADD TO CART",

  hoverText = "SHOPPING CART",

  href,

  className,

  variant = "default",

  onClick,

  disabled = false,

  showCartIcon = true,

  type = "button",
}: SlideTextButtonProps) {
  const variantStyles =
    variant === "ghost"
      ? `
          border
          border-[#8B2626]/20
          text-[#8B2626]
          hover:bg-[#8B2626]/5
        `
      : `
          bg-[#EF6905]
          text-[#F1E5A1]
          hover:bg-[#d95d04]
        `;

  const content = (
    <span
      className="
        relative
        inline-block
        transition-transform
        duration-300
        ease-in-out
        group-hover:-translate-y-full
      "
    >
      {/* DEFAULT TEXT */}

      <span
        className="
          flex
          items-center
          justify-center
          gap-2
          opacity-100
          transition-opacity
          duration-300
          group-hover:opacity-0
        "
      >
        <span className="font-black">
          {text}
        </span>
      </span>

      {/* HOVER TEXT */}

      <span
        className="
          absolute
          left-1/2
          top-full
          flex
          -translate-x-1/2
          items-center
          justify-center
          gap-2
          whitespace-nowrap
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
      >
        {showCartIcon && (
          <ShoppingCart
            size={17}
            strokeWidth={2.4}
          />
        )}

        <span className="font-black">
          {hoverText}
        </span>
      </span>
    </span>
  );

  const styles = cn(
    `
      group
      relative
      inline-flex
      h-12
      min-w-[190px]
      items-center
      justify-center
      overflow-hidden
      rounded-full
      px-8
      text-xs
      font-black
      tracking-[0.1em]
      transition-all
      duration-300

      disabled:pointer-events-none
      disabled:opacity-60
    `,

    variantStyles,

    className
  );

  if (href) {
    return (
      <motion.div
        initial={{
          y: 8,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.25,
        }}
      >
        <Link
          href={href}
          className={styles}
        >
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{
        y: 8,
        opacity: 0,
      }}
      animate={{
        y: 0,
        opacity: 1,
      }}
      transition={{
        duration: 0.25,
      }}
    >
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={styles}
      >
        {content}
      </button>
    </motion.div>
  );
}