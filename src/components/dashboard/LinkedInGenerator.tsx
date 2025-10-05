import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Copy, Edit, Linkedin } from "lucide-react";

export function LinkedInGenerator() {
  const [inputData, setInputData] = useState({
    leadName: "",
    position: "",
    valueProp: ""
  });
  
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setInputData(prev => ({ ...prev, [field]: value }));
  };

  const generateMessage = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      const message = `Hi ${inputData.leadName},

I noticed your impressive work as ${inputData.position} and wanted to reach out. Your background in the industry really caught my attention.

I'm connecting with professionals like yourself who are focused on growth and innovation. ${inputData.valueProp ? `I believe our ${inputData.valueProp} could align well with your current initiatives.` : `I'd love to share some insights that might be valuable for your current projects.`}

Would you be open to connecting? I'd appreciate the opportunity to learn more about your work and share how we might be able to support your goals.

Best regards,
[Your Name]`;

      setGeneratedMessage(message);
      setIsGenerating(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMessage);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Input Card */}
      <Card className="shadow-lg border border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Linkedin className="w-5 h-5 mr-2 text-[#6C63FF]" />
            LinkedIn Message Input
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
            <label className="block mb-2 text-sm">Position/Title</label>
            <Input
              placeholder="e.g., VP of Sales, Marketing Director"
              value={inputData.position}
              onChange={(e) => handleInputChange("position", e.target.value)}
              className="h-12"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm">Value Proposition</label>
            <Textarea
              placeholder="What value can you offer? (optional)"
              value={inputData.valueProp}
              onChange={(e) => handleInputChange("valueProp", e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={generateMessage}
            disabled={!inputData.leadName || !inputData.position || isGenerating}
            className="w-full h-12 bg-[#6C63FF] hover:bg-[#5B54E6] text-white"
          >
            {isGenerating ? (
              <>
                <Linkedin className="w-4 h-4 mr-2 animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <Linkedin className="w-4 h-4 mr-2" />
                Generate LinkedIn Message
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Message Card */}
      <Card className="shadow-lg border border-gray-100">
        <CardHeader>
          <CardTitle>Generated LinkedIn Message</CardTitle>
        </CardHeader>
        <CardContent>
          {generatedMessage ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="text-sm text-gray-600 mb-2">LinkedIn Connection Request:</div>
                <div className="whitespace-pre-wrap text-sm text-gray-700">
                  {generatedMessage}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={copyToClipboard}
                  className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Message
                </Button>
                <Button variant="outline" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>

              <div className="text-xs text-gray-500 p-3 bg-blue-50 rounded-lg">
                💡 Tip: LinkedIn connection requests have a 300-character limit. This message is optimized for that constraint.
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Linkedin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Fill in the lead details and click "Generate LinkedIn Message" to create a personalized connection request.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}