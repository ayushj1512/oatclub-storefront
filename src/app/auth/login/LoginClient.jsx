"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  MessageCircle,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import toast from "react-hot-toast";

import GoogleSignIn from "@/components/auth/GoogleSignIn";
import { useAuthStore } from "@/store/authStore";
import { useOtpStore } from "@/store/otpStore";

const AUTH_IMAGE =
  "https://res.cloudinary.com/dpsvrt4sd/image/upload/v1780338447/qavpt44lsxsy3wrvuwi8.png";

const OTP_LENGTH = 6;
const DEFAULT_RESEND_SECONDS = 60;

/* =====================================================
   IDENTIFIER HELPERS
===================================================== */

const normalizeEmail = (value = "") =>
  String(value).trim().toLowerCase();

const normalizePhone = (value = "") => {
  let phone = String(value).replace(/\D/g, "");

  if (
    phone.startsWith("91") &&
    phone.length === 12
  ) {
    phone = phone.slice(2);
  }

  if (
    phone.startsWith("0") &&
    phone.length === 11
  ) {
    phone = phone.slice(1);
  }

  return phone;
};

const isValidEmail = (value = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    normalizeEmail(value),
  );

const isValidIndianPhone = (value = "") =>
  /^[6-9]\d{9}$/.test(
    normalizePhone(value),
  );

const detectChannel = (value = "") => {
  const input = String(value).trim();

  if (input.includes("@")) {
    return "email";
  }

  if (/\d/.test(input)) {
    return "whatsapp";
  }

  return "email";
};

const getResendSeconds = (response = {}) =>
  Number(
    response?.data?.resendAfter ||
    response?.data?.resendAfterSeconds ||
    response?.resendAfter ||
    response?.resendAfterSeconds ||
    DEFAULT_RESEND_SECONDS,
  );

