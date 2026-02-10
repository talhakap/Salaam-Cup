import { MainLayout } from "@/components/MainLayout";
import heroImg from "/images/hero-about.png";

export default function About() {
  return (
    <MainLayout>
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImg} alt="About Us" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-secondary/80 mix-blend-multiply" />
        </div>
        <div className="container relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold font-display uppercase mb-4">About Us</h1>
        </div>
      </section>
      
      <section className="py-20 container mx-auto px-4 max-w-4xl">
         <div className="prose prose-lg mx-auto">
            <h2 className="font-display uppercase text-primary">Our Mission</h2>
            <p>
              Salaam Cup is a multi-tournament sports platform dedicated to organizing and managing community-based competitions. 
              Our goal is to foster brotherhood, sisterhood, and community spirit through professionally managed sports events.
            </p>
            
            <h2 className="font-display uppercase text-primary mt-12">How It Works</h2>
            <p>
              We provide a centralized platform for team registration, roster management, and player verification. 
              Captains can easily register their teams, submit rosters, and track their progress throughout the tournament.
            </p>

            <h2 className="font-display uppercase text-primary mt-12">Contact Us</h2>
            <p>
              Have questions? Reach out to our admin team at <a href="mailto:info@salaamcup.com">info@salaamcup.com</a>.
            </p>
         </div>
      </section>
    </MainLayout>
  );
}
