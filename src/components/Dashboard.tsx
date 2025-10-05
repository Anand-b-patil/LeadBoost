import React from "react";
import { useState } from "react";
import { Button } from "./ui/button";
import { 
  UserCheck, 
  TrendingUp, 
  Mail, 
  Linkedin, 
  Settings, 
  User,
  LogOut
} from "lucide-react";
import { ChatbotLeadInput } from "./dashboard/ChatbotLeadInput";
import { EnrichedLeadsTable } from "./dashboard/EnrichedLeadsTable";
import { EmailGenerator } from "./dashboard/EmailGenerator";
import { LinkedInGenerator } from "./dashboard/LinkedInGenerator";
import { ScoredLeadsOverview } from "./dashboard/ScoredLeadsOverview";
import { UserProfile } from "./dashboard/UserProfile";

interface DashboardProps {
  onSignOut: () => void;
}

export function Dashboard({ onSignOut }: DashboardProps) {
  const [activeSection, setActiveSection] = useState("generate");

  const menuItems = [
    { id: "generate", label: "Generate Leads", icon: UserCheck },
    { id: "score", label: "Score Leads", icon: TrendingUp },
    { id: "email", label: "Draft Email", icon: Mail },
    { id: "linkedin", label: "LinkedIn Message", icon: Linkedin },
    { id: "settings", label: "Enriched Leads Table", icon: Settings },
    { id: "profile", label: "Profile", icon: User }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "generate":
        return <ChatbotLeadInput />;
      case "score":
        return <ScoredLeadsOverview />;
      case "email":
        return <EmailGenerator />;
      case "linkedin":
        return <LinkedInGenerator />;
      case "settings":
        return <EnrichedLeadsTable />;
      case "profile":
        return <UserProfile onSignOut={onSignOut} />;
      default:
        return <ChatbotLeadInput />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl bg-gradient-to-r from-[#6C63FF] to-[#4F46E5] bg-clip-text text-transparent">
            LeadBoost
          </h1>
        </div>

        {/* Menu Items */}
        <nav className="p-4">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors mb-2 ${
                  activeSection === item.id
                    ? "bg-[#6C63FF] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sign Out */}
        {/* Removed Sign Out button from sidebar */}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl">
              {menuItems.find(item => item.id === activeSection)?.label}
            </h2>
            
            <div className="flex items-center space-x-4">
              <button
                className="w-8 h-8 bg-[#6C63FF] rounded-full flex items-center justify-center focus:outline-none"
                onClick={() => setActiveSection('profile')}
                title="Profile"
                aria-label="Profile"
              >
                <User className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}