/* =====================================================
   PAGE
===================================================== */

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const otpInputRef = useRef(null);
  const identifierInputRef = useRef(null);

  const {
    user,
    isAuthenticated,
  } = useAuthStore();

  const {
    otpSession,
    customerExists,
    purpose,
    sending,
    verifying,
    error,

    startEmailOtp,
    startWhatsappOtp,
    resendOtp,
    verifyOtp,
    resetOtp,
    clearError,
  } = useOtpStore();

  const [step, setStep] =
    useState("identifier");

  const [identifier, setIdentifier] =
    useState("");

  const [activeChannel, setActiveChannel] =
    useState("email");

  const [otp, setOtp] = useState("");

  const [resendIn, setResendIn] =
    useState(0);

  const [justLoggedIn, setJustLoggedIn] =
    useState(false);

  const detectedChannel = useMemo(
    () => detectChannel(identifier),
    [identifier],
  );

  const normalizedIdentifier =
    detectedChannel === "whatsapp"
      ? normalizePhone(identifier)
      : normalizeEmail(identifier);

  /* =====================================================
     URL IDENTIFIER
  ===================================================== */

  useEffect(() => {
    const emailFromUrl =
      searchParams.get("email");

    const phoneFromUrl =
      searchParams.get("phone");

    if (emailFromUrl) {
      setIdentifier(
        normalizeEmail(emailFromUrl),
      );

      setActiveChannel("email");
      return;
    }

    if (phoneFromUrl) {
      setIdentifier(
        normalizePhone(phoneFromUrl),
      );

      setActiveChannel("whatsapp");
    }
  }, [searchParams]);

  /* =====================================================
     OTP AUTO FOCUS
  ===================================================== */

  useEffect(() => {
    if (step !== "otp") return;

    const timer = window.setTimeout(() => {
      otpInputRef.current?.focus();
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [step]);

  /* =====================================================
     RESEND TIMER
  ===================================================== */

  useEffect(() => {
    if (resendIn <= 0) return;

    const timer = window.setInterval(() => {
      setResendIn((current) =>
        Math.max(0, current - 1),
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [resendIn]);

  /* =====================================================
     AUTH REDIRECT
  ===================================================== */

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (!justLoggedIn) {
      toast.success(
        `WELCOME BACK, ${user?.name || "OATCLUB MEMBER"
        }`,
      );
    }

    router.replace("/");
  }, [
    isAuthenticated,
    user,
    justLoggedIn,
    router,
  ]);

  /* =====================================================
     CLEANUP
  ===================================================== */

  useEffect(() => {
    return () => {
      resetOtp();
    };
  }, [resetOtp]);

  /* =====================================================
     SEND OTP
  ===================================================== */

  const handleIdentifierSubmit = async (
    event,
  ) => {
    event.preventDefault();

    const channel =
      detectChannel(identifier);

    if (channel === "email") {
      if (!isValidEmail(identifier)) {
        toast.error(
          "ENTER A VALID EMAIL ADDRESS",
        );

        return;
      }
    }

    if (channel === "whatsapp") {
      if (!isValidIndianPhone(identifier)) {
        toast.error(
          "ENTER A VALID 10-DIGIT MOBILE NUMBER",
        );

        return;
      }
    }

    try {
      clearError();

      let response;

      if (channel === "whatsapp") {
        response = await startWhatsappOtp({
          phone: normalizePhone(identifier),

          metadata: {
            source: "storefront_login",
            path: "/auth/login",
          },
        });
      } else {
        response = await startEmailOtp({
          email: normalizeEmail(identifier),

          metadata: {
            source: "storefront_login",
            path: "/auth/login",
          },
        });
      }

      setActiveChannel(channel);
      setStep("otp");
      setOtp("");

      setResendIn(
        getResendSeconds(response),
      );

      toast.success(
        channel === "whatsapp"
          ? "OTP SENT ON WHATSAPP"
          : "OTP SENT ON EMAIL",
      );
    } catch (err) {
      toast.error(
        err?.message ||
        "UNABLE TO SEND OTP. PLEASE TRY AGAIN.",
      );
    }
  };

  /* =====================================================
     VERIFY OTP
  ===================================================== */

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    const cleanOtp = String(otp)
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (cleanOtp.length !== OTP_LENGTH) {
      toast.error(
        "ENTER THE 6-DIGIT CODE",
      );

      return;
    }

    try {
      clearError();

      await verifyOtp(cleanOtp);

      setJustLoggedIn(true);

      toast.success(
        purpose === "signup"
          ? "WELCOME TO OATCLUB"
          : "WELCOME BACK TO OATCLUB",
      );

      router.replace("/");
    } catch (err) {
      toast.error(
        err?.message ||
        "INVALID OTP. PLEASE TRY AGAIN.",
      );
    }
  };

  /* =====================================================
     RESEND OTP
  ===================================================== */

  const handleResendOtp = async () => {
    if (
      resendIn > 0 ||
      sending ||
      verifying
    ) {
      return;
    }

    try {
      clearError();

      const response = await resendOtp({
        source: "storefront_login",
        path: "/auth/login",
      });

      setOtp("");

      setResendIn(
        getResendSeconds(response),
      );

      toast.success(
        activeChannel === "whatsapp"
          ? "NEW OTP SENT ON WHATSAPP"
          : "NEW OTP SENT ON EMAIL",
      );

      window.setTimeout(() => {
        otpInputRef.current?.focus();
      }, 50);
    } catch (err) {
      toast.error(
        err?.message ||
        "UNABLE TO RESEND OTP",
      );
    }
  };

  /* =====================================================
     CHANGE IDENTIFIER
  ===================================================== */

  const handleChangeIdentifier = () => {
    resetOtp();

    setStep("identifier");
    setOtp("");
    setResendIn(0);

    window.setTimeout(() => {
      identifierInputRef.current?.focus();
    }, 50);
  };

  const handleIdentifierChange = (value) => {
    setIdentifier(value);
    clearError();
  };

  const handleOtpChange = (value) => {
    const cleanValue = String(value)
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    setOtp(cleanValue);
    clearError();
  };

  const sessionIdentifier =
    otpSession?.identifier ||
    normalizedIdentifier;

  const sessionChannel =
    otpSession?.channel ||
    activeChannel;

  return (
    <main className="min-h-screen bg-white px-3 py-5 text-black md:bg-[#fafafa] md:py-8">
      <section className="mx-auto w-full max-w-[410px] border border-black/10 bg-white px-4 py-5 shadow-[0_18px_55px_rgba(0,0,0,0.04)] md:px-6 md:py-6">
        <AuthHeader
          step={step}
          channel={sessionChannel}
        />

        {step === "identifier" ? (
          <IdentifierStep
            identifier={identifier}
            channel={detectedChannel}
            loading={sending}
            error={error}
            inputRef={identifierInputRef}
            onIdentifierChange={
              handleIdentifierChange
            }
            onSubmit={
              handleIdentifierSubmit
            }
          />
        ) : (
          <OtpStep
            identifier={sessionIdentifier}
            channel={sessionChannel}
            otp={otp}
            purpose={purpose}
            customerExists={
              customerExists
            }
            otpInputRef={otpInputRef}
            sending={sending}
            verifying={verifying}
            resendIn={resendIn}
            error={error}
            onOtpChange={handleOtpChange}
            onSubmit={handleVerifyOtp}
            onResend={handleResendOtp}
            onChangeIdentifier={
              handleChangeIdentifier
            }
          />
        )}

        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-neutral-200" />

          <span className="text-[9px] font-black uppercase tracking-[0.24em] text-black/35">
            OR
          </span>

          <span className="h-px flex-1 bg-neutral-200" />
        </div>

        <GoogleSignIn />

        <div className="mt-4 flex items-center justify-center gap-2 border-y border-black/10 py-2 text-[8.5px] font-black uppercase tracking-[0.14em] text-black/45">
          <ShieldCheck className="h-3.5 w-3.5" />
          SECURE MEMBER ACCESS
        </div>

        <p className="mt-4 text-center text-[9px] font-bold uppercase leading-4 tracking-[0.08em] text-black/40">
          BY CONTINUING, YOU AGREE TO OUR{" "}
          <Link
            href="/terms"
            className="font-black text-black underline underline-offset-4"
          >
            TERMS
          </Link>{" "}
          AND{" "}
          <Link
            href="/privacy-policy"
            className="font-black text-black underline underline-offset-4"
          >
            PRIVACY POLICY
          </Link>
          .
        </p>
      </section>
    </main>
  );
}

/* =====================================================
   HEADER
===================================================== */

function AuthHeader({
  step,
  channel,
}) {
  const isWhatsapp =
    channel === "whatsapp";

  return (
    <div className="mb-5 text-center">
      <Link
        href="/"
        aria-label="GO TO OATCLUB HOME"
        className="mx-auto mb-4 block w-fit"
      >
        <div className="relative h-10 w-32 md:h-12 md:w-36">
          <Image
            src={AUTH_IMAGE}
            alt="OATCLUB"
            fill
            priority
            sizes="160px"
            className="object-contain"
          />
        </div>
      </Link>

      <div className="mx-auto mb-4 flex w-24 items-center gap-2">
        <span className="h-px flex-1 bg-black/15" />
        <span className="h-1 w-1 rounded-full bg-black/35" />
        <span className="h-px flex-1 bg-black/15" />
      </div>

      <p className="text-[8.5px] font-black uppercase tracking-[0.32em] text-black/45">
        MEMBER ACCESS
      </p>

      <h1 className="mt-1.5 text-[22px] font-black uppercase leading-tight md:text-2xl">
        {step === "identifier"
          ? "SIGN IN OR SIGN UP"
          : isWhatsapp
            ? "VERIFY WHATSAPP OTP"
            : "VERIFY EMAIL OTP"}
      </h1>

      <p className="mx-auto mt-2 max-w-[310px] text-[9.5px] font-bold uppercase leading-5 tracking-[0.08em] text-black/50">
        {step === "identifier"
          ? "ENTER YOUR EMAIL OR MOBILE NUMBER TO CONTINUE."
          : isWhatsapp
            ? "ENTER THE SECURE CODE SENT TO YOUR WHATSAPP."
            : "ENTER THE SECURE CODE SENT TO YOUR EMAIL ADDRESS."}
      </p>
    </div>
  );
}

/* =====================================================
   IDENTIFIER STEP
===================================================== */

function IdentifierStep({
  identifier,
  channel,
  loading,
  error,
  inputRef,
  onIdentifierChange,
  onSubmit,
}) {
  const isWhatsapp =
    channel === "whatsapp";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3"
    >
      <Field
        inputRef={inputRef}
        icon={
          isWhatsapp ? (
            <Smartphone className="h-4 w-4" />
          ) : (
            <Mail className="h-4 w-4" />
          )
        }
        type="text"
        inputMode={
          isWhatsapp
            ? "tel"
            : "email"
        }
        placeholder="ENTER EMAIL OR PHONE NUMBER"
        value={identifier}
        autoComplete={
          isWhatsapp
            ? "tel"
            : "email"
        }
        onChange={
          onIdentifierChange
        }
      />

      {identifier ? (
        <div className="flex items-center gap-2 bg-neutral-50 px-3 py-2">
          {isWhatsapp ? (
            <MessageCircle className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Mail className="h-3.5 w-3.5 text-black/50" />
          )}

          <p className="text-[8.5px] font-black uppercase tracking-[0.12em] text-black/50">
            {isWhatsapp
              ? "OTP WILL BE SENT ON WHATSAPP"
              : "OTP WILL BE SENT ON EMAIL"}
          </p>
        </div>
      ) : null}

      {error ? (
        <ErrorMessage message={error} />
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="flex h-11 w-full items-center justify-center gap-2 bg-black text-[10px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isWhatsapp ? (
          <MessageCircle className="h-4 w-4" />
        ) : (
          <Mail className="h-4 w-4" />
        )}

        {loading
          ? "SENDING OTP"
          : isWhatsapp
            ? "SEND OTP"
            : "SEND OTP"}
      </button>
    </form>
  );
}

/* =====================================================
   OTP STEP
===================================================== */

function OtpStep({
  identifier,
  channel,
  otp,
  purpose,
  customerExists,
  otpInputRef,
  sending,
  verifying,
  resendIn,
  error,
  onOtpChange,
  onSubmit,
  onResend,
  onChangeIdentifier,
}) {
  const isSignup =
    purpose === "signup" ||
    customerExists === false;

  const isWhatsapp =
    channel === "whatsapp";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3"
    >
      <div className="border border-black/10 bg-neutral-50 px-3 py-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          {isWhatsapp ? (
            <MessageCircle className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Mail className="h-3.5 w-3.5 text-black/45" />
          )}

          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-black/40">
            CODE SENT TO
          </p>
        </div>

        <p className="mt-1 break-all text-[10px] font-black tracking-[0.08em] text-black">
          {isWhatsapp
            ? `+91 ${identifier}`
            : identifier}
        </p>

        <button
          type="button"
          onClick={onChangeIdentifier}
          disabled={sending || verifying}
          className="mt-2 inline-flex items-center gap-1 text-[8.5px] font-black uppercase tracking-[0.14em] text-black/50 underline underline-offset-4 disabled:cursor-not-allowed disabled:text-black/25"
        >
          <ArrowLeft className="h-3 w-3" />
          CHANGE EMAIL OR PHONE
        </button>
      </div>

      <label className="block">
        <span className="sr-only">
          One-time verification code
        </span>

        <input
          ref={otpInputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={OTP_LENGTH}
          required
          placeholder="000000"
          value={otp}
          disabled={verifying}
          onChange={(event) =>
            onOtpChange(
              event.target.value,
            )
          }
          className="h-14 w-full border border-black/10 bg-white text-center text-xl font-black tracking-[0.45em] text-black outline-none transition placeholder:text-black/15 focus:border-black disabled:cursor-not-allowed disabled:bg-neutral-50"
        />
      </label>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[8px] font-black uppercase tracking-[0.12em] text-black/40">
          {isSignup
            ? "NEW ACCOUNT VERIFICATION"
            : "LOGIN VERIFICATION"}
        </p>

        <button
          type="button"
          onClick={onResend}
          disabled={
            resendIn > 0 ||
            sending ||
            verifying
          }
          className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase tracking-[0.12em] text-black/55 disabled:cursor-not-allowed disabled:text-black/25"
        >
          {sending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCcw className="h-3 w-3" />
          )}

          {resendIn > 0
            ? `RESEND IN ${resendIn}S`
            : "RESEND CODE"}
        </button>
      </div>

      {error ? (
        <ErrorMessage message={error} />
      ) : null}

      <button
        type="submit"
        disabled={
          verifying ||
          otp.length !== OTP_LENGTH
        }
        className="flex h-11 w-full items-center justify-center gap-2 bg-black text-[10px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {verifying ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}

        {verifying
          ? "VERIFYING"
          : "VERIFY AND CONTINUE"}
      </button>
    </form>
  );
}

/* =====================================================
   ERROR MESSAGE
===================================================== */

function ErrorMessage({ message }) {
  return (
    <p className="text-[9px] font-bold uppercase leading-4 text-red-600">
      {message}
    </p>
  );
}

/* =====================================================
   FIELD
===================================================== */

function Field({
  inputRef,
  icon,
  type,
  inputMode,
  placeholder,
  value,
  autoComplete,
  onChange,
}) {
  return (
    <label className="flex h-11 items-center gap-3 border border-black/10 bg-white px-3.5 transition focus-within:border-black">
      <span className="text-black/45">
        {icon}
      </span>

      <input
        ref={inputRef}
        type={type}
        inputMode={inputMode}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full bg-transparent text-[11px] font-bold tracking-[0.08em] text-black outline-none placeholder:text-[10px] placeholder:font-black placeholder:uppercase placeholder:tracking-[0.12em] placeholder:text-black/35"
      />
    </label>
  );
}
