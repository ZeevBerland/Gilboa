"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useLanguage } from "@/lib/language";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const { isHebrew } = useLanguage();
  const router = useRouter();

  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn("password", {
        email,
        password,
        flow,
        ...(flow === "signUp" ? { name } : {}),
      });
      router.push("/");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : isHebrew
            ? "שגיאה בהתחברות"
            : "Authentication error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.jpeg"
            alt="מדד גלבוע"
            width={64}
            height={64}
            className="rounded-full"
          />
        </div>

        <h1 className="text-2xl font-heading font-bold text-ink text-center mb-6">
          {flow === "signIn"
            ? isHebrew
              ? "התחברות"
              : "Sign In"
            : isHebrew
              ? "הרשמה"
              : "Sign Up"}
        </h1>

        {/* Email/Password form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {flow === "signUp" && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isHebrew ? "שם" : "Name"}
              className="w-full rounded-lg border border-warm-gray px-4 py-2.5 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson/40"
              dir="auto"
              required
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isHebrew ? "אימייל" : "Email"}
            className="w-full rounded-lg border border-warm-gray px-4 py-2.5 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson/40"
            dir="ltr"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isHebrew ? "סיסמה" : "Password"}
            className="w-full rounded-lg border border-warm-gray px-4 py-2.5 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson/40"
            dir="ltr"
            required
            minLength={6}
          />

          {error && <p className="text-sm text-crimson">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-crimson text-white font-medium text-sm hover:bg-crimson-dark disabled:opacity-50 transition-colors"
          >
            {loading
              ? "..."
              : flow === "signIn"
                ? isHebrew
                  ? "התחברות"
                  : "Sign In"
                : isHebrew
                  ? "הרשמה"
                  : "Sign Up"}
          </button>
        </form>

        {/* Toggle sign-in / sign-up */}
        <p className="text-center text-sm text-muted mt-4">
          {flow === "signIn" ? (
            <>
              {isHebrew ? "אין לך חשבון? " : "Don't have an account? "}
              <button
                onClick={() => setFlow("signUp")}
                className="text-crimson hover:underline"
              >
                {isHebrew ? "הרשמה" : "Sign Up"}
              </button>
            </>
          ) : (
            <>
              {isHebrew ? "יש לך כשבון? " : "Already have an account? "}
              <button
                onClick={() => setFlow("signIn")}
                className="text-crimson hover:underline"
              >
                {isHebrew ? "התחברות" : "Sign In"}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
