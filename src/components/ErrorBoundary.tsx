import * as Sentry from "@sentry/react";
import type { ReactNode } from "react";

function Fallback() {
  return (
    <div className="flex flex-col items-center gap-4 pt-24 text-center">
      <h2 className="text-xl font-semibold text-gray-900">
        Something went wrong
      </h2>
      <p className="text-gray-600">
        Try refreshing the page. If the problem persists, contact an admin.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Refresh
      </button>
    </div>
  );
}

export default function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <Sentry.ErrorBoundary fallback={<Fallback />}>
      {children}
    </Sentry.ErrorBoundary>
  );
}
