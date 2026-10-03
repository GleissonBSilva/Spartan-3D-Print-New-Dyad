import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SaaSDataProvider } from "@/context/SaaSDataContext";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index").then(module => ({ default: module.Index })));
const Login = lazy(() => import("./pages/Login").then(module => ({ default: module.Login })));
const Register = lazy(() => import("./pages/Register").then(module => ({ default: module.Register })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then(module => ({ default: module.AdminDashboard })));
const ClientPortal = lazy(() => import("./pages/ClientPortal").then(module => ({ default: module.ClientPortal })));
const NotFound = lazy(() => import("./pages/NotFound").then(module => ({ default: module.NotFound })));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
      <p className="text-slate-400">Carregando...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SaaSDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" richColors />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Landing Page */}
                <Route path="/" element={<Index />} />

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Admin Views */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/clientes" element={<AdminDashboard />} />
                <Route path="/admin/cobranca" element={<AdminDashboard />} />
                <Route path="/admin/planos" element={<AdminDashboard />} />
                <Route path="/admin/ia-copilot" element={<AdminDashboard />} />
                <Route path="/admin/webhooks" element={<AdminDashboard />} />

                {/* Client 3D Printing Views */}
                <Route path="/cliente" element={<ClientPortal />} />
                <Route path="/cliente/calculadora" element={<ClientPortal />} />
                <Route path="/cliente/estoque" element={<ClientPortal />} />
                <Route path="/cliente/impressoras" element={<ClientPortal />} />
                <Route path="/cliente/projetos" element={<ClientPortal />} />
                <Route path="/cliente/ia-copilot" element={<ClientPortal />} />
                <Route path="/cliente/planos" element={<ClientPortal />} />
                <Route path="/cliente/faturas" element={<ClientPortal />} />
                <Route path="/cliente/configuracoes" element={<ClientPortal />} />

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </SaaSDataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;