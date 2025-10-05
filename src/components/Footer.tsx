import { Linkedin, Twitter, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-50 py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          {/* Links */}
          <nav className="flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-[#6C63FF] transition-colors">About</a>
            <a href="#" className="text-gray-600 hover:text-[#6C63FF] transition-colors">Blog</a>
            <a href="#" className="text-gray-600 hover:text-[#6C63FF] transition-colors">Careers</a>
            <a href="#" className="text-gray-600 hover:text-[#6C63FF] transition-colors">Contact</a>
          </nav>

          {/* Social Icons */}
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-[#6C63FF] transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#6C63FF] transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#6C63FF] transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            © 2025 LeadBoost – AI-powered Lead Intelligence
          </p>
        </div>
      </div>
    </footer>
  );
}