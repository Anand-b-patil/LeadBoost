import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Download, Search, Filter, RefreshCw } from "lucide-react";
import { ScoredLead, getLeadsFromStorage } from "../../lib/leadScoring";
import { generateFromGemini } from "../../lib/api";

export function EnrichedLeadsTable() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [leads, setLeads] = useState<ScoredLead[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalContent, setModalContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = () => {
    const storedLeads = getLeadsFromStorage();
    setLeads(storedLeads);
  };

  const getPriorityBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-[#6C63FF] text-white">High</Badge>;
    if (score >= 60) return <Badge className="bg-[#4F46E5] text-white">Medium</Badge>;
    return <Badge variant="secondary">Low</Badge>;
  };

  const filteredLeads = leads.filter((lead: ScoredLead) => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    if (priorityFilter === "all") return matchesSearch;
    if (priorityFilter === "high") return matchesSearch && lead.priorityScore >= 80;
    if (priorityFilter === "medium") return matchesSearch && lead.priorityScore >= 60 && lead.priorityScore < 80;
    if (priorityFilter === "low") return matchesSearch && lead.priorityScore < 60;
    return matchesSearch;
  });

  // CSV export helper
  const exportLeadsToCSV = () => {
    if (leads.length === 0) return;
    const headers = [
      'Name', 'Company', 'Email', 'LinkedIn', 'Industry', 'Priority Score', 'Base Score', 'AI Score', 'Hot Lead', 'AI Insight'
    ];
    const rows = leads.map((lead: ScoredLead) => [
      lead.name,
      lead.company,
      lead.email,
      lead.linkedin,
      lead.industry,
      lead.priorityScore,
      lead.baseScore ?? '',
      lead.aiScore ?? '',
      lead.isHotLead ? 'Yes' : 'No',
      lead.aiInsight?.replace(/\n/g, ' ')
    ]);
    const csvContent = [headers, ...rows]
      .map((row: any[]) => row.map((field: any) => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Gemini message generation
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [detailsLead, setDetailsLead] = useState<ScoredLead | null>(null);

  const handleGenerateMessage = async (lead: ScoredLead, type: 'email' | 'linkedin') => {
    setModalOpen(true);
    setModalTitle(type === 'email' ? 'Generated Email' : 'Generated LinkedIn Message');
    setModalContent("");
    setLoading(true);
    let prompt = "";
    if (type === 'email') {
      prompt = `Write a friendly, personalized cold outreach email to ${lead.name} at ${lead.company}. Reference their company, role, and any recent news or company info. Make it concise and engaging.`;
    } else {
      prompt = `Write a personalized LinkedIn message to ${lead.name} at ${lead.company}, referencing their company, role, and any recent news or company info. Make it professional and concise.`;
    }
    try {
      const response = await generateFromGemini({ prompt, temperature: 0.7 });
      setModalContent(response.text || "No message generated.");
    } catch (err) {
      setModalContent("Error generating message.");
    }
    setLoading(false);
  };

  const openDetails = (lead: ScoredLead, e?: React.MouseEvent) => {
    if (e && e.stopPropagation) e.stopPropagation();
    console.log('openDetails called for', lead?.id || lead?.email || lead?.name);
    setDetailsLead(lead);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <h3 className="text-lg font-semibold mb-4">{modalTitle}</h3>
            {loading ? (
              <div className="text-gray-500">Generating...</div>
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-gray-800">{modalContent}</pre>
            )}
            <Button className="mt-4 w-full" onClick={() => setModalOpen(false)}>Close</Button>
          </div>
        </div>
      )}
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Enriched Leads ({leads.length} total)</span>
            <div className="flex items-center space-x-2">
              <Button
                onClick={loadLeads}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white" onClick={exportLeadsToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>LinkedIn</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Hot Lead</TableHead>
                  <TableHead>AI Insight</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      {leads.length === 0 ? "No leads found. Go to 'Generate Leads' to input and score leads." : "No leads match your current filters."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id} onDoubleClick={() => openDetails(lead)}>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>{lead.company}</TableCell>
                      <TableCell>
                        <span className="text-gray-500">-</span>
                      </TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>
                        {lead.linkedin ? (
                          <a href={lead.linkedin.startsWith('http') ? lead.linkedin : `https://${lead.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                            View Profile
                          </a>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>{lead.industry}</TableCell>
                      <TableCell>
                        <div>
                          {getPriorityBadge(lead.priorityScore)}
                          <div className="text-xs text-gray-500 mt-1">
                            {/** show base vs ai scores when available */}
                            {/** @ts-ignore */}
                            {lead.baseScore !== undefined && (
                              <span>base: {lead.baseScore}</span>
                            )}
                            {/** @ts-ignore */}
                            {lead.aiScore !== undefined && lead.aiScore !== null && (
                              <span className="ml-2">ai: {lead.aiScore}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.isHotLead && <Badge className="bg-orange-500 text-white">🔥 Hot</Badge>}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm text-gray-600 truncate" title={lead.aiInsight}>
                          {lead.aiInsight}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleGenerateMessage(lead, 'email')}>
                            Generate Email
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleGenerateMessage(lead, 'linkedin')}>
                            Generate LinkedIn
                          </Button>
                          <button className="text-sm text-[#4F46E5] hover:underline" onClick={(e) => openDetails(lead, e)}>
                            Details
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Details modal */}
      {detailsOpen && detailsLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <h3 className="text-lg font-semibold mb-4">Lead scoring details</h3>
            <div className="text-sm text-gray-700 mb-4">
              <div><strong>Name:</strong> {detailsLead.name}</div>
              <div><strong>Company:</strong> {detailsLead.company}</div>
              <div className="mt-2"><strong>Base score:</strong> {detailsLead.baseScore}</div>
              <div><strong>AI score:</strong> {detailsLead.aiScore ?? '—'}</div>
              <div><strong>Final priority:</strong> {detailsLead.priorityScore}</div>
            </div>
            <div className="text-sm text-gray-700">
              <div className="mb-2"><strong>Deterministic breakdown</strong></div>
              <div>Role: {detailsLead.baseBreakdown?.role}</div>
              <div>Company: {detailsLead.baseBreakdown?.company}</div>
              <div>Intent: {detailsLead.baseBreakdown?.intent}</div>
              <div>Contact quality: {detailsLead.baseBreakdown?.contact}</div>
              <div>Recency: {detailsLead.baseBreakdown?.recency}</div>
            </div>
            <Button className="mt-4 w-full" onClick={() => { setDetailsOpen(false); setDetailsLead(null); }}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}