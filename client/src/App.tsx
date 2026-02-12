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
import CaptainLogin from "@/pages/CaptainLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminTournaments from "@/pages/AdminTournaments";
import AdminTeams from "@/pages/AdminTeams";
import AdminPlayers from "@/pages/AdminPlayers";
import AdminMatches from "@/pages/AdminMatches";
import AdminAwards from "@/pages/AdminAwards";
import AdminNews from "@/pages/AdminNews";
import AdminSponsors from "@/pages/AdminSponsors";
import AdminAboutContent from "@/pages/AdminAboutContent";
import AdminMedia from "@/pages/AdminMedia";
import AdminFaqs from "@/pages/AdminFaqs";
import AdminSpecialAwards from "@/pages/AdminSpecialAwards";
import AdminVenues from "@/pages/AdminVenues";
import AdminSports from "@/pages/AdminSports";
import AdminUsers from "@/pages/AdminUsers";
import AdminLogin from "@/pages/AdminLogin";
import Media from "@/pages/Media";
import Faq from "@/pages/Faq";
import TournamentAwards from "@/pages/TournamentAwards";

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
      <Route path="/tournaments/:id/awards" component={TournamentAwards} />
      <Route path="/teams/:id" component={TeamDetail} />
      <Route path="/register" component={Register} />
      
      <Route path="/captain-login" component={CaptainLogin} />
      <Route path="/captain" component={CaptainDashboard} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/tournaments" component={AdminTournaments} />
      <Route path="/admin/teams" component={AdminTeams} />
      <Route path="/admin/players" component={AdminPlayers} />
      <Route path="/admin/matches" component={AdminMatches} />
      <Route path="/admin/awards" component={AdminAwards} />
      <Route path="/admin/news" component={AdminNews} />
      <Route path="/admin/sponsors" component={AdminSponsors} />
      <Route path="/admin/about-content" component={AdminAboutContent} />
      <Route path="/admin/media" component={AdminMedia} />
      <Route path="/admin/faqs" component={AdminFaqs} />
      <Route path="/admin/special-awards" component={AdminSpecialAwards} />
      <Route path="/admin/venues" component={AdminVenues} />
      <Route path="/admin/sports" component={AdminSports} />
      <Route path="/admin/users" component={AdminUsers} />

      <Route path="/media" component={Media} /> 
      <Route path="/faq" component={Faq} />

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
