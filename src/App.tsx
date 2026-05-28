import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { KeyboardProvider } from "@/contexts/KeyboardContext";
import ShortcutOverlay from "@/components/ShortcutOverlay";
import MorningBrief from "./pages/MorningBrief";
import Book from "./pages/Book";
import Companies from "./pages/Companies";
import EarningsCalendarPage from "./pages/EarningsCalendarPage";
import AlertsPage from "./pages/AlertsPage";
import ReportsPage from "./pages/ReportsPage";
import CompanyAnalysis from "./pages/CompanyAnalysis";
import ComparisonPage from "./pages/ComparisonPage";
import Profile from "./pages/Profile";
import Overview from "./pages/company-tabs/Overview";
import DetailedScores from "./pages/company-tabs/DetailedScores";
import ManagementTone from "./pages/company-tabs/ManagementTone";
import ProductIntelligence from "./pages/company-tabs/ProductIntelligence";
import RisksCatalysts from "./pages/company-tabs/RisksCatalysts";
import TranscriptViewer from "./pages/company-tabs/TranscriptViewer";
import Playground from "./pages/company-tabs/Playground";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <KeyboardProvider>
        <ShortcutOverlay />
        <Routes>
          <Route path="/" element={<Navigate to="/brief" replace />} />
          <Route path="/brief" element={<MorningBrief />} />
          <Route path="/book" element={<Book />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/calendar" element={<EarningsCalendarPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/compare" element={<ComparisonPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/company/:ticker" element={<CompanyAnalysis />}>
            <Route index element={<Overview />} />
            <Route path="scores" element={<DetailedScores />} />
            <Route path="tone" element={<ManagementTone />} />
            <Route path="products" element={<ProductIntelligence />} />
            <Route path="risks" element={<RisksCatalysts />} />
            <Route path="transcripts" element={<TranscriptViewer />} />
            <Route path="playground" element={<Playground />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        </KeyboardProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
