import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TrendingUp, ArrowUpDown, Building2, RefreshCw } from "lucide-react";
import { ScoredLead, getLeadsFromStorage } from "../../lib/leadScoring";

export function ScoredLeadsOverview() {
  const [sortOrder, setSortOrder] = useState("high-to-low");
  const [leads, setLeads] = useState<ScoredLead[]>([]);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = () => {
    const storedLeads = getLeadsFromStorage();
    setLeads(storedLeads);
  };

  const getPriorityBadge = (score: number) => {
    if (score >= 80) return { badge: <Badge className="bg-[#6C63FF] text-white">High</Badge>, color: "purple" };
    if (score >= 60) return { badge: <Badge className="bg-[#4F46E5] text-white">Medium</Badge>, color: "blue" };
    return { badge: <Badge variant="secondary" className="bg-gray-300 text-gray-700">Low</Badge>, color: "gray" };
  };

  const sortedLeads = [...leads].sort((a, b) => {
    if (sortOrder === "high-to-low") return b.priorityScore - a.priorityScore;
    if (sortOrder === "low-to-high") return a.priorityScore - b.priorityScore;
    return a.company.localeCompare(b.company);
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-[#6C63FF]" />
              Scored Leads Overview ({leads.length} leads)
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={loadLeads}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-48">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-to-low">High → Low Score</SelectItem>
                  <SelectItem value="low-to-high">Low → High Score</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Leads List */}
      {leads.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg text-gray-600 mb-2">No scored leads yet</h3>
            <p className="text-gray-500">
              Go to "Generate Leads" to input leads and score them using AI
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedLeads.map((lead, index) => {
            const priority = getPriorityBadge(lead.priorityScore);
            
            return (
              <Card key={lead.id} className="shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-600" />
                      </div>
                      
                      <div>
                        <h3 className="text-lg">{lead.company}</h3>
                        <p className="text-sm text-gray-600">{lead.name} • {lead.industry}</p>
                        <p className="text-xs text-gray-500 mt-1">{lead.aiInsight}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Revenue: {lead.revenue} • Email: {lead.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-2xl text-gray-900">{lead.priorityScore}</div>
                        <div className="text-xs text-gray-500">Priority Score</div>
                        <div className="text-xs text-gray-400 mt-1">{formatTimeAgo(lead.createdAt)}</div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        {priority.badge}
                        {lead.isHotLead && (
                          <Badge className="bg-orange-500 text-white">🔥 Hot Lead</Badge>
                        )}
                        <Button 
                          size="sm" 
                          className="bg-[#6C63FF] hover:bg-[#5B54E6] text-white"
                        >
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {leads.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center p-6">
            <div className="text-2xl text-[#6C63FF] mb-2">
              {leads.filter(lead => lead.priorityScore >= 80).length}
            </div>
            <div className="text-sm text-gray-600">High Priority Leads</div>
          </Card>
          
          <Card className="text-center p-6">
            <div className="text-2xl text-[#4F46E5] mb-2">
              {leads.filter(lead => lead.priorityScore >= 60 && lead.priorityScore < 80).length}
            </div>
            <div className="text-sm text-gray-600">Medium Priority Leads</div>
          </Card>
          
          <Card className="text-center p-6">
            <div className="text-2xl text-gray-500 mb-2">
              {leads.length > 0 ? Math.round(leads.reduce((sum, lead) => sum + lead.priorityScore, 0) / leads.length) : 0}
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </Card>
        </div>
      )}
    </div>
  );
}