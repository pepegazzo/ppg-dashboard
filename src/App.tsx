
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import ProjectPortal from "./pages/ProjectPortal";
import Clients from "./pages/Clients";
import Billing from "./pages/Billing";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { Toaster as SonnerToaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <Toaster />
        <SonnerToaster position="bottom-center" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            {/* Leave the old portal route for backwards compatibility */}
            <Route path="/projects/:projectSlug/portal" element={<ProjectPortal />} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            {/* Public Client Portal Route at root - IMPORTANT: This must be after all other defined routes */}
            <Route path="/:projectSlug" element={<ProjectPortal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
