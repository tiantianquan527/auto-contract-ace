import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AuthPage from "./pages/Auth.tsx";
import AppLayout from "./components/app/AppLayout.tsx";
import Dashboard from "./pages/app/Dashboard.tsx";
import Departments from "./pages/app/Departments.tsx";
import Rules from "./pages/app/Rules.tsx";
import Users from "./pages/app/Users.tsx";
import ReviewWorkspace from "./pages/app/ReviewWorkspace.tsx";
import Contracts from "./pages/app/Contracts.tsx";
import ContractNew from "./pages/app/ContractNew.tsx";
import ContractDetail from "./pages/app/ContractDetail.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="departments" element={<Departments />} />
                <Route path="rules" element={<Rules />} />
                <Route path="users" element={<Users />} />
                <Route path="review" element={<ReviewWorkspace />} />
                <Route path="contracts" element={<Contracts />} />
                <Route path="contracts/new" element={<ContractNew />} />
                <Route path="contracts/:id" element={<ContractDetail />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
