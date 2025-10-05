import { Button } from "./ui/button";

interface HeaderProps {
  onSignInClick: () => void;
}

export function Header({ onSignInClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-[32px] bg-gradient-to-r from-[#6C63FF] to-[#4F46E5] bg-clip-text text-transparent">
              LeadBoost
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="hover:text-[#6C63FF] transition-colors">Home</a>
            <a href="#" className="hover:text-[#6C63FF] transition-colors">Features</a>
            <a href="#" className="hover:text-[#6C63FF] transition-colors">Pricing</a>
            <a href="#" className="hover:text-[#6C63FF] transition-colors">Demo</a>
            <Button onClick={onSignInClick} variant="outline" className="ml-4">Sign In</Button>
          </nav>
        </div>
      </div>
    </header>
  );
}