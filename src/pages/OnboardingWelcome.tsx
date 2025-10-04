import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function OnboardingWelcome() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<string[]>([]);

  useEffect(() => {
    // Popular movie posters for background
    const posterIds = [
      "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
      "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg",
      "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
      "https://image.tmdb.org/t/p/w500/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg",
      "https://image.tmdb.org/t/p/w500/kqjL17yufvn9OVLyXYpvtyrFfak.jpg",
      "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    ];
    setMovies(posterIds);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background movie grid with overlay */}
      <div className="absolute inset-0 grid grid-cols-3 gap-2 p-4 opacity-20">
        {movies.map((poster, i) => (
          <div key={i} className="aspect-[2/3] bg-muted rounded-lg overflow-hidden">
            <img src={poster} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-end pb-12 px-6">
        <div className="text-center mb-12 space-y-6">
          <div className="text-6xl font-bold text-primary mb-6">M</div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Mova
          </h1>
          <p className="text-lg text-muted-foreground max-w-sm mx-auto">
            The best movie streaming app of the century to make your days great!
          </p>
        </div>

        <Button
          size="lg"
          className="w-full max-w-sm h-14 text-lg font-semibold"
          onClick={() => navigate("/onboarding/login")}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
