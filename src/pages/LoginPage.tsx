export default function LoginPage() {
  return (
    <div className="flex flex-col items-center gap-6 pt-16">
      <h2 className="text-2xl font-semibold text-gray-900">Sign in</h2>
      <p className="text-gray-600">
        Enter your email to receive a magic link.
      </p>
      <form className="flex w-full max-w-sm flex-col gap-3">
        <input
          type="email"
          placeholder="you@example.com"
          className="rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          disabled
        >
          Send magic link
        </button>
      </form>
      <p className="text-sm text-gray-400">Auth will be wired up in Phase 2</p>
    </div>
  );
}
