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

  const backgroundVideos = [
    "https://videos.pexels.com/video-files/5135769/5135769-uhd_2560_1440_25fps.mp4",
    "https://videos.pexels.com/video-files/7988168/7988168-uhd_2560_1440_25fps.mp4", 
    "https://videos.pexels.com/video-files/7988162/7988162-uhd_2560_1440_25fps.mp4",
    "https://videos.pexels.com/video-files/5135773/5135773-uhd_2560_1440_25fps.mp4"
  ];

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    const videoInterval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % backgroundVideos.length);
    }, 10000); // 10 segundos
    return () => clearInterval(videoInterval);
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          key={currentVideoIndex}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={backgroundVideos[currentVideoIndex]} type="video/mp4" />
        </video>
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      {/* Background Gradient for extra contrast */}
      <div className="absolute inset-0 hero-gradient opacity-40"></div>
      
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
                <span className="gradient-text drop-shadow-lg">PauferFlix</span>
                <br />
                <span className="text-white drop-shadow-lg">Descubra o que assistir</span>
              </h1>
              
              {/* Animated movie titles */}
              <div className="h-12 overflow-hidden">
                <div className="text-2xl lg:text-3xl font-bold text-netflix-red drop-shadow-lg">
                  Agora assistindo: <span className="typewriter">{movieTitles[currentMovieIndex]}</span>
                </div>
              </div>
              
              <p className="text-xl text-white/90 max-w-lg mx-auto lg:mx-0 drop-shadow-md">
                <span className="gradient-text font-semibold drop-shadow-lg">"Deixe o destino escolher sua próxima série"</span>
                <br />
                Encontre filmes e séries perfeitamente adequados ao seu gosto ou deixe nossa roleta mágica surpreender você!
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-netflix-red text-white border-0 hover:bg-netflix-red/90 glow-effect px-8 py-4 text-lg transition-all duration-300 hover:scale-105 shadow-lg backdrop-blur-sm"
              >
                <Play className="h-5 w-5 mr-2" />
                Começar Agora
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-white/80 text-white hover:bg-white/20 hover:text-white px-8 py-4 text-lg transition-all duration-300 backdrop-blur-sm bg-white/10"
              >
                <Info className="h-5 w-5 mr-2" />
                Como Funciona
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 backdrop-blur-sm bg-white/10 rounded-lg p-6">
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text drop-shadow-lg">50K+</div>
                <div className="text-sm text-white/80">Filmes e Séries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text drop-shadow-lg">10M+</div>
                <div className="text-sm text-white/80">Descobertas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text drop-shadow-lg">98%</div>
                <div className="text-sm text-white/80">Satisfação</div>
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