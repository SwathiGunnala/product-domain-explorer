import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const Index = lazy(() => import("./pages/Index.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const DomainPage = lazy(() => import("./pages/DomainPage.tsx"));
const ProductPage = lazy(() => import("./pages/ProductPage.tsx"));
const InterviewPage = lazy(() => import("./pages/InterviewPage.tsx"));
const LibraryPage = lazy(() => import("./pages/LibraryPage.tsx"));
const InterviewPrepPage = lazy(() => import("./pages/InterviewPrepPage.tsx"));
const ComparePage = lazy(() => import("./pages/ComparePage.tsx"));

const RouteFallback = () => <div className="min-h-screen bg-background" />;

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
