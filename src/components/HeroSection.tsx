import React from "react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 gap-16 items-center">
          {/* Left Side - Illustration */}
          <div className="flex justify-center">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1601751839176-7d023cb55ed8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMGNoYXRib3QlMjBhdXRvbWF0aW9uJTIwZGFzaGJvYXJkfGVufDF8fHx8MTc1OTQ5NjIwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="AI Chatbot Lead Scoring Visualization"
              className="w-[550px] h-auto rounded-2xl shadow-lg"
            />
          </div>

          {/* Right Side - Interactive Chatbot Widget */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-[48px] leading-tight">
                Boost Your Outreach. Smarter, Faster, AI-Powered.
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Enter leads one by one or upload CSV and instantly get enriched, validated, and scored leads with actionable AI insights.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex space-x-4">
              <Button onClick={onGetStarted} className="bg-[#6C63FF] hover:bg-[#5B54E6] text-white px-6 py-3">
                Try LeadBoost Free
              </Button>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}