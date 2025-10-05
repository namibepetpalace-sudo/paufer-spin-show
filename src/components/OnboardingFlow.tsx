import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronRight, ChevronLeft, Check, Popcorn, Star, Heart, Zap, CheckCircle, Tv } from "lucide-react";
import { usePersonalization } from "@/hooks/usePersonalization";
import { useToast } from "@/hooks/use-toast";

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

// Gêneros com IDs do TMDb
const genres = [
  { id: 28, name: 'Ação', emoji: '💥' },
  { id: 35, name: 'Comédia', emoji: '😂' },
  { id: 18, name: 'Drama', emoji: '🎭' },
  { id: 27, name: 'Terror', emoji: '😱' },
  { id: 10749, name: 'Romance', emoji: '💕' },
  { id: 878, name: 'Ficção Científica', emoji: '🚀' },
  { id: 53, name: 'Suspense', emoji: '🔪' },
  { id: 14, name: 'Fantasia', emoji: '🧙‍♂️' },
  { id: 16, name: 'Animação', emoji: '🎨' },
  { id: 99, name: 'Documentário', emoji: '📽️' },
  { id: 12, name: 'Aventura', emoji: '🗺️' },
  { id: 80, name: 'Crime', emoji: '🕵️‍♂️' }
];

const OnboardingFlow = ({ isOpen, onClose }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const { completeOnboarding } = usePersonalization();
  const { toast } = useToast();

  const steps = [
    {
      title: "Bem-vindo ao PauferFlix! 🎬",
      description: "Sua nova plataforma de descoberta de filmes e séries",
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
            <Popcorn className="h-12 w-12 text-white" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold">Deixe o destino escolher!</h3>
            <p className="text-muted-foreground">
              Descubra seu próximo filme ou série favorito com nossa roleta mágica e recomendações personalizadas.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col items-center space-y-2">
              <Zap className="h-8 w-8 text-yellow-500" />
              <span>Rápido</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Star className="h-8 w-8 text-blue-500" />
              <span>Personalizado</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Heart className="h-8 w-8 text-red-500" />
              <span>Divertido</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Quais gêneros você mais gosta? 🎯",
      description: "Selecione seus favoritos para recomendações personalizadas",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {genres.map((genre) => (
              <Badge
                key={genre.id}
                variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                className={`p-3 cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedGenres.includes(genre.id) 
                    ? 'bg-primary text-white border-primary' 
                    : 'hover:bg-primary/10'
                }`}
                onClick={() => {
                  if (selectedGenres.includes(genre.id)) {
                    setSelectedGenres(selectedGenres.filter(g => g !== genre.id));
                  } else {
                    setSelectedGenres([...selectedGenres, genre.id]);
                  }
                }}
              >
                <span className="mr-2">{genre.emoji}</span>
                {genre.name}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Selecione pelo menos 3 gêneros para continuar
          </p>
        </div>
      )
    },
    {
      title: "Tudo pronto! 🎉",
      description: "Agora você pode começar a descobrir conteúdos incríveis",
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold">Perfil Configurado!</h3>
            <p className="text-muted-foreground">
              Suas preferências foram salvas. Agora você receberá recomendações personalizadas baseadas nos gêneros que você selecionou.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-wrap justify-center gap-2">
              {selectedGenres.slice(0, 5).map((genreId) => {
                const genre = genres.find(g => g.id === genreId);
                return genre ? (
                  <Badge key={genreId} variant="secondary">
                    <span className="mr-1">{genre.emoji}</span>
                    {genre.name}
                  </Badge>
                ) : null;
              })}
              {selectedGenres.length > 5 && (
                <Badge variant="outline">+{selectedGenres.length - 5} mais</Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/trending'}
              className="flex items-center space-x-2"
            >
              <Tv className="h-4 w-4" />
              <span>Ver Tendências</span>
            </Button>
            <Button
              onClick={() => {
                // Simular roleta
                const randomMovieButton = document.querySelector('[data-roulette-spin]') as HTMLButtonElement;
                if (randomMovieButton) {
                  randomMovieButton.click();
                }
                onClose();
              }}
              className="flex items-center space-x-2"
            >
              <Popcorn className="h-4 w-4" />
              <span>Girar Roleta</span>
            </Button>
          </div>
        </div>
      )
    }
  ];

  const nextStep = async () => {
    if (currentStep === 1) { // Genre selection step
      if (selectedGenres.length < 3) {
        toast({
          title: "Selecione pelo menos 3 gêneros",
          description: "Isso nos ajuda a fazer recomendações melhores para você.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const success = await completeOnboarding(selectedGenres);
      if (success) {
        // Marcar no localStorage que o onboarding foi concluído permanentemente
        localStorage.setItem('onboarding_completed', 'true');
        toast({
          title: "Onboarding concluído!",
          description: "Suas preferências foram salvas. Agora você receberá recomendações personalizadas.",
        });
        onClose();
      } else {
        toast({
          title: "Erro ao salvar preferências",
          description: "Tente novamente em alguns instantes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao salvar suas preferências.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = currentStep === 0 || (currentStep === 1 && selectedGenres.length >= 3) || currentStep === 2;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{steps[currentStep].title}</span>
            <Badge variant="outline">{currentStep + 1} de {steps.length}</Badge>
          </DialogTitle>
          <p className="text-muted-foreground">
            {steps[currentStep].description}
          </p>
        </DialogHeader>

        <div className="py-6">
          {steps[currentStep].content}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          <div className="flex items-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {currentStep === steps.length - 1 ? (
            <Button 
              onClick={handleComplete} 
              disabled={loading || selectedGenres.length < 3}
              className="flex-1 max-w-48"
            >
              <Check className="h-4 w-4 mr-2" />
              {loading ? "Salvando..." : "Finalizar"}
            </Button>
          ) : (
            <Button 
              onClick={nextStep} 
              disabled={!canProceed}
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingFlow;