import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import DomainPage from "./pages/DomainPage.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import InterviewPage from "./pages/InterviewPage.tsx";
import LibraryPage from "./pages/LibraryPage.tsx";
import InterviewPrepPage from "./pages/InterviewPrepPage.tsx";
import ComparePage from "./pages/ComparePage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/domain/:slug" element={<DomainPage />} />
          <Route path="/domain/:slug/product/:productName" element={<ProductPage />} />
          <Route path="/domain/:slug/interview" element={<InterviewPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/interview-prep" element={<InterviewPrepPage />} />
          <Route path="/compare" element={<ComparePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
