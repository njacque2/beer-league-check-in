import { useState } from "react";
import { supabase } from "../lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="flex flex-col items-center gap-6 px-2 pt-12 sm:pt-16">
      <h2 className="text-2xl font-semibold text-gray-900">Sign in</h2>
      <p className="text-center text-gray-600">
        Enter your email to receive a magic link.
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-3"
      >
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-[44px] rounded-md border border-gray-300 px-4 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={status === "sending" || status === "sent"}
        />
        <button
          type="submit"
          className="min-h-[44px] rounded-md bg-blue-600 px-4 py-2 text-base font-medium text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50"
          disabled={status === "sending" || status === "sent"}
        >
          {status === "sending" ? "Sending..." : "Send magic link"}
        </button>
      </form>
      {status === "sent" && (
        <div className="rounded-md bg-green-50 px-4 py-3">
          <p className="text-sm text-green-700">
            Check your email for the magic link.
          </p>
        </div>
      )}
      {status === "error" && (
        <div className="rounded-md bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            Something went wrong. Try again.
          </p>
        </div>
      )}
    </div>
  );
}
