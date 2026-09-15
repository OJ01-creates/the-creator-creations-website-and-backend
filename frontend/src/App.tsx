import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useApplyTheme } from "@/lib/useApplyTheme";
import Index from "./pages/Index.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import AllProjectsPage from "./pages/AllProjectsPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

/** Applies live colors/fonts from the backend on every route. Renders nothing. */
const ThemeApplier = () => {
  useApplyTheme();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeApplier />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/work" element={<AllProjectsPage />} />
          <Route path="/category/:categorySlug" element={<CategoryPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
