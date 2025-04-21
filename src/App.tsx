
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
// Removed import of Register
import Projects from "./pages/Projects";
import ProjectPortal from "./pages/ProjectPortal";
import Clients from "./pages/Clients";
import Tasks from "./pages/Tasks";
import Notes from "./pages/Notes";
import Files from "./pages/Files";
import Billing from "./pages/Billing";
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
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            {/* Removed Register route */}
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            {/* Leave the old portal route for backwards compatibility */}
            <Route path="/projects/:projectSlug/portal" element={<ProjectPortal />} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
            <Route path="/files" element={<ProtectedRoute><Files /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            {/* NEW: Public Client Portal Route at root */}
            <Route path=":projectSlug" element={<ProjectPortal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
