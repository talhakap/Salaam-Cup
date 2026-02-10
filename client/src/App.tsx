import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Tournaments from "@/pages/Tournaments";
import TournamentDetail from "@/pages/TournamentDetail";
import TournamentSchedule from "@/pages/TournamentSchedule";
import TournamentStandings from "@/pages/TournamentStandings";
import TournamentRules from "@/pages/TournamentRules";
import TeamDetail from "@/pages/TeamDetail";
import Register from "@/pages/Register";
import CaptainDashboard from "@/pages/CaptainDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminTournaments from "@/pages/AdminTournaments";
import AdminTeams from "@/pages/AdminTeams";
import AdminPlayers from "@/pages/AdminPlayers";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/tournaments" component={Tournaments} />
      <Route path="/tournaments/:id" component={TournamentDetail} />
      <Route path="/tournaments/:id/schedule" component={TournamentSchedule} />
      <Route path="/tournaments/:id/standings" component={TournamentStandings} />
      <Route path="/tournaments/:id/rules" component={TournamentRules} />
      <Route path="/teams/:id" component={TeamDetail} />
      <Route path="/register" component={Register} />
      
      <Route path="/captain" component={CaptainDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/tournaments" component={AdminTournaments} />
      <Route path="/admin/teams" component={AdminTeams} />
      <Route path="/admin/players" component={AdminPlayers} />

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
