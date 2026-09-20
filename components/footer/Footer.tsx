"use client";

import Image from "next/image";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-[#8B2626] text-[#F1E5A1]">

      <div
        className="
          mx-auto
          grid
          max-w-[1200px]
          grid-cols-1
          gap-8
          px-6
          py-8
          md:grid-cols-3
          md:items-center
        "
      >
        {/* LOGO */}
        <div className="flex md:justify-start">
          <div className="relative h-[65px] w-[180px]">
            <Image
              src="/images/smashed-logo.png"
              alt="Smashed"
              fill
              priority
              className="object-contain object-left"
            />
          </div>
        </div>

        {/* CONTACT */}
        <div className="md:justify-self-center">
          <h3 className="mb-3 text-lg font-black">
            Smashed
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="font-black">
                Phone:
              </span>

              <a
                href="tel:030012345678"
                className="text-[#F1E5A1]/80 hover:text-[#EF6905]"
              >
                0300 12345678
              </a>
            </div>

            <div className="flex gap-2">
              <span className="font-black">
                Address:
              </span>

              <span className="text-[#F1E5A1]/80">
                DHA Phase 8, Karachi
              </span>
            </div>
          </div>
        </div>

        {/* SOCIAL */}
        <div className="md:justify-self-end">
          <h3 className="mb-3 text-lg font-black">
            Follow Us:
          </h3>

          <div className="flex gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-[#F1E5A1]
                text-[#8B2626]
                hover:bg-[#EF6905]
                hover:text-[#F1E5A1]
              "
            >
              <FaFacebookF size={18} />
            </a>

            <a
              href="#"
              aria-label="Instagram"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border-2
                border-[#F1E5A1]
                text-[#F1E5A1]
                hover:border-[#EF6905]
                hover:bg-[#EF6905]
              "
            >
              <FaInstagram size={19} />
            </a>
          </div>

          <div className="mt-4 flex gap-5 text-xs">
            <a
              href="/privacy"
              className="hover:text-[#EF6905]"
            >
              Privacy Policy
            </a>

            <a
              href="/faqs"
              className="hover:text-[#EF6905]"
            >
              FAQs
            </a>
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="h-px bg-[#F1E5A1]/20" />
      </div>

      {/* COPYRIGHT */}
      <div className="py-4 text-center text-xs text-[#F1E5A1]/60">
        © 2026 SMASHED. All rights reserved.
      </div>

    </footer>
  );
}