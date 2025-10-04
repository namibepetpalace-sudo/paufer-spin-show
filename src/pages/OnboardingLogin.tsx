import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Facebook, Mail } from "lucide-react";

export default function OnboardingLogin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Let's you in</h1>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full h-14 text-base font-semibold"
            onClick={() => navigate("/auth")}
          >
            <Facebook className="mr-2 h-5 w-5" />
            Continue with Facebook
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full h-14 text-base font-semibold"
            onClick={() => navigate("/auth")}
          >
            <Mail className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full h-14 text-base font-semibold"
            onClick={() => navigate("/auth")}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </Button>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background text-muted-foreground">or</span>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full h-14 text-base font-semibold"
          onClick={() => navigate("/auth")}
        >
          Sign in with password
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/auth")}
            className="text-primary font-semibold hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
