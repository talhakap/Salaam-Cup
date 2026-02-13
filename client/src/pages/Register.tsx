import { MainLayout } from "@/components/MainLayout";
import { SEO } from "@/components/SEO";
import { HeroSection } from "@/components/HeroSection";
import { SponsorBar } from "@/components/SponsorBar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTeamSchema } from "@shared/schema";
import { useTournaments, useDivisions } from "@/hooks/use-tournaments";
import { useCreateTeam, useTeams } from "@/hooks/use-teams";
import { useRegisterPlayer } from "@/hooks/use-players";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { WaiverDialog } from "@/components/WaiverDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import heroImg from "/images/hero-register.png";

type RegistrationType = "team" | "player" | "free_agent";

const teamRegistrationSchema = insertTeamSchema.pick({
  name: true,
  captainName: true,
  captainEmail: true,
  captainPhone: true,
  tournamentId: true,
  divisionId: true,
  logoUrl: true,
  description: true,
}).extend({
  tournamentId: z.coerce.number().min(1, "Tournament is required"),
  divisionId: z.coerce.number().min(1, "Division is required"),
  captainName: z.string().min(2, "Full name is required"),
  captainEmail: z.string().email("Valid email is required"),
  captainPhone: z.string().min(10, "Valid phone number required"),
  name: z.string().min(2, "Team name is required"),
  waiverAgreed: z.boolean().refine(val => val, "You must agree to the waiver"),
});

const playerRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  dob: z.string().min(1, "Date of birth is required"),
  tournamentId: z.coerce.number().min(1, "Tournament is required"),
  divisionId: z.coerce.number().min(1, "Division is required"),
  teamId: z.coerce.number().min(1, "Team is required"),
  waiverAgreed: z.boolean().refine(val => val, "You must agree to the waiver"),
});

const freeAgentRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  dob: z.string().min(1, "Date of birth is required"),
  tournamentId: z.coerce.number().min(1, "Tournament is required"),
  divisionId: z.coerce.number().min(1, "Division is required"),
  waiverAgreed: z.boolean().refine(val => val, "You must agree to the waiver"),
});

function TeamRegistrationForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const { data: tournaments } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null);
  const { data: divisions } = useDivisions(selectedTournament || 0);
  const createTeam = useCreateTeam();
  const [waiverRead, setWaiverRead] = useState(false);
  const [waiverOpen, setWaiverOpen] = useState(false);

  const form = useForm<z.infer<typeof teamRegistrationSchema>>({
    resolver: zodResolver(teamRegistrationSchema),
    defaultValues: {
      name: "",
      captainName: "",
      captainEmail: "",
      captainPhone: "",
      logoUrl: "",
      description: "",
      waiverAgreed: false,
    },
  });

  async function onSubmit(data: z.infer<typeof teamRegistrationSchema>) {
    try {
      const { waiverAgreed, ...teamData } = data;
      await createTeam.mutateAsync({ ...teamData, status: "pending" });
      onSuccess();
    } catch (error) {
      toast({ title: "Registration Failed", description: (error as Error).message, variant: "destructive" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField control={form.control} name="captainName" render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name*</FormLabel>
              <FormControl><Input placeholder="Your full name" {...field} data-testid="input-captain-name" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="captainEmail" render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address*</FormLabel>
              <FormControl><Input type="email" placeholder="captain@email.com" {...field} data-testid="input-captain-email" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="captainPhone" render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number*</FormLabel>
            <FormControl><Input placeholder="(555) 555-5555" {...field} data-testid="input-captain-phone" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Team Name*</FormLabel>
            <FormControl><Input placeholder="e.g. Toronto Eagles" {...field} data-testid="input-team-name" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="tournamentId" render={({ field }) => (
          <FormItem>
            <FormLabel>What tournament are you registering for?*</FormLabel>
            <Select onValueChange={(val) => { field.onChange(Number(val)); setSelectedTournament(Number(val)); form.setValue("divisionId", 0); }} defaultValue={field.value?.toString()}>
              <FormControl>
                <SelectTrigger data-testid="select-tournament"><SelectValue placeholder="Select tournament..." /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {tournaments?.filter(t => t.status !== 'completed' && t.registrationOpen).map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="divisionId" render={({ field }) => (
          <FormItem>
            <FormLabel>What division are you registering for?*</FormLabel>
            <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value?.toString()} disabled={!selectedTournament}>
              <FormControl>
                <SelectTrigger data-testid="select-division"><SelectValue placeholder="Select one..." /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {divisions?.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.name} {d.category ? `(${d.category})` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="waiverAgreed" render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => {
                  if (!waiverRead && checked) {
                    setWaiverOpen(true);
                    return;
                  }
                  field.onChange(checked);
                }}
                data-testid="checkbox-waiver"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                I have read and agree to the{" "}
                <span
                  className="underline cursor-pointer"
                  onClick={(e) => { e.preventDefault(); setWaiverOpen(true); }}
                  data-testid="link-waiver-terms"
                >
                  waiver and terms
                </span>*
              </FormLabel>
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <WaiverDialog
          open={waiverOpen}
          onOpenChange={setWaiverOpen}
          onRead={() => { setWaiverRead(true); form.setValue("waiverAgreed", true); }}
        />

        <div className="flex justify-end">
          <Button type="submit" className="hover:bg-white hover:text-black rounded-full font-bold uppercase text-xs tracking-wider px-8" disabled={createTeam.isPending} data-testid="button-submit-registration">
            {createTeam.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Register Team
          </Button>
        </div>
      </form>
    </Form>
  );
}

function PlayerRegistrationForm({ onSuccess }: { onSuccess: (status: string) => void }) {
  const { toast } = useToast();
  const { data: tournaments } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<number | null>(null);
  const { data: divisions } = useDivisions(selectedTournament || 0);
  const { data: availableTeams } = useTeams(selectedTournament || 0, selectedDivision ? { status: "approved", divisionId: selectedDivision.toString() } : { status: "approved" });
  const registerPlayer = useRegisterPlayer();
  const [waiverRead, setWaiverRead] = useState(false);
  const [waiverOpen, setWaiverOpen] = useState(false);

  const form = useForm<z.infer<typeof playerRegistrationSchema>>({
    resolver: zodResolver(playerRegistrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      dob: "",
      waiverAgreed: false,
    },
  });

  async function onSubmit(data: z.infer<typeof playerRegistrationSchema>) {
    try {
      const nameParts = data.fullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || nameParts[0];

      const result = await registerPlayer.mutateAsync({
        firstName,
        lastName,
        email: data.email,
        dob: data.dob,
        teamId: data.teamId,
        registrationType: "player",
      });
      onSuccess(result.status);
    } catch (error) {
      toast({ title: "Registration Failed", description: (error as Error).message, variant: "destructive" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField control={form.control} name="fullName" render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name*</FormLabel>
              <FormControl><Input placeholder="Your full name" {...field} data-testid="input-player-fullname" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address*</FormLabel>
              <FormControl><Input type="email" placeholder="player@email.com" {...field} data-testid="input-player-email" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="dob" render={({ field }) => (
          <FormItem>
            <FormLabel>Date of birth*</FormLabel>
            <FormControl><Input type="date" {...field} data-testid="input-player-dob" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="tournamentId" render={({ field }) => (
          <FormItem>
            <FormLabel>What tournament are you registering for?*</FormLabel>
            <Select onValueChange={(val) => { field.onChange(Number(val)); setSelectedTournament(Number(val)); setSelectedDivision(null); form.setValue("divisionId", 0); form.setValue("teamId", 0); }} defaultValue={field.value?.toString()}>
              <FormControl>
                <SelectTrigger data-testid="select-player-tournament"><SelectValue placeholder="Select tournament..." /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {tournaments?.filter(t => t.status !== 'completed' && t.registrationOpen).map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="divisionId" render={({ field }) => (
          <FormItem>
            <FormLabel>What division are you registering for?*</FormLabel>
            <Select onValueChange={(val) => { field.onChange(Number(val)); setSelectedDivision(Number(val)); form.setValue("teamId", 0); }} defaultValue={field.value?.toString()} disabled={!selectedTournament}>
              <FormControl>
                <SelectTrigger data-testid="select-player-division"><SelectValue placeholder="Select one..." /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {divisions?.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.name} {d.category ? `(${d.category})` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="teamId" render={({ field }) => (
          <FormItem>
            <FormLabel>What team are you registering for?*</FormLabel>
            <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value?.toString()} disabled={!selectedTournament}>
              <FormControl>
                <SelectTrigger data-testid="select-player-team"><SelectValue placeholder="Select one..." /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableTeams?.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="waiverAgreed" render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => {
                  if (!waiverRead && checked) {
                    setWaiverOpen(true);
                    return;
                  }
                  field.onChange(checked);
                }}
                data-testid="checkbox-player-waiver"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                I have read and agree to the{" "}
                <span
                  className="underline cursor-pointer"
                  onClick={(e) => { e.preventDefault(); setWaiverOpen(true); }}
                  data-testid="link-player-waiver-terms"
                >
                  waiver and terms
                </span>*
              </FormLabel>
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <WaiverDialog
          open={waiverOpen}
          onOpenChange={setWaiverOpen}
          onRead={() => { setWaiverRead(true); form.setValue("waiverAgreed", true); }}
        />

        <div className="flex justify-end">
          <Button type="submit" className="hover:bg-white hover:text-black rounded-full font-bold uppercase text-xs tracking-wider px-8" disabled={registerPlayer.isPending} data-testid="button-submit-player-registration">
            {registerPlayer.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Register Now
          </Button>
        </div>
      </form>
    </Form>
  );
}

function FreeAgentRegistrationForm({ onSuccess }: { onSuccess: (status: string) => void }) {
  const { toast } = useToast();
  const { data: tournaments } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null);
  const { data: divisions } = useDivisions(selectedTournament || 0);
  const registerPlayer = useRegisterPlayer();
  const [waiverRead, setWaiverRead] = useState(false);
  const [waiverOpen, setWaiverOpen] = useState(false);

  const form = useForm<z.infer<typeof freeAgentRegistrationSchema>>({
    resolver: zodResolver(freeAgentRegistrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      dob: "",
      waiverAgreed: false,
    },
  });

  async function onSubmit(data: z.infer<typeof freeAgentRegistrationSchema>) {
    try {
      const nameParts = data.fullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || nameParts[0];

      const result = await registerPlayer.mutateAsync({
        firstName,
        lastName,
        email: data.email,
        dob: data.dob,
        teamId: null,
        registrationType: "free_agent",
      });
      onSuccess(result.status);
    } catch (error) {
      toast({ title: "Registration Failed", description: (error as Error).message, variant: "destructive" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField control={form.control} name="fullName" render={({ field }) => (
            <FormItem>
              <FormLabel>Full name*</FormLabel>
              <FormControl><Input placeholder="Your full name" {...field} data-testid="input-freeagent-fullname" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address*</FormLabel>
              <FormControl><Input type="email" placeholder="player@email.com" {...field} data-testid="input-freeagent-email" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="dob" render={({ field }) => (
          <FormItem>
            <FormLabel>Date of birth*</FormLabel>
            <FormControl><Input type="date" {...field} data-testid="input-freeagent-dob" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="tournamentId" render={({ field }) => (
          <FormItem>
            <FormLabel>What tournament are you registering for?*</FormLabel>
            <Select onValueChange={(val) => { field.onChange(Number(val)); setSelectedTournament(Number(val)); form.setValue("divisionId", 0); }} defaultValue={field.value?.toString()}>
              <FormControl>
                <SelectTrigger data-testid="select-freeagent-tournament"><SelectValue placeholder="Select tournament..." /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {tournaments?.filter(t => t.status !== 'completed' && t.registrationOpen).map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="divisionId" render={({ field }) => (
          <FormItem>
            <FormLabel>What division are you registering for?*</FormLabel>
            <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value?.toString()} disabled={!selectedTournament}>
              <FormControl>
                <SelectTrigger data-testid="select-freeagent-division"><SelectValue placeholder="Select one..." /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {divisions?.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.name} {d.category ? `(${d.category})` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="waiverAgreed" render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => {
                  if (!waiverRead && checked) {
                    setWaiverOpen(true);
                    return;
                  }
                  field.onChange(checked);
                }}
                data-testid="checkbox-freeagent-waiver"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                I have read and agree to the{" "}
                <span
                  className="underline cursor-pointer"
                  onClick={(e) => { e.preventDefault(); setWaiverOpen(true); }}
                  data-testid="link-freeagent-waiver-terms"
                >
                  waiver and terms
                </span>*
              </FormLabel>
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <WaiverDialog
          open={waiverOpen}
          onOpenChange={setWaiverOpen}
          onRead={() => { setWaiverRead(true); form.setValue("waiverAgreed", true); }}
        />

        <div className="flex justify-end">
          <Button type="submit" className="hover:bg-white hover:text-black rounded-full font-bold uppercase text-xs tracking-wider px-8" disabled={registerPlayer.isPending} data-testid="button-submit-freeagent-registration">
            {registerPlayer.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Register Now
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Register() {
  const { data: tournaments } = useTournaments();
  const [registrationType, setRegistrationType] = useState<RegistrationType>("team");
  const [submitted, setSubmitted] = useState(false);
  const [playerStatus, setPlayerStatus] = useState<string>("");
  const hasOpenRegistration = tournaments?.some(t => t.status !== 'completed' && t.registrationOpen);

  const registrationTypes: { key: RegistrationType; label: string }[] = [
    { key: "team", label: "Team" },
    { key: "player", label: "Player" },
    { key: "free_agent", label: "Free Agent" },
  ];

  if (submitted) {
    return (
      <MainLayout>
        <HeroSection title="Registration" image={heroImg} />
        <SponsorBar />
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-xl text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold font-display uppercase mb-4" data-testid="text-registration-success">
              Registration Submitted
            </h2>
            {registrationType === "team" ? (
              <div className="space-y-4 mb-8">
                <p className="text-muted-foreground">Your team has been submitted for review. An admin will review your registration shortly.</p>
                <Card className="text-left">
                  <CardContent className="pt-6 space-y-3">
                    <h3 className="font-bold text-sm uppercase tracking-wider">What happens next?</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>An admin will review and approve your team registration.</li>
                      <li>You will receive an email with your captain login credentials.</li>
                      <li>Sign in to the <strong>Captain Dashboard</strong> to manage your roster and add players.</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            ) : playerStatus === "confirmed" ? (
              <div className="space-y-4 mb-8">
                <p className="text-muted-foreground">Your registration has been matched against the team roster.</p>
                <Badge variant="default" className="text-sm px-4 py-1" data-testid="badge-player-status-confirmed">Confirmed</Badge>
                <p className="text-sm text-muted-foreground">Your team captain has you on the roster. No further action is needed from you.</p>
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                <p className="text-muted-foreground">Your registration has been submitted. We could not find a matching roster entry yet.</p>
                <Badge variant="secondary" className="text-sm px-4 py-1" data-testid="badge-player-status-flagged">Flagged for Review</Badge>
                <p className="text-sm text-muted-foreground">An admin or your team captain will need to verify and confirm your registration. Make sure your name and date of birth match what your captain submitted.</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={() => { setSubmitted(false); setPlayerStatus(""); }} variant="outline" className="rounded-full font-bold uppercase text-xs tracking-wider px-8" data-testid="button-register-another">
                Register Again
              </Button>
              <Link href="/">
                <Button variant="ghost" className="rounded-full font-bold uppercase text-xs tracking-wider px-8" data-testid="link-home-from-success">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO 
        title="Register Your Team"
        description="Register your team for Salaam Cup tournaments in Toronto and the GTA. Join the Muslim community's premier sports competition. Ball hockey, basketball, soccer, and softball."
        canonical="/register"
        keywords="register sports team Toronto, join tournament GTA, team registration Muslim sports, sign up ball hockey Toronto"
      />
      <HeroSection title="Register" image={heroImg} />
      <SponsorBar />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-[280px_1fr] gap-12">
            <div>
              <h3 className="font-bold text-sm mb-1" data-testid="text-registration-type-label">What are you registering?</h3>
              <p className="text-muted-foreground text-xs mb-6">
                Below you can find three types of registration. By default option "Team" is chosen, please choose one.
              </p>
              <div className="flex flex-wrap gap-3">
                {registrationTypes.map((type) => (
                  <Button
                    key={type.key}
                    variant={registrationType === type.key ? "default" : "outline"}
                    className="rounded-full font-bold uppercase text-xs tracking-wider px-6 hover:bg-foreground hover:text-white"
                    onClick={() => setRegistrationType(type.key)}
                    data-testid={`button-reg-type-${type.key}`}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6" data-testid="text-personal-info-title">Personal information</h3>
              {hasOpenRegistration === false ? (
                <div className="text-center py-12 border rounded-md bg-muted/30" data-testid="text-registration-closed">
                  <p className="font-bold text-lg mb-2">Registration is Currently Closed</p>
                  <p className="text-muted-foreground text-sm">There are no tournaments currently accepting registrations. Please check back later.</p>
                </div>
              ) : (
                <>
                  {registrationType === "team" && (
                    <TeamRegistrationForm onSuccess={() => setSubmitted(true)} />
                  )}
                  {registrationType === "player" && (
                    <PlayerRegistrationForm onSuccess={(status) => { setPlayerStatus(status); setSubmitted(true); }} />
                  )}
                  {registrationType === "free_agent" && (
                    <FreeAgentRegistrationForm onSuccess={(status) => { setPlayerStatus(status); setSubmitted(true); }} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
