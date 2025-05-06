
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DataImport from "./pages/DataImport";
import DatasetList from "./pages/DatasetList";
import Visualizations from "./pages/Visualizations";
import Analysis from "./pages/Analysis";
import NotFound from "./pages/NotFound";

// Layout
import AppLayout from "./components/AppLayout";

// Add dependencies
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/import" element={<DataImport />} />
            <Route path="/datasets" element={<DatasetList />} />
            <Route path="/visualizations" element={<Visualizations />} />
            <Route path="/visualizations/:datasetId" element={<Visualizations />} />
            <Route path="/analysis" element={<Analysis />} />
            {/* Additional protected routes would be added here */}
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
