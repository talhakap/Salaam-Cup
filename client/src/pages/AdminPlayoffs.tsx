import { AdminLayout } from "@/components/AdminLayout";
import { useTournaments, useDivisions } from "@/hooks/use-tournaments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, Trophy, RefreshCw, Trash2, Check, ChevronRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Tournament, Division, PlayoffSettings, PlayoffMatchWithTeams } from "@shared/schema";

function PlayoffMatchCard({ match, onUpdate }: {
  match: PlayoffMatchWithTeams;
  onUpdate: (id: number, data: any) => void;
}) {
  const [homeScore, setHomeScore] = useState<string>(match.homeScore?.toString() || "");
  const [awayScore, setAwayScore] = useState<string>(match.awayScore?.toString() || "");

  useEffect(() => {
    setHomeScore(match.homeScore?.toString() || "");
    setAwayScore(match.awayScore?.toString() || "");
  }, [match.homeScore, match.awayScore]);

  if (match.isBye) {
    return (
      <Card className="opacity-60" data-testid={`playoff-match-bye-${match.id}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-sm font-medium">
              {match.homeTeam?.name || match.awayTeam?.name || "TBD"}
            </div>
            <Badge variant="secondary">BYE</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isTied = homeScore !== "" && awayScore !== "" && parseInt(homeScore) === parseInt(awayScore);

  const handleSaveScore = (overrideWinnerId?: number | null) => {
    const hs = homeScore === "" ? null : parseInt(homeScore);
    const as_ = awayScore === "" ? null : parseInt(awayScore);
    let winnerId = overrideWinnerId !== undefined ? overrideWinnerId : null;
    if (winnerId === null && hs !== null && as_ !== null) {
      if (hs > as_) winnerId = match.homeTeamId;
      else if (as_ > hs) winnerId = match.awayTeamId;
    }
    onUpdate(match.id, {
      homeScore: hs,
      awayScore: as_,
      status: (hs !== null && as_ !== null && winnerId) ? "final" : match.status,
      winnerTeamId: winnerId,
    });
  };

  return (
    <Card data-testid={`playoff-match-card-${match.id}`}>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Badge variant={match.status === "final" ? "default" : "secondary"}>
            {match.status.toUpperCase()}
          </Badge>
          {match.homeSeed && <span className="text-xs text-muted-foreground">#{match.homeSeed} vs #{match.awaySeed}</span>}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm flex-1 min-w-[80px] ${match.winnerTeamId === match.homeTeamId ? "font-bold" : ""}`}>
              {match.homeTeam?.name || "TBD"}
            </span>
            <Input
              type="number"
              min="0"
              className="w-16"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              disabled={!match.homeTeamId || !match.awayTeamId}
              data-testid={`input-home-score-${match.id}`}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm flex-1 min-w-[80px] ${match.winnerTeamId === match.awayTeamId ? "font-bold" : ""}`}>
              {match.awayTeam?.name || "TBD"}
            </span>
            <Input
              type="number"
              min="0"
              className="w-16"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              disabled={!match.homeTeamId || !match.awayTeamId}
              data-testid={`input-away-score-${match.id}`}
            />
          </div>
        </div>
        {isTied && !match.winnerTeamId && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Tied score — select the winner (OT/SO):</p>
            <div className="flex gap-1 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => handleSaveScore(match.homeTeamId)} data-testid={`button-pick-home-${match.id}`}>
                {match.homeTeam?.name}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleSaveScore(match.awayTeamId)} data-testid={`button-pick-away-${match.id}`}>
                {match.awayTeam?.name}
              </Button>
            </div>
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          {!isTied && (
            <Button
              size="sm"
              onClick={() => handleSaveScore()}
              disabled={!match.homeTeamId || !match.awayTeamId || homeScore === "" || awayScore === ""}
              data-testid={`button-save-score-${match.id}`}
            >
              <Check className="h-3 w-3 mr-1" /> Save
            </Button>
          )}
          {match.winnerTeamId && match.status === "final" && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Check className="h-3 w-3" /> Winner: {match.winnerTeam?.name || match.homeTeam?.name || match.awayTeam?.name}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getRoundName(round: number, totalRounds: number): string {
  if (round === totalRounds) return "Final";
  if (round === totalRounds - 1) return "Semifinals";
  if (round === totalRounds - 2) return "Quarterfinals";
  return `Round ${round}`;
}

export default function AdminPlayoffs() {
  const { data: tournaments } = useTournaments();
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
  const [selectedDivisionId, setSelectedDivisionId] = useState<number | null>(null);
  const { data: divisions } = useDivisions(selectedTournamentId || 0);
  const { toast } = useToast();

  const [qualifyCount, setQualifyCount] = useState(4);
  const [showBracket, setShowBracket] = useState(false);

  useEffect(() => {
    if (divisions && divisions.length > 0 && !selectedDivisionId) {
      setSelectedDivisionId(divisions[0].id);
    }
  }, [divisions]);

  useEffect(() => {
    setSelectedDivisionId(null);
  }, [selectedTournamentId]);

  const settingsKey = selectedTournamentId && selectedDivisionId
    ? `/api/tournaments/${selectedTournamentId}/divisions/${selectedDivisionId}/playoffs/settings`
    : null;

  const matchesKey = selectedTournamentId && selectedDivisionId
    ? `/api/tournaments/${selectedTournamentId}/divisions/${selectedDivisionId}/playoffs/matches`
    : null;

  const { data: settings, isLoading: settingsLoading } = useQuery<PlayoffSettings | null>({
    queryKey: [settingsKey],
    queryFn: async () => {
      const res = await fetch(settingsKey!);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!settingsKey,
  });

  const { data: playoffMatchesData, isLoading: matchesLoading } = useQuery<PlayoffMatchWithTeams[]>({
    queryKey: [matchesKey],
    queryFn: async () => {
      const res = await fetch(matchesKey!);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!matchesKey,
  });

  useEffect(() => {
    if (settings) {
      setQualifyCount(settings.qualifyCount);
      setShowBracket(settings.showBracket);
    } else {
      setQualifyCount(4);
      setShowBracket(false);
    }
  }, [settings]);

  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/tournaments/${selectedTournamentId}/divisions/${selectedDivisionId}/playoffs/settings`, {
        qualifyCount,
        showBracket,
        bracketMode: "byes",
        seedingSource: "standings",
        reseedEachRound: false,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [settingsKey] });
      toast({ title: "Playoff settings saved" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/tournaments/${selectedTournamentId}/divisions/${selectedDivisionId}/playoffs/generate`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [matchesKey] });
      queryClient.invalidateQueries({ queryKey: [settingsKey] });
      toast({ title: "Bracket generated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error generating bracket", description: err.message, variant: "destructive" });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/tournaments/${selectedTournamentId}/divisions/${selectedDivisionId}/playoffs/reset`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [matchesKey] });
      queryClient.invalidateQueries({ queryKey: [settingsKey] });
      toast({ title: "Bracket reset" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMatchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/playoffs/matches/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [matchesKey] });
      toast({ title: "Match updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });


  const matchesByRound = (playoffMatchesData || []).reduce<Record<number, PlayoffMatchWithTeams[]>>((acc, m) => {
    if (!acc[m.round]) acc[m.round] = [];
    acc[m.round].push(m);
    return acc;
  }, {});

  const totalRounds = Object.keys(matchesByRound).length;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6" data-testid="admin-playoffs-page">
        <div className="flex items-center gap-3 flex-wrap">
          <Trophy className="h-6 w-6" />
          <h1 className="text-2xl font-bold font-display">Playoff Brackets</h1>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="w-64">
            <Label>Tournament</Label>
            <Select
              value={selectedTournamentId?.toString() || ""}
              onValueChange={(val) => setSelectedTournamentId(Number(val))}
            >
              <SelectTrigger data-testid="select-tournament">
                <SelectValue placeholder="Select tournament" />
              </SelectTrigger>
              <SelectContent>
                {(tournaments || []).map((t: Tournament) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {divisions && divisions.length > 0 && (
            <div className="w-64">
              <Label>Division</Label>
              <Select
                value={selectedDivisionId?.toString() || ""}
                onValueChange={(val) => setSelectedDivisionId(Number(val))}
              >
                <SelectTrigger data-testid="select-division">
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((d: Division) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {selectedTournamentId && selectedDivisionId && !settingsLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Playoff Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-48">
                  <Label>Teams Qualifying</Label>
                  <Input
                    type="number"
                    min={2}
                    max={16}
                    value={qualifyCount}
                    onChange={(e) => setQualifyCount(parseInt(e.target.value) || 4)}
                    disabled={settings?.locked}
                    data-testid="input-qualify-count"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <Switch
                    checked={showBracket}
                    onCheckedChange={setShowBracket}
                    data-testid="switch-show-bracket"
                  />
                  <Label>Show bracket publicly</Label>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => saveSettingsMutation.mutate()}
                  disabled={saveSettingsMutation.isPending}
                  data-testid="button-save-settings"
                >
                  {saveSettingsMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Settings
                </Button>
                {!settings?.generated && (
                  <Button
                    variant="outline"
                    onClick={() => generateMutation.mutate()}
                    disabled={generateMutation.isPending}
                    data-testid="button-generate-bracket"
                  >
                    {generateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Bracket
                  </Button>
                )}
                {settings?.generated && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Reset the bracket? This will delete all playoff matches for this division.")) {
                        resetMutation.mutate();
                      }
                    }}
                    disabled={resetMutation.isPending}
                    data-testid="button-reset-bracket"
                  >
                    {resetMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reset Bracket
                  </Button>
                )}
              </div>
              {settings?.generated && (
                <p className="text-sm text-muted-foreground">
                  Bracket is locked. Seeding is based on current standings positions.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {matchesLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!matchesLoading && Object.keys(matchesByRound).length > 0 && (
          <div className="space-y-6" data-testid="admin-bracket-view">
            <h2 className="text-lg font-bold font-display">Bracket</h2>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {Object.entries(matchesByRound)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([round, roundMatches]) => (
                  <div key={round} className="min-w-[250px] space-y-3 flex-shrink-0">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      {getRoundName(Number(round), totalRounds)}
                    </h3>
                    {roundMatches.map((match) => (
                      <PlayoffMatchCard
                        key={match.id}
                        match={match}
                        onUpdate={(id, data) => updateMatchMutation.mutate({ id, data })}
                      />
                    ))}
                  </div>
                ))}
            </div>
          </div>
        )}

        {!matchesLoading && !selectedTournamentId && (
          <div className="text-center py-12 text-muted-foreground">
            Select a tournament and division to manage playoffs.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
