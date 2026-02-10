import { MainLayout } from "@/components/MainLayout";
import { HeroSection } from "@/components/HeroSection";
import { SponsorBar } from "@/components/SponsorBar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTeamSchema } from "@shared/schema";
import { useTournaments, useDivisions } from "@/hooks/use-tournaments";
import { useCreateTeam } from "@/hooks/use-teams";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle } from "lucide-react";
import heroImg from "/images/hero-register.png";

const registrationSchema = insertTeamSchema.pick({
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
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export default function Register() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  
  const { data: tournaments } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null);
  const { data: divisions } = useDivisions(selectedTournament || 0);
  
  const createTeam = useCreateTeam();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      captainName: "",
      captainEmail: "",
      captainPhone: "",
      logoUrl: "",
      description: "",
    },
  });

  async function onSubmit(data: RegistrationFormValues) {
    try {
      await createTeam.mutateAsync({
        ...data,
        status: "pending",
      });
      setSubmitted(true);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  }

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
            <p className="text-muted-foreground mb-2">
              Your team has been submitted for review. An admin will review your registration shortly.
            </p>
            <p className="text-muted-foreground mb-8 text-sm">
              Once approved, you will be able to create an account and manage your team roster.
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-full font-bold uppercase text-xs tracking-wider px-8" data-testid="button-register-another">
              Register Another Team
            </Button>
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <HeroSection title="Registration" image={heroImg} />
      <SponsorBar />
      
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold font-display uppercase mb-3" data-testid="text-register-title">
              Register Your Team
            </h2>
            <p className="text-muted-foreground text-sm">
              Complete the form below to enter the league. No account needed yet — you can create one after your team is approved.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div>
                <h3 className="text-lg font-bold font-display uppercase mb-4 border-b pb-2">Tournament & Division</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="tournamentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tournament</FormLabel>
                        <Select 
                          onValueChange={(val) => {
                            field.onChange(Number(val));
                            setSelectedTournament(Number(val));
                            form.setValue("divisionId", 0);
                          }}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-tournament">
                              <SelectValue placeholder="Select Tournament" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tournaments?.filter(t => t.status !== 'completed').map((t) => (
                              <SelectItem key={t.id} value={t.id.toString()}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="divisionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Division</FormLabel>
                        <Select 
                          onValueChange={(val) => field.onChange(Number(val))}
                          defaultValue={field.value?.toString()}
                          disabled={!selectedTournament}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-division">
                              <SelectValue placeholder="Select Division" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {divisions?.map((d) => (
                              <SelectItem key={d.id} value={d.id.toString()}>
                                {d.name} ({d.category})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold font-display uppercase mb-4 border-b pb-2">Team Details</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Toronto Eagles" {...field} data-testid="input-team-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description of your team" {...field} value={field.value || ''} data-testid="input-team-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold font-display uppercase mb-4 border-b pb-2">Captain Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="captainName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} data-testid="input-captain-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="captainEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="captain@email.com" {...field} data-testid="input-captain-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="captainPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 555-5555" {...field} data-testid="input-captain-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full rounded-full font-bold uppercase tracking-wider"
                  disabled={createTeam.isPending}
                  data-testid="button-submit-registration"
                >
                  {createTeam.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Submit Registration
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  By submitting, you agree to the league rules and waiver.
                </p>
              </div>
            </form>
          </Form>
        </div>
      </section>
    </MainLayout>
  );
}
