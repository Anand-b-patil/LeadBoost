import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface AuthPageProps {
  onSignIn: () => void;
}

export function AuthPage({ onSignIn }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-[32px] bg-gradient-to-r from-[#6C63FF] to-[#4F46E5] bg-clip-text text-transparent mb-4">
            LeadBoost
          </h1>
          
          {/* Small AI Illustration */}
          <div className="flex justify-center mb-6">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1588869715773-c6641407939b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMGF1dG9tYXRpb24lMjBmcmllbmRseSUyMGlsbHVzdHJhdGlvbnxlbnwxfHx8fDE3NTk0OTY2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="AI Automation"
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>
        </div>

        {/* Auth Card */}
        <Card className="shadow-lg border border-gray-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isSignUp ? "Create Account" : "Sign In"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              {isSignUp && (
                <div>
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
              )}

              <Button 
                type="submit"
                className="w-full h-12 bg-[#6C63FF] hover:bg-[#5B54E6] text-white"
              >
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#4F46E5] hover:underline"
              >
                {isSignUp ? "Already have an account? Sign in" : "Create new account"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}