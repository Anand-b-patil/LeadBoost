import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { User, LogOut, Crown, Zap } from "lucide-react";

interface UserProfileProps {
  onSignOut: () => void;
}

export function UserProfile({ onSignOut }: UserProfileProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Demo stats
  const stats = {
    leadsProcessed: 2340,
    emailsGenerated: 145,
    hotLeadsFound: 89,
    apiCreditsUsed: 7650,
    apiCreditsTotal: 10000
  };

  useEffect(() => {
    // Load from localStorage or use defaults
    const stored = localStorage.getItem("leadboost_user_profile");
    if (stored) {
      const parsed = JSON.parse(stored);
      setName(parsed.name || "");
      setEmail(parsed.email || "");
    } else {
      setName("John Doe");
      setEmail("john.doe@example.com");
    }
  }, []);

  const handleUpdate = () => {
    localStorage.setItem(
      "leadboost_user_profile",
      JSON.stringify({ name, email })
    );
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleDownload = () => {
    const data = {
      name,
      email,
      ...stats
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "profile_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAccountSettings = () => {
    setShowSettings(true);
  };

  const handleUpgrade = () => {
    setShowUpgrade(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* User Info Card */}
      <Card className="shadow-lg border border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2 text-[#6C63FF]" />
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-[#6C63FF] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl">{name}</h3>
              <p className="text-gray-600">{email}</p>
              <Badge className="bg-[#6C63FF] text-white mt-2">
                <Crown className="w-3 h-3 mr-1" />
                Pro Plan
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm">Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} className="h-12" />
            </div>
            <div>
              <label className="block mb-2 text-sm">Email</label>
              <Input value={email} onChange={e => setEmail(e.target.value)} className="h-12" />
            </div>
          </div>

          <Button className="w-full bg-[#6C63FF] hover:bg-[#5B54E6] text-white h-12" onClick={handleUpdate}>
            Update Profile
          </Button>
          {success && (
            <div className="text-green-600 text-center mt-2">Profile updated!</div>
          )}
        </CardContent>
      </Card>

      {/* Subscription & Usage Card */}
      <Card className="shadow-lg border border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-[#4F46E5]" />
            Subscription & Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl text-[#6C63FF] mb-1">{stats.leadsProcessed.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Leads Processed</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl text-[#4F46E5] mb-1">{stats.emailsGenerated.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Emails Generated</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl text-orange-500 mb-1">{stats.hotLeadsFound.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Hot Leads Found</div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-[#6C63FF]/10 to-[#4F46E5]/10 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">API Credits Used</span>
              <span className="text-sm">{stats.apiCreditsUsed.toLocaleString()} / {stats.apiCreditsTotal.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-[#6C63FF] h-2 rounded-full" style={{ width: `${(stats.apiCreditsUsed / stats.apiCreditsTotal) * 100}%` }}></div>
            </div>
          </div>

          <Button variant="outline" className="w-full h-12" onClick={handleUpgrade}>
            Upgrade Plan
          </Button>
          {showUpgrade && (
            <div className="text-blue-600 text-center mt-2">
              Upgrade options coming soon!
              <button className="ml-2 underline" onClick={() => setShowUpgrade(false)}>Dismiss</button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="shadow-lg border border-gray-100">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Button variant="outline" className="w-full h-12" onClick={handleDownload}>
              Download Data
            </Button>
            <Button variant="outline" className="w-full h-12" onClick={handleAccountSettings}>
              Account Settings
            </Button>
            <Button 
              onClick={onSignOut}
              className="w-full h-12 bg-[#6C63FF] hover:bg-[#5B54E6] text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
            {showSettings && (
              <div className="text-blue-600 text-center mt-2">
                Account settings coming soon!
                <button className="ml-2 underline" onClick={() => setShowSettings(false)}>Dismiss</button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}