"use client";

import Image from "next/image";
import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  ShoppingBag,
  UserRound,
  LogOut,
} from "lucide-react";

import {
  motion,
} from "motion/react";

import type {
  User,
} from "@supabase/supabase-js";

import {
  supabase,
} from "@/lib/supabase";

/* =========================================================
   NAV ITEMS
========================================================= */

const navItems = [
  {
    label: "HOME",
    href: "/",
  },
  {
    label: "MENU",
    href: "/menu",
  },
  {
    label: "BUILD",
    href: "/build",
  },
  {
    label: "ABOUT",
    href: "/about",
  },
];

/* =========================================================
   GET CART COUNT FROM SUPABASE
========================================================= */

async function getCartCount(
  userId: string
) {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "cart_items"
      )
      .select(
        "quantity"
      )
      .eq(
        "user_id",
        userId
      );

  if (error) {
    console.error(
      "Cart count error:",
      error
    );

    return 0;
  }

  const total =
    (data ?? []).reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.quantity
        ),
      0
    );

  return total;
}

/* =========================================================
   NAVBAR
========================================================= */

export default function Navbar() {
  const router =
    useRouter();

  const pathname =
    usePathname();

  /* =======================================================
     AUTH STATE
  ======================================================= */

  const [
    user,
    setUser,
  ] =
    useState<
      User | null
    >(null);

  const [
    authLoading,
    setAuthLoading,
  ] =
    useState(true);

  /* =======================================================
     CART COUNT
  ======================================================= */

  const [
    cartCount,
    setCartCount,
  ] =
    useState(0);

  /* =======================================================
     SUPABASE AUTH
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      setUser(
        user
      );

      setAuthLoading(
        false
      );
    }

    loadUser();

    /* =========================================
       LISTEN FOR LOGIN / LOGOUT
    ========================================= */

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {
          if (!mounted) {
            return;
          }

          setUser(
            session?.user ??
              null
          );

          setAuthLoading(
            false
          );
        }
      );

    return () => {
      mounted = false;

      subscription.unsubscribe();
    };
  }, []);

  /* =======================================================
     LOAD USER CART COUNT
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadCart() {
      /* =====================================
         NO USER = NO CART
      ===================================== */

      if (!user) {
        setCartCount(
          0
        );

        return;
      }

      const total =
        await getCartCount(
          user.id
        );

      if (!mounted) {
        return;
      }

      setCartCount(
        total
      );
    }

    loadCart();

    /* =========================================
       LISTEN FOR ADD TO CART

       Menu page sends:
       "smashed-cart-updated"
    ========================================= */

    function handleCartUpdate(
      event: Event
    ) {
      const customEvent =
        event as CustomEvent<{
          count?: number;
        }>;

      /*
        If MenuPage already gives us
        the new count, update instantly.
      */

      if (
        typeof customEvent
          .detail?.count ===
        "number"
      ) {
        setCartCount(
          customEvent.detail
            .count
        );

        return;
      }

      /*
        Otherwise reload it from Supabase.
      */

      if (user) {
        getCartCount(
          user.id
        ).then(
          (
            total
          ) => {
            if (
              mounted
            ) {
              setCartCount(
                total
              );
            }
          }
        );
      }
    }

    window.addEventListener(
      "smashed-cart-updated",
      handleCartUpdate
    );

    return () => {
      mounted = false;

      window.removeEventListener(
        "smashed-cart-updated",
        handleCartUpdate
      );
    };
  }, [user]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    const {
      error,
    } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout error:",
        error
      );

      return;
    }

    setUser(
      null
    );

    setCartCount(
      0
    );

    router.push(
      "/"
    );

    router.refresh();
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <header
      className="
        relative
        z-50
        w-full
        bg-[#8B2626]
        px-4
        py-3
        text-[#F1E5A1]
        lg:px-6
      "
    >
      <div
        className="
          relative
          mx-auto
          flex
          min-h-[68px]
          max-w-[1500px]
          items-center
          justify-between
        "
      >
        {/* =================================================
            LOGO
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            router.push(
              "/"
            )
          }
          aria-label="Go to homepage"
          className="
            relative
            z-20
            h-[62px]
            w-[175px]
            shrink-0
            overflow-hidden
            sm:w-[190px]
            lg:w-[210px]
          "
        >
          <Image
            src="/images/smashed-logo.png"
            alt="Smashed"
            fill
            priority
            className="
              object-cover
              object-center
            "
          />
        </button>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <nav
          className="
            absolute
            left-1/2
            top-1/2
            hidden
            -translate-x-1/2
            -translate-y-1/2
            items-center
            gap-1
            rounded-full
            bg-[#F1E5A1]/10
            p-1.5
            backdrop-blur
            md:flex
          "
        >
          {navItems.map(
            (
              item
            ) => {
              const active =
                pathname ===
                item.href;

              return (
                <motion.button
                  key={
                    item.href
                  }
                  type="button"
                  onClick={() =>
                    router.push(
                      item.href
                    )
                  }
                  whileHover={{
                    scale:
                      1.05,
                  }}
                  whileTap={{
                    scale:
                      0.94,
                  }}
                  className={`
                    relative
                    rounded-full
                    px-5
                    py-2.5
                    text-xs
                    font-black
                    tracking-[0.08em]
                    transition-colors

                    ${
                      active
                        ? "text-[#8B2626]"
                        : "text-[#F1E5A1]"
                    }
                  `}
                >
                  {/* ACTIVE BACKGROUND */}

                  {active && (
                    <motion.span
                      layoutId="navbar-active"
                      transition={{
                        type:
                          "spring",

                        stiffness:
                          350,

                        damping:
                          26,
                      }}
                      className="
                        absolute
                        inset-0
                        rounded-full
                        bg-[#F1E5A1]
                      "
                    />
                  )}

                  <span
                    className="
                      relative
                      z-10
                    "
                  >
                    {
                      item.label
                    }
                  </span>
                </motion.button>
              );
            }
          )}
        </nav>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div
          className="
            relative
            z-20
            flex
            items-center
            gap-2
          "
        >
          {/* =================================================
              CART BUTTON
          ================================================= */}

          <motion.button
            type="button"
            onClick={() =>
              router.push(
                "/cart"
              )
            }
            whileHover={{
              y: -2,
              scale:
                1.04,
            }}
            whileTap={{
              scale:
                0.93,
            }}
            aria-label={`Cart with ${cartCount} items`}
            className="
              relative
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              border
              border-[#F1E5A1]/25
              text-[#F1E5A1]
              transition
              hover:bg-[#F1E5A1]
              hover:text-[#8B2626]
            "
          >
            <ShoppingBag
              size={
                19
              }
            />

            {/* =============================================
                CART BADGE
            ============================================= */}

            {cartCount >
              0 && (
              <motion.span
                key={
                  cartCount
                }
                initial={{
                  scale:
                    0.5,

                  opacity:
                    0,
                }}
                animate={{
                  scale:
                    1,

                  opacity:
                    1,
                }}
                className="
                  absolute
                  -right-1.5
                  -top-1.5
                  flex
                  h-[20px]
                  min-w-[20px]
                  items-center
                  justify-center
                  rounded-full
                  bg-[#EF6905]
                  px-1
                  text-[10px]
                  font-black
                  leading-none
                  text-[#F1E5A1]
                  shadow-md
                "
              >
                {cartCount >
                99
                  ? "99+"
                  : cartCount}
              </motion.span>
            )}
          </motion.button>

          {/* =================================================
              AUTH LOADING
          ================================================= */}

          {authLoading && (
            <div
              className="
                h-11
                w-11
                animate-pulse
                rounded-full
                bg-[#F1E5A1]/15
              "
            />
          )}

          {/* =================================================
              LOGGED OUT
          ================================================= */}

          {!authLoading &&
            !user && (
              <motion.button
                type="button"
                onClick={() =>
                  router.push(
                    "/auth"
                  )
                }
                whileHover={{
                  y: -2,
                  scale:
                    1.04,
                }}
                whileTap={{
                  scale:
                    0.93,
                }}
                aria-label="Login"
                className="
                  flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#F1E5A1]
                  px-3
                  text-[#8B2626]
                  transition
                  hover:bg-[#EF6905]
                  hover:text-[#F1E5A1]
                  sm:px-4
                "
              >
                <UserRound
                  size={
                    19
                  }
                />

                <span
                  className="
                    hidden
                    text-xs
                    font-black
                    tracking-[0.08em]
                    sm:block
                  "
                >
                  LOGIN
                </span>
              </motion.button>
            )}

          {/* =================================================
              LOGGED IN
          ================================================= */}

          {!authLoading &&
            user && (
              <>
                {/* ACCOUNT */}

                <motion.button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/account"
                    )
                  }
                  whileHover={{
                    y: -2,
                    scale:
                      1.04,
                  }}
                  whileTap={{
                    scale:
                      0.93,
                  }}
                  aria-label="My account"
                  title={
                    user.email ??
                    "My Account"
                  }
                  className="
                    flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-[#F1E5A1]
                    px-3
                    text-[#8B2626]
                    transition
                    hover:bg-[#EF6905]
                    hover:text-[#F1E5A1]
                    sm:px-4
                  "
                >
                  <UserRound
                    size={
                      19
                    }
                  />

                  <span
                    className="
                      hidden
                      max-w-[120px]
                      truncate
                      text-xs
                      font-black
                      tracking-[0.04em]
                      sm:block
                    "
                  >
                    ACCOUNT
                  </span>
                </motion.button>

                {/* LOGOUT */}

                <motion.button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  whileHover={{
                    y: -2,
                    scale:
                      1.04,
                  }}
                  whileTap={{
                    scale:
                      0.93,
                  }}
                  aria-label="Logout"
                  title="Logout"
                  className="
                    hidden
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#F1E5A1]/25
                    text-[#F1E5A1]
                    transition
                    hover:border-[#EF6905]
                    hover:bg-[#EF6905]
                    sm:flex
                  "
                >
                  <LogOut
                    size={
                      18
                    }
                  />
                </motion.button>
              </>
            )}
        </div>
      </div>

      {/* =================================================
          MOBILE NAVIGATION
      ================================================= */}

      <nav
        className="
          mt-2
          flex
          items-center
          justify-center
          gap-1
          overflow-x-auto
          pb-1
          md:hidden
        "
      >
        {navItems.map(
          (
            item
          ) => {
            const active =
              pathname ===
              item.href;

            return (
              <motion.button
                key={
                  item.href
                }
                type="button"
                onClick={() =>
                  router.push(
                    item.href
                  )
                }
                whileTap={{
                  scale:
                    0.94,
                }}
                className={`
                  relative
                  whitespace-nowrap
                  rounded-full
                  px-4
                  py-2
                  text-[10px]
                  font-black
                  tracking-[0.08em]

                  ${
                    active
                      ? "bg-[#F1E5A1] text-[#8B2626]"
                      : "text-[#F1E5A1]/75"
                  }
                `}
              >
                {
                  item.label
                }
              </motion.button>
            );
          }
        )}
      </nav>
    </header>
  );
}