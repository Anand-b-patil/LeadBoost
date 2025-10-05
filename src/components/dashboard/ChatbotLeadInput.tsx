import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Progress } from "../ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Loader2, CheckCircle, Upload, FileText, Building2, TrendingUp } from "lucide-react";
import { Lead, ScoredLead, scoreMultipleLeads, saveLeadsToStorage } from "../../lib/leadScoring";

export function ChatbotLeadInput() {
  const [currentStep, setCurrentStep] = useState(0);
  const [leadCount, setLeadCount] = useState(1);
  const [totalLeads] = useState(10);
  const [leadData, setLeadData] = useState({
    name: "",
    email: "",
    linkedin: "",
    company: "",
    revenue: "",
    industry: ""
  });
  const [collectedLeads, setCollectedLeads] = useState<Lead[]>([]);
  const [scoredLeads, setScoredLeads] = useState<ScoredLead[]>([]);
  const [isScoring, setIsScoring] = useState(false);
  const [scoringComplete, setScoringComplete] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { field: "name", label: "Name", placeholder: "Enter lead's name" },
    { field: "email", label: "Email", placeholder: "Enter email address" },
    { field: "linkedin", label: "LinkedIn", placeholder: "LinkedIn profile URL" },
    { field: "company", label: "Company", placeholder: "Company name" },
    { field: "revenue", label: "Revenue", placeholder: "Annual revenue" },
    { field: "industry", label: "Industry", placeholder: "Select industry" }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save current lead and move to next
      const newLead: Lead = {
        id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...leadData,
        createdAt: new Date()
      };
      
      setCollectedLeads(prev => [...prev, newLead]);
      setLeadCount(prev => prev + 1);
      setCurrentStep(0);
      setLeadData({
        name: "",
        email: "",
        linkedin: "",
        company: "",
        revenue: "",
        industry: ""
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setLeadData(prev => ({ ...prev, [field]: value }));
  };

  const handleScoreLeads = async () => {
    if (collectedLeads.length === 0) return;
    
    setIsScoring(true);
    try {
      const scored = await scoreMultipleLeads(collectedLeads);
      setScoredLeads(scored);
      saveLeadsToStorage(scored);
      setScoringComplete(true);
    } catch (error) {
      console.error('Error scoring leads:', error);
    } finally {
      setIsScoring(false);
    }
  };

  const parseCSV = (csvText: string): Lead[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const leads: Lead[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;

      const lead: Lead = {
        id: `csv_lead_${Date.now()}_${i}`,
        name: '',
        email: '',
        linkedin: '',
        company: '',
        revenue: '',
        industry: '',
        createdAt: new Date()
      };

      // Map CSV columns to lead fields
      headers.forEach((header, index) => {
        const value = values[index];
        switch (header) {
          case 'name':
          case 'full name':
          case 'contact name':
            lead.name = value;
            break;
          case 'email':
          case 'email address':
            lead.email = value;
            break;
          case 'company':
          case 'company name':
            lead.company = value;
            break;
          case 'revenue':
          case 'annual revenue':
          case 'revenue (m)':
            lead.revenue = value;
            break;
          case 'industry':
          case 'sector':
            lead.industry = value;
            break;
          case 'linkedin':
          case 'linkedin url':
          case 'linkedin profile':
            lead.linkedin = value;
            break;
        }
      });

      // Only add leads with at least name and company
      if (lead.name && lead.company) {
        leads.push(lead);
      }
    }

    return leads;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const csvLeads = parseCSV(csvText);
        
        if (csvLeads.length > 0) {
          setCollectedLeads(prev => [...prev, ...csvLeads]);
          setScoringComplete(false);
        } else {
          alert('No valid leads found in CSV file. Please check the format.');
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const stepProgress = ((currentStep + 1) / steps.length) * 100;

  const getPriorityBadge = (score: number) => {
    if (score >= 80) return { badge: <Badge className="bg-[#6C63FF] text-white">High</Badge>, color: "purple" };
    if (score >= 60) return { badge: <Badge className="bg-[#4F46E5] text-white">Medium</Badge>, color: "blue" };
    return { badge: <Badge variant="secondary" className="bg-gray-300 text-gray-700">Low</Badge>, color: "gray" };
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg border border-gray-100">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Lead Input</span>
            <div className="flex items-center space-x-4">
              {collectedLeads.length > 0 && (
                <span className="text-sm text-[#6C63FF] font-medium">
                  {collectedLeads.length} Lead{collectedLeads.length > 1 ? 's' : ''} Collected
                </span>
              )}
              <span className="text-sm text-gray-500">
                Lead {leadCount} of {totalLeads}
              </span>
            </div>
          </CardTitle>
          <Progress value={stepProgress} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block mb-2 text-sm">{steps[currentStep].label}</label>
            {steps[currentStep].field === "industry" ? (
              <Select onValueChange={(value) => handleInputChange(steps[currentStep].field, value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="real-estate">Real Estate</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder={steps[currentStep].placeholder}
                value={leadData[steps[currentStep].field as keyof typeof leadData]}
                onChange={(e) => handleInputChange(steps[currentStep].field, e.target.value)}
                className="h-12"
              />
            )}
          </div>

          <div className="flex space-x-4">
            {currentStep < steps.length - 1 ? (
              <Button 
                onClick={handleNext}
                className="flex-1 h-12 bg-[#6C63FF] hover:bg-[#5B54E6] text-white"
              >
                Next Lead →
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                className="flex-1 h-12 bg-[#4F46E5] hover:bg-[#4338CA] text-white"
              >
                Add Lead & Continue
              </Button>
            )}
            
            {collectedLeads.length > 0 && (
              <Button 
                onClick={handleScoreLeads}
                disabled={isScoring || scoringComplete}
                className="h-12 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 disabled:opacity-50"
              >
                {isScoring ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scoring...
                  </>
                ) : scoringComplete ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Scored!
                  </>
                ) : (
                  `Finish & Score ${collectedLeads.length} Lead${collectedLeads.length > 1 ? 's' : ''}`
                )}
              </Button>
            )}
          </div>

          {/* Upload CSV Option */}
          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 mb-4">Or upload leads in bulk:</p>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="w-full h-12"
                onClick={handleUploadClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing CSV...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CSV File
                  </>
                )}
              </Button>
              <div className="text-xs text-gray-500 text-center">
                <FileText className="w-3 h-3 inline mr-1" />
                Expected columns: Name, Email, Company, Revenue, Industry, LinkedIn
                <br />
                <a 
                  href="/sample_leads.csv" 
                  download 
                  className="text-[#6C63FF] hover:underline"
                >
                  Download sample CSV
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scored Leads Display */}
      {scoringComplete && scoredLeads.length > 0 && (
        <div className="mt-8 space-y-6">
          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-[#6C63FF]" />
                Lead Scoring Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl text-[#6C63FF] mb-2">
                    {scoredLeads.filter(lead => lead.priorityScore >= 80).length}
                  </div>
                  <div className="text-sm text-gray-600">High Priority</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl text-[#4F46E5] mb-2">
                    {scoredLeads.filter(lead => lead.priorityScore >= 60 && lead.priorityScore < 80).length}
                  </div>
                  <div className="text-sm text-gray-600">Medium Priority</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl text-gray-500 mb-2">
                    {Math.round(scoredLeads.reduce((sum, lead) => sum + lead.priorityScore, 0) / scoredLeads.length)}
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Lead Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Scored Leads ({scoredLeads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scoredLeads
                  .sort((a, b) => b.priorityScore - a.priorityScore)
                  .map((lead) => {
                    const priority = getPriorityBadge(lead.priorityScore);
                    
                    return (
                      <div key={lead.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-gray-600" />
                          </div>
                          
                          <div>
                            <h3 className="font-medium">{lead.company}</h3>
                            <p className="text-sm text-gray-600">{lead.name} • {lead.industry}</p>
                            <p className="text-xs text-gray-500 mt-1">{lead.aiInsight}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">{lead.priorityScore}</div>
                            <div className="text-xs text-gray-500">Score</div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            {priority.badge}
                            {lead.isHotLead && (
                              <Badge className="bg-orange-500 text-white text-xs">🔥 Hot</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}