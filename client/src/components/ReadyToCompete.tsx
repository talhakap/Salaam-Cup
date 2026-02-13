import { Link } from "wouter";
import { Button } from "./ui/button";

export function ReadyToCompete() {
  return (
    <section className="py-20 bg-foreground text-background" data-testid="section-ready-compete">
      <div className="container mx-auto px-4 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Register</p>
        <h2 className="text-3xl md:text-5xl font-bold font-display uppercase mb-4" data-testid="text-ready-compete">
          Ready To Compete?
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto mb-8 text-sm">
          Register your team and be part of the next Salaam Cup. Compete, connect, and experience the energy of a true multi-sport tournament.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/register">
            <Button variant="outline" className="rounded-full border-white text-white bg-transparent hover:bg-white hover:text-black px-8 font-bold uppercase text-xs tracking-wider" data-testid="button-register-cta">
              Register Now
            </Button>
          </Link>
          <Link href="/tournaments">
            <Button variant="outline" className="rounded-full border-white text-white bg-transparent hover:bg-white hover:text-black px-8 font-bold uppercase text-xs tracking-wider" data-testid="button-tournaments-cta">
              Tournaments
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
