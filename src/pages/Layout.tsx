import { Outlet } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase/client";

export default function Layout({ session }: { session: Session | null }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Beer League Check-In
        </h1>
        {session && (
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        )}
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
