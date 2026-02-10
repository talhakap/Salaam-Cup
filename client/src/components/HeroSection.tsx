import heroLandingImg from "/images/hero-landing.png";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  image?: string;
  size?: "large" | "medium" | "small";
}

export function HeroSection({ title, subtitle, image, size = "medium" }: HeroSectionProps) {
  const heightClass = size === "large" 
    ? "h-[70vh] min-h-[500px]" 
    : size === "small" 
      ? "h-[30vh] min-h-[200px]" 
      : "h-[45vh] min-h-[300px]";

  return (
    <section className={`relative ${heightClass} flex flex-col items-center justify-center overflow-hidden`} data-testid="hero-section">
      <div className="absolute inset-0 z-0">
        <img 
          src={image || heroLandingImg} 
          alt="" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative z-10 text-center px-4">
        <h1 
          className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-white uppercase leading-none tracking-tight"
          data-testid="text-hero-title"
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light" data-testid="text-hero-subtitle">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
