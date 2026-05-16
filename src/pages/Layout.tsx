import { Outlet } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase/client";

export default function Layout({ session }: { session: Session | null }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3 sm:px-6 sm:py-4">
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
          Beer League Check-In
        </h1>
        {session && (
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="min-h-[36px] rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200 sm:min-h-0"
          >
            Sign out
          </button>
        )}
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
