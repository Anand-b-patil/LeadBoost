import { useState } from "react";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { Footer } from "./components/Footer";
import { AuthPage } from "./components/AuthPage";
import { Dashboard } from "./components/Dashboard";

type AppState = "landing" | "auth" | "dashboard";

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppState>("landing");

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "landing":
        return (
          <div className="min-h-screen bg-white">
            <Header onSignInClick={() => setCurrentPage("auth")} />
            <HeroSection onGetStarted={() => setCurrentPage("auth")} />
            <FeaturesSection />
            <HowItWorksSection />
            <TestimonialsSection />
            <Footer />
          </div>
        );
      case "auth":
        return <AuthPage onSignIn={() => setCurrentPage("dashboard")} />;
      case "dashboard":
        return <Dashboard onSignOut={() => setCurrentPage("landing")} />;
      default:
        return null;
    }
  };

  return renderCurrentPage();
}