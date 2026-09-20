"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import {
  LoadingBreadcrumb,
} from "@/components/ui/animated-loading-svg-text-shimmer";

const BURGER_VIDEO =
  "https://emqpyzmpckvomsjxnfff.supabase.co/storage/v1/object/public/burger/burger-animation.mp4";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] =
    React.useState<
      "login" | "signup"
    >("login");

  const [name, setName] =
    React.useState("");

  const [email, setEmail] =
    React.useState("");

  const [password, setPassword] =
    React.useState("");

  const [
    showPassword,
    setShowPassword,
  ] = React.useState(false);

  const [loading, setLoading] =
    React.useState(false);

  const [error, setError] =
    React.useState<
      string | null
    >(null);

  const [message, setMessage] =
    React.useState<
      string | null
    >(null);

  /* =========================================
     CHECK EXISTING LOGIN
  ========================================= */

  React.useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (user) {
        router.push("/");
      }
    }

    checkUser();
  }, [router]);

  /* =========================================
     LOGIN / SIGNUP
  ========================================= */

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      /* LOGIN */

      if (mode === "login") {
        const {
          error: loginError,
        } =
          await supabase.auth.signInWithPassword(
            {
              email,
              password,
            }
          );

        if (loginError) {
          throw loginError;
        }

        router.push("/");
        router.refresh();

        return;
      }

      /* SIGNUP */

      const {
        data,
        error: signupError,
      } =
        await supabase.auth.signUp(
          {
            email,
            password,

            options: {
              data: {
                full_name:
                  name,
              },
            },
          }
        );

      if (signupError) {
        throw signupError;
      }

      if (data.session) {
        router.push("/");
        router.refresh();
      } else {
        setMessage(
          "Account created. Check your email to confirm your account."
        );
      }
    } catch (err) {
      if (
        err instanceof Error
      ) {
        setError(
          err.message
        );
      } else {
        setError(
          "Something went wrong."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#F1E5A1]
      "
    >
      <Navbar />

      {/* =================================================
          AUTH AREA

          Reduced padding so the user doesn't have to
          scroll through a huge empty area.
      ================================================= */}

      <section
        className="
          flex
          items-center
          justify-center
          px-5
          py-7
          sm:px-8
          lg:py-9
        "
      >
        <div
          className="
            grid
            w-full
            max-w-[1000px]
            overflow-hidden
            rounded-[30px]
            bg-[#F1E5A1]
            shadow-[0_24px_70px_rgba(82,32,22,0.18)]
            lg:min-h-[560px]
            lg:grid-cols-[0.95fr_1.05fr]
          "
        >
          {/* =================================================
              LEFT SIDE — BURGER VIDEO
          ================================================= */}

          <div
            className="
              relative
              hidden
              min-h-[560px]
              overflow-hidden
              bg-[#8B2626]
              lg:block
            "
          >
            {/* VIDEO */}

            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
              "
            >
              <source
                src={
                  BURGER_VIDEO
                }
                type="video/mp4"
              />
            </video>

            {/* DARK/MAROON OVERLAY

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-b
                from-[#8B2626]/55
                via-[#8B2626]/5
                to-[#8B2626]/60
              "
            /> */}

            {/* =============================================
                TOP TEXT
            ============================================= */}

            <div
              className="
                absolute
                left-9
                right-9
                top-9
                z-10
              "
            >
             

              {/* SMASHED LOGO */}
  <div
    className="
      absolute
      left-5
      top-0
      z-10
    "
  >
    <div
      className="
        relative
        h-[80px]
        w-[230px]
        overflow-hidden
      "
    >
      <Image
        src="/images/smashed-logo.png"
        alt="Smashed"
        fill
        priority
        className="
          object-contain
          object-left
        "
      />
    </div>
  </div>
            

             
            </div>

            {/* SMALL BOTTOM BADGE */}

            <div
              className="
                absolute
                bottom-7
                left-9
                z-10
              "
            >
              
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div
            className="
              flex
              items-center
              bg-[#F1E5A1]
              px-7
              py-8
              sm:px-10
              lg:px-12
              lg:py-9
            "
          >
            <div
              className="
                mx-auto
                w-full
                max-w-[500px]
              "
            >
              {/* =========================================
                  LOGIN / SIGNUP SWITCH
              ========================================= */}

              <div
                className="
                  flex
                  rounded-full
                  bg-[#8B2626]/10
                  p-1
                "
              >
                <button
                  type="button"
                  onClick={() => {
                    setMode(
                      "login"
                    );

                    setError(
                      null
                    );

                    setMessage(
                      null
                    );
                  }}
                  className={`
                    flex-1
                    rounded-full
                    px-4
                    py-3
                    text-xs
                    font-black
                    tracking-[0.08em]
                    transition-all
                    duration-200

                    ${
                      mode ===
                      "login"
                        ? "bg-[#8B2626] text-[#F1E5A1] shadow-md"
                        : "text-[#8B2626]/55 hover:text-[#8B2626]"
                    }
                  `}
                >
                  LOGIN
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode(
                      "signup"
                    );

                    setError(
                      null
                    );

                    setMessage(
                      null
                    );
                  }}
                  className={`
                    flex-1
                    rounded-full
                    px-4
                    py-3
                    text-xs
                    font-black
                    tracking-[0.08em]
                    transition-all
                    duration-200

                    ${
                      mode ===
                      "signup"
                        ? "bg-[#8B2626] text-[#F1E5A1] shadow-md"
                        : "text-[#8B2626]/55 hover:text-[#8B2626]"
                    }
                  `}
                >
                  CREATE ACCOUNT
                </button>
              </div>

              {/* =========================================
                  TITLE
              ========================================= */}

              <div className="mt-7">
                <h1
                  className="
                    text-4xl
                    font-black
                    tracking-[-0.045em]
                    text-[#8B2626]
                    sm:text-[2.7rem]
                  "
                >
                  {mode ===
                  "login"
                    ? "WELCOME BACK"
                    : "JOIN SMASHED"}
                </h1>

                <p
                  className="
                    mt-1.5
                    text-sm
                    text-[#8B2626]/55
                  "
                >
                  {mode ===
                  "login"
                    ? "Enter your account details."
                    : "Create your account and start smashing."}
                </p>
              </div>

              {/* =========================================
                  FORM
              ========================================= */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="
                  mt-7
                  space-y-4
                "
              >
                {/* NAME */}

                {mode ===
                  "signup" && (
                  <div>
                    <label
                      className="
                        mb-1.5
                        block
                        text-xs
                        font-black
                        text-[#8B2626]
                      "
                    >
                      NAME
                    </label>

                    <input
                      type="text"
                      value={
                        name
                      }
                      onChange={(
                        event
                      ) =>
                        setName(
                          event
                            .target
                            .value
                        )
                      }
                      required
                      placeholder="Your name"
                      className="
                        h-[54px]
                        w-full
                        rounded-xl
                        border-2
                        border-[#8B2626]/12
                        bg-white/55
                        px-4
                        text-sm
                        text-[#8B2626]
                        outline-none
                        transition
                        placeholder:text-[#8B2626]/30
                        focus:border-[#EF6905]
                        focus:bg-white/75
                      "
                    />
                  </div>
                )}

                {/* EMAIL */}

                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-black
                      text-[#8B2626]
                    "
                  >
                    EMAIL
                  </label>

                  <input
                    type="email"
                    value={
                      email
                    }
                    onChange={(
                      event
                    ) =>
                      setEmail(
                        event
                          .target
                          .value
                      )
                    }
                    required
                    placeholder="you@email.com"
                    className="
                      h-[54px]
                      w-full
                      rounded-xl
                      border-2
                      border-[#8B2626]/12
                      bg-white/55
                      px-4
                      text-sm
                      text-[#8B2626]
                      outline-none
                      transition
                      placeholder:text-[#8B2626]/30
                      focus:border-[#EF6905]
                      focus:bg-white/75
                    "
                  />
                </div>

                {/* PASSWORD */}

                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-black
                      text-[#8B2626]
                    "
                  >
                    PASSWORD
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        password
                      }
                      onChange={(
                        event
                      ) =>
                        setPassword(
                          event
                            .target
                            .value
                        )
                      }
                      required
                      minLength={
                        6
                      }
                      placeholder="••••••••"
                      className="
                        h-[54px]
                        w-full
                        rounded-xl
                        border-2
                        border-[#8B2626]/12
                        bg-white/55
                        px-4
                        pr-12
                        text-sm
                        text-[#8B2626]
                        outline-none
                        transition
                        placeholder:text-[#8B2626]/30
                        focus:border-[#EF6905]
                        focus:bg-white/75
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-[#8B2626]/45
                        transition
                        hover:text-[#8B2626]
                      "
                    >
                      {showPassword ? (
                        <EyeOff
                          size={
                            18
                          }
                        />
                      ) : (
                        <Eye
                          size={
                            18
                          }
                        />
                      )}
                    </button>
                  </div>
                </div>

                {/* ERROR */}

                {error && (
                  <div
                    className="
                      rounded-xl
                      bg-[#8B2626]/10
                      px-4
                      py-2.5
                      text-xs
                      font-semibold
                      text-[#8B2626]
                    "
                  >
                    {error}
                  </div>
                )}

                {/* MESSAGE */}

                {message && (
                  <div
                    className="
                      rounded-xl
                      bg-[#486C2F]/15
                      px-4
                      py-2.5
                      text-xs
                      font-semibold
                      text-[#486C2F]
                    "
                  >
                    {
                      message
                    }
                  </div>
                )}

                {/* =========================================
                    SUBMIT
                ========================================= */}

                <button
                  type="submit"
                  disabled={
                    loading
                  }
                  className="
                    mt-2
                    flex
                    h-[56px]
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-xl
                    bg-[#EF6905]
                    px-6
                    text-sm
                    font-black
                    tracking-[0.1em]
                    text-[#F1E5A1]
                    shadow-[0_8px_20px_rgba(239,105,5,0.18)]
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:shadow-[0_12px_25px_rgba(239,105,5,0.28)]
                    active:translate-y-0
                    disabled:cursor-not-allowed
                    disabled:opacity-70
                  "
                >
                  {loading ? (
                    <LoadingBreadcrumb
                      text={
                        mode ===
                        "login"
                          ? "Signing In"
                          : "Creating Account"
                      }
                      variant="dark"
                      className="text-xs"
                    />
                  ) : (
                    <>
                      {mode ===
                      "login"
                        ? "LOGIN"
                        : "CREATE ACCOUNT"}

                      <ArrowRight
                        size={
                          18
                        }
                      />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}