import { Button } from "@/components/ui/button";
import { Play, Info, Zap } from "lucide-react";
import Roulette from "./Roulette";
import { useState, useEffect } from "react";

const HeroSection = () => {
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const movieTitles = [
    "Stranger Things",
    "Breaking Bad", 
    "The Witcher",
    "Money Heist",
    "Squid Game",
    "Bridgerton",
    "Ozark",
    "The Crown",
    "Narcos",
    "Black Mirror"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMovieIndex((prev) => (prev + 1) % movieTitles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 hero-gradient opacity-90"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background"></div>
      
      {/* Floating Elements - Netflix Red */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-netflix-red/20 rounded-full blur-xl animate-float"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-netflix-red/30 rounded-full blur-2xl animate-float animate-netflix-glow" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-netflix-red/20 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }}></div>
      
      {/* Red particles */}
      <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-netflix-red rounded-full animate-float opacity-60" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-1/3 left-1/6 w-1 h-1 bg-netflix-red rounded-full animate-float opacity-40" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-netflix-red rounded-full animate-float opacity-30" style={{ animationDelay: '2.5s' }}></div>
      
      <div className="relative container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in-up">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="gradient-text">PauferFlix</span>
                <br />
                <span className="text-foreground">Descubra o que assistir</span>
              </h1>
              
              {/* Animated movie titles */}
              <div className="h-12 overflow-hidden">
                <div className="text-2xl lg:text-3xl font-bold text-netflix-red">
                  Agora assistindo: <span className="typewriter">{movieTitles[currentMovieIndex]}</span>
                </div>
              </div>
              
              <p className="text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
                <span className="gradient-text font-semibold">"Deixe o destino escolher sua próxima série"</span>
                <br />
                Encontre filmes e séries perfeitamente adequados ao seu gosto ou deixe nossa roleta mágica surpreender você!
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-netflix-red text-white border-0 hover:bg-netflix-red/90 glow-effect px-8 py-4 text-lg transition-all duration-300 hover:scale-105"
              >
                <Play className="h-5 w-5 mr-2" />
                Começar Agora
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white px-8 py-4 text-lg transition-all duration-300"
              >
                <Info className="h-5 w-5 mr-2" />
                Como Funciona
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">50K+</div>
                <div className="text-sm text-muted-foreground">Filmes e Séries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">10M+</div>
                <div className="text-sm text-muted-foreground">Descobertas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">98%</div>
                <div className="text-sm text-muted-foreground">Satisfação</div>
              </div>
            </div>
          </div>
          
          {/* Right Side - Roulette */}
          <div className="flex justify-center lg:justify-end animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              {/* Glow effect behind roulette - Netflix Red */}
              <div className="absolute inset-0 bg-gradient-to-r from-netflix-red/40 to-netflix-red/20 rounded-full blur-3xl transform scale-150 animate-netflix-glow"></div>
              
              {/* Roulette Component */}
              <div className="relative">
                <Roulette />
              </div>
              
              {/* Floating icon - Netflix theme */}
              <div className="absolute -top-4 -right-4">
                <div className="bg-netflix-red p-3 rounded-full shadow-lg animate-float glow-effect">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;