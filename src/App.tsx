import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./pages/Layout";
import LoginPage from "./pages/LoginPage";
import AuthCallback from "./pages/AuthCallback";
import DashboardPage from "./pages/DashboardPage";
import { useSession } from "./hooks/useSession";

function AppRoutes() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route element={<Layout session={session} />}>
        {session ? (
          <>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
