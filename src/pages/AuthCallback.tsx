import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data?.session) {
          navigate("/dashboard", { replace: true });
        } else {
          setError("No session found. Please try signing in again.");
          setTimeout(() => navigate("/", { replace: true }), 2000);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Authentication failed",
        );
        setTimeout(() => navigate("/", { replace: true }), 2000);
      }
    }

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 pt-24">
      {error ? (
        <>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-gray-500">Redirecting...</p>
        </>
      ) : (
        <p className="text-gray-600">Verifying...</p>
      )}
    </div>
  );
}
