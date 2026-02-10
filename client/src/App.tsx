import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Tournaments from "@/pages/Tournaments";
import Register from "@/pages/Register";
import CaptainDashboard from "@/pages/CaptainDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminTournaments from "@/pages/AdminTournaments";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/tournaments" component={Tournaments} />
      <Route path="/register" component={Register} />
      
      {/* Protected Routes - In real app, wrap these in auth guard components */}
      <Route path="/captain" component={CaptainDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/tournaments" component={AdminTournaments} />
      <Route path="/admin/teams" component={AdminDashboard} /> {/* Reuse for now */}
      <Route path="/admin/players" component={AdminDashboard} /> {/* Reuse for now */}

      {/* Static Placeholders */}
      <Route path="/media" component={Home} /> 
      <Route path="/faq" component={About} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
