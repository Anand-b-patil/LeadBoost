import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Copy, Edit, Sparkles } from "lucide-react";

export function EmailGenerator() {
  const [inputData, setInputData] = useState({
    leadName: "",
    company: "",
    offer: ""
  });
  
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setInputData(prev => ({ ...prev, [field]: value }));
  };

  const generateEmail = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      const email = `Subject: Quick question about ${inputData.company}'s growth goals

Hi ${inputData.leadName},

I hope this email finds you well. I came across ${inputData.company} and was impressed by your recent growth trajectory.

I noticed that many companies like yours often face challenges with lead generation and conversion. That's exactly what we help solve at LeadBoost.

${inputData.offer ? `I'd love to discuss how ${inputData.offer} could specifically benefit ${inputData.company}.` : `I'd love to show you how we've helped similar companies increase their lead conversion by 40% on average.`}

Would you be open to a brief 15-minute call this week to explore how we might be able to help ${inputData.company} accelerate its growth?

Best regards,
[Your Name]

P.S. I've attached a brief case study of how we helped a company similar to ${inputData.company} achieve remarkable results.`;

      setGeneratedEmail(email);
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Input Card */}
      <Card className="shadow-lg border border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-[#6C63FF]" />
            Email Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block mb-2 text-sm">Lead Name</label>
            <Input
              placeholder="Enter lead's name"
              value={inputData.leadName}
              onChange={(e) => handleInputChange("leadName", e.target.value)}
              className="h-12"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm">Company</label>
            <Input
              placeholder="Enter company name"
              value={inputData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              className="h-12"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm">Your Offer (Optional)</label>
            <Textarea
              placeholder="Describe your product/service offer..."
              value={inputData.offer}
              onChange={(e) => handleInputChange("offer", e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={generateEmail}
            disabled={!inputData.leadName || !inputData.company || isGenerating}
            className="w-full h-12 bg-[#6C63FF] hover:bg-[#5B54E6] text-white"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Email
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Email Card */}
      <Card className="shadow-lg border border-gray-100">
        <CardHeader>
          <CardTitle>Generated Email</CardTitle>
        </CardHeader>
        <CardContent>
          {generatedEmail ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                  {generatedEmail}
                </pre>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={copyToClipboard}
                  className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button variant="outline" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Fill in the lead details and click "Generate AI Email" to create a personalized email.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